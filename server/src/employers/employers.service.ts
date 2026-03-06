import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { VisaProgressService } from '../visas/visa-progress.service.js';
import type {
  CreateEmployerInput,
  UpdateEmployerInput,
  Employer,
} from '@get-granted/shared';
import { formatTimestamp } from '../common/utils/format.js';

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

    return employers.map(this.mapToResponse);
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
    const employer = await this.prisma.employer.create({
      data: {
        userId,
        name: input.name,
        industry: input.industry,
        suburbId: input.suburbId,
        isEligible: input.isEligible ?? true,
      },
      include: EMPLOYER_INCLUDE,
    });

    return this.mapToResponse(employer);
  }

  async update(userId: string, id: string, input: UpdateEmployerInput): Promise<Employer> {
    const existing = await this.prisma.employer.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Employer not found');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('You do not own this employer');
    }

    const eligibilityChanged =
      input.isEligible !== undefined &&
      input.isEligible !== existing.isEligible;

    const employer = await this.prisma.employer.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.industry !== undefined && { industry: input.industry }),
        ...(input.suburbId !== undefined && { suburbId: input.suburbId }),
        ...(input.isEligible !== undefined && { isEligible: input.isEligible }),
      },
      include: EMPLOYER_INCLUDE,
    });

    // Recalculate all visa progress when employer eligibility changes
    if (eligibilityChanged) {
      await this.visaProgress.recalculateAllVisasForUser(userId);
    }

    return this.mapToResponse(employer);
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
      userId: employer.userId,
      createdAt: formatTimestamp(employer.createdAt),
      updatedAt: formatTimestamp(employer.updatedAt),
    };
  }
}
