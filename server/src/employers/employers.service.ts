import type {
  CreateEmployerInput,
  Employer,
  IndustryType,
  UpdateEmployerInput,
} from '@regranted/shared';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { formatTimestamp } from '../common/utils/format.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { VisaProgressService } from '../visas/visa-progress.service.js';

const EMPLOYER_INCLUDE = {
  suburb: {
    include: {
      postcodeRef: {
        select: {
          isRemoteVeryRemote: true,
          isNorthernAustralia: true,
          isRegionalAustralia: true,
          isBushfireDeclared: true,
          isNaturalDisasterDeclared: true,
        },
      },
    },
  },
} as const;

type EmployerWithSuburb = Prisma.EmployerGetPayload<{
  include: typeof EMPLOYER_INCLUDE;
}>;

@Injectable()
export class EmployersService {
  constructor(
    private prisma: PrismaService,
    private visaProgress: VisaProgressService,
  ) {}

  async findAll(userId: string): Promise<Employer[]> {
    const employers = await this.prisma.employer.findMany({
      where: { userId },
      include: EMPLOYER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return employers.map((e) => this.mapToResponse(e));
  }

  async findOne(userId: string, id: string): Promise<Employer> {
    const employer = await this.prisma.employer.findUnique({
      where: { id },
      include: EMPLOYER_INCLUDE,
    });

    if (!employer) {
      throw new NotFoundException('Employer not found');
    }
    if (employer.userId !== userId) {
      throw new ForbiddenException('You do not own this employer');
    }

    return this.mapToResponse(employer);
  }

  async create(userId: string, input: CreateEmployerInput): Promise<Employer> {
    const eligibilityMode = input.eligibilityMode ?? 'automatic';

    let isEligible: boolean;
    if (eligibilityMode === 'automatic') {
      const result = await this.checkEligibility(
        input.suburbId,
        input.industry,
      );
      isEligible = result.isEligible;
    } else {
      isEligible = input.isEligible ?? true;
    }

    const employer = await this.prisma.employer.create({
      data: {
        userId,
        name: input.name,
        industry: input.industry,
        suburbId: input.suburbId,
        isEligible,
        eligibilityMode,
      },
      include: EMPLOYER_INCLUDE,
    });

    return this.mapToResponse(employer);
  }

  async update(
    userId: string,
    id: string,
    input: UpdateEmployerInput,
  ): Promise<Employer> {
    const existing = await this.prisma.employer.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Employer not found');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('You do not own this employer');
    }

    const effectiveMode = input.eligibilityMode ?? existing.eligibilityMode;
    const effectiveSuburbId = input.suburbId ?? existing.suburbId;
    const effectiveIndustry = (input.industry ??
      existing.industry) as IndustryType;

    let newIsEligible: boolean;
    if (effectiveMode === 'automatic' && effectiveSuburbId) {
      const result = await this.checkEligibility(
        effectiveSuburbId,
        effectiveIndustry,
      );
      newIsEligible = result.isEligible;
    } else if (effectiveMode === 'automatic') {
      newIsEligible = existing.isEligible;
    } else {
      newIsEligible = input.isEligible ?? existing.isEligible;
    }

    const eligibilityChanged = newIsEligible !== existing.isEligible;

    const employer = await this.prisma.employer.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.industry !== undefined && { industry: input.industry }),
        ...(input.suburbId !== undefined && { suburbId: input.suburbId }),
        ...(input.eligibilityMode !== undefined && {
          eligibilityMode: input.eligibilityMode,
        }),
        isEligible: newIsEligible,
      },
      include: EMPLOYER_INCLUDE,
    });

    // Recalculate all visa progress when employer eligibility changes
    if (eligibilityChanged) {
      await this.visaProgress.recalculateAllVisasForUser(userId);
    }

    return this.mapToResponse(employer);
  }

  async checkEligibility(
    suburbId: number,
    industry: IndustryType,
  ): Promise<{ isEligible: boolean }> {
    const suburb = await this.prisma.suburb.findUnique({
      where: { id: suburbId },
      include: { postcodeRef: true },
    });

    if (!suburb?.postcodeRef) return { isEligible: false };

    const {
      isNorthernAustralia,
      isRemoteVeryRemote,
      isRegionalAustralia,
      isBushfireDeclared,
      isNaturalDisasterDeclared,
    } = suburb.postcodeRef;

    const rules: Record<IndustryType, boolean> = {
      hospitality_and_tourism:
        (isNorthernAustralia ?? false) || (isRemoteVeryRemote ?? false),
      plant_and_animal_cultivation: isRegionalAustralia ?? false,
      fishing_and_pearling: isRegionalAustralia ?? false,
      tree_farming_and_felling: isRegionalAustralia ?? false,
      mining: isRegionalAustralia ?? false,
      construction: isRegionalAustralia ?? false,
      bushfire_recovery_work: isBushfireDeclared ?? false,
      weather_recovery_work: isNaturalDisasterDeclared ?? false,
      critical_covid19_work: true,
      other: false,
    };

    return { isEligible: rules[industry] ?? false };
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const existing = await this.prisma.employer.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Employer not found');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('You do not own this employer');
    }

    await this.prisma.employer.delete({ where: { id } });

    return { message: 'Employer deleted successfully' };
  }

  private mapToResponse(employer: EmployerWithSuburb): Employer {
    const suburb = employer.suburb;
    return {
      id: employer.id,
      name: employer.name,
      industry: employer.industry,
      suburbId: employer.suburbId ?? 0,
      suburb: suburb
        ? {
            id: suburb.id,
            suburbName: suburb.suburbName,
            postcode: suburb.postcode,
            stateCode: suburb.stateCode,
            postcodeData: suburb.postcodeRef
              ? {
                  isRemoteVeryRemote:
                    suburb.postcodeRef.isRemoteVeryRemote ?? false,
                  isNorthernAustralia:
                    suburb.postcodeRef.isNorthernAustralia ?? false,
                  isRegionalAustralia:
                    suburb.postcodeRef.isRegionalAustralia ?? false,
                  isBushfireDeclared:
                    suburb.postcodeRef.isBushfireDeclared ?? false,
                  isNaturalDisasterDeclared:
                    suburb.postcodeRef.isNaturalDisasterDeclared ?? false,
                }
              : null,
          }
        : {
            id: 0,
            suburbName: '',
            postcode: '',
            stateCode: '',
            postcodeData: null,
          },
      isEligible: employer.isEligible ?? true,
      eligibilityMode:
        employer.eligibilityMode === 'manual' ? 'manual' : 'automatic',
      userId: employer.userId,
      createdAt: formatTimestamp(employer.createdAt),
      updatedAt: formatTimestamp(employer.updatedAt),
    };
  }
}
