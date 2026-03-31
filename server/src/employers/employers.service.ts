import type {
  CreateEmployerInput,
  Employer,
  IndustryType,
  UpdateEmployerInput,
} from '@regranted/shared';
import { checkIndustryEligibility } from '@regranted/shared';
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
        include: {
          eligibility: true,
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
      const visaType = await this.resolveUserVisaType(userId);
      const result = await this.checkEligibility(
        input.suburbId,
        input.industry,
        visaType,
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
      const visaType = await this.resolveUserVisaType(userId);
      const result = await this.checkEligibility(
        effectiveSuburbId,
        effectiveIndustry,
        visaType,
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
    visaType: string = '417',
  ): Promise<{ isEligible: boolean }> {
    const suburb = await this.prisma.suburb.findUnique({
      where: { id: suburbId },
    });

    if (!suburb) return { isEligible: false };

    const eligibility = await this.prisma.postcodeEligibility.findUnique({
      where: {
        postcode_visaType: { postcode: suburb.postcode, visaType },
      },
    });

    if (!eligibility) return { isEligible: false };

    const isEligible = checkIndustryEligibility(
      industry,
      visaType as '417' | '462',
      eligibility,
    );

    return { isEligible };
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

  private async resolveUserVisaType(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { whvType: true },
    });

    return user?.whvType ?? '417';
  }

  private mapToResponse(employer: EmployerWithSuburb): Employer {
    const suburb = employer.suburb;
    // Find eligibility for 417 by default (display purposes)
    const eligibility =
      suburb?.postcodeRef?.eligibility?.find((e) => e.visaType === '417') ??
      suburb?.postcodeRef?.eligibility?.[0] ??
      null;

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
            postcodeData: eligibility
              ? {
                  isRemoteVeryRemote: eligibility.isRemoteVeryRemote,
                  isNorthernAustralia: eligibility.isNorthernAustralia,
                  isRegionalAustralia: eligibility.isRegionalAustralia,
                  isBushfireDeclared: eligibility.isBushfireDeclared,
                  isNaturalDisasterDeclared:
                    eligibility.isNaturalDisasterDeclared,
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
