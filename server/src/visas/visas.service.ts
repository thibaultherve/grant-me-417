import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import type {
  UserVisa,
  VisaWeeklyProgress as WeeklyRecord,
} from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { VisaProgressService } from './visa-progress.service.js';
import type {
  CreateVisaInput,
  UpdateVisaInput,
  Visa,
  VisaType,
  WeeklyProgress,
} from '@get-granted/shared';
import { computeExpiryDate, getDaysRequired } from '@get-granted/shared';
import {
  formatDateNullable,
  formatTimestamp,
  toNumber,
} from '../common/utils/format.js';

@Injectable()
export class VisasService {
  constructor(
    private prisma: PrismaService,
    private visaProgress: VisaProgressService,
  ) {}

  async findAll(userId: string): Promise<Visa[]> {
    const visas = await this.prisma.userVisa.findMany({
      where: { userId },
      orderBy: { arrivalDate: 'desc' },
    });

    return visas.map(this.mapToResponse);
  }

  async findByType(userId: string, visaType: string): Promise<Visa> {
    const visa = await this.prisma.userVisa.findFirst({
      where: { userId, visaType },
    });

    if (!visa) {
      throw new NotFoundException('Visa not found');
    }

    return this.mapToResponse(visa);
  }

  async create(userId: string, input: CreateVisaInput): Promise<Visa> {
    const arrivalDate = new Date(input.arrivalDate);

    // Check for duplicate visa type
    const existing = await this.prisma.userVisa.findUnique({
      where: {
        userId_visaType: {
          userId,
          visaType: input.visaType,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `You already have a ${input.visaType} visa`,
      );
    }

    // Validate no overlapping visa periods
    await this.validateNoOverlap(userId, arrivalDate);

    const daysRequired = getDaysRequired(input.visaType);
    const expiryDate = computeExpiryDate(arrivalDate);

    const visa = await this.prisma.userVisa.create({
      data: {
        userId,
        visaType: input.visaType,
        arrivalDate,
        expiryDate,
        daysRequired,
      },
    });

    // Generate all weekly progress rows
    await this.visaProgress.generateWeeklyRows(visa.id);

    // Recalculate progress (in case there are existing work entries)
    await this.visaProgress.refreshAllWeeksForVisa(visa.id);

    // Re-fetch to get updated progress fields computed by refreshAllWeeksForVisa
    const updated = await this.prisma.userVisa.findUnique({
      where: { id: visa.id },
    });

    return this.mapToResponse(updated!);
  }

  async update(
    userId: string,
    id: string,
    input: UpdateVisaInput,
  ): Promise<Visa> {
    const existing = await this.prisma.userVisa.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Visa not found');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('You do not own this visa');
    }

    const arrivalDate = new Date(input.arrivalDate);
    const expiryDate = computeExpiryDate(arrivalDate);

    // Validate no overlapping visa periods (exclude current visa)
    await this.validateNoOverlap(userId, arrivalDate, id);

    await this.prisma.userVisa.update({
      where: { id },
      data: { arrivalDate, expiryDate },
    });

    // Regenerate weekly rows (date range changed)
    await this.visaProgress.generateWeeklyRows(id);
    await this.visaProgress.refreshAllWeeksForVisa(id);

    // Re-fetch to get updated progress fields computed by refreshAllWeeksForVisa
    const updated = await this.prisma.userVisa.findUnique({
      where: { id },
    });

    return this.mapToResponse(updated!);
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const existing = await this.prisma.userVisa.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Visa not found');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('You do not own this visa');
    }

    // Weekly progress rows cascade-deleted via FK
    await this.prisma.userVisa.delete({ where: { id } });

    return { message: 'Visa deleted successfully' };
  }

  async getWeeklyProgress(
    userId: string,
    visaId: string,
  ): Promise<WeeklyProgress[]> {
    const visa = await this.prisma.userVisa.findUnique({
      where: { id: visaId },
    });

    if (!visa) {
      throw new NotFoundException('Visa not found');
    }
    if (visa.userId !== userId) {
      throw new ForbiddenException('You do not own this visa');
    }

    const rows = await this.prisma.visaWeeklyProgress.findMany({
      where: { userVisaId: visaId },
      orderBy: { weekStartDate: 'asc' },
    });

    return rows.map(this.mapWeeklyToResponse);
  }

  // ─── Validation ─────────────────────────────────────────────────────────

  /**
   * Validate that a new/updated visa arrival_date does not overlap
   * with any existing visa's [arrival_date, expiry_date] range.
   */
  private async validateNoOverlap(
    userId: string,
    arrivalDate: Date,
    excludeVisaId?: string,
  ) {
    const expiryDate = computeExpiryDate(arrivalDate);

    const visas = await this.prisma.userVisa.findMany({
      where: {
        userId,
        ...(excludeVisaId && { id: { not: excludeVisaId } }),
      },
    });

    for (const visa of visas) {
      if (!visa.expiryDate) continue;

      // Check overlap: new [arrival, expiry] intersects existing [arrival, expiry]
      const existingStart = visa.arrivalDate;
      const existingEnd = visa.expiryDate;

      if (arrivalDate <= existingEnd && expiryDate >= existingStart) {
        throw new ConflictException(
          `Visa period overlaps with existing ${visa.visaType} (${existingStart.toISOString().split('T')[0]} → ${existingEnd.toISOString().split('T')[0]})`,
        );
      }
    }
  }

  // ─── Response Mapping ───────────────────────────────────────────────────

  private mapToResponse(visa: UserVisa): Visa {
    return {
      id: visa.id,
      userId: visa.userId,
      visaType: visa.visaType as VisaType,
      arrivalDate: formatDateNullable(visa.arrivalDate),
      expiryDate: formatDateNullable(visa.expiryDate),
      daysRequired: visa.daysRequired,
      eligibleDays: visa.eligibleDays,
      daysWorked: visa.daysWorked,
      progressPercentage: toNumber(visa.progressPercentage),
      isEligible: visa.isEligible ?? false,
      daysRemaining: visa.daysRemaining,
      createdAt: formatTimestamp(visa.createdAt),
      updatedAt: formatTimestamp(visa.updatedAt),
    };
  }

  private mapWeeklyToResponse(row: WeeklyRecord): WeeklyProgress {
    return {
      id: row.id,
      userVisaId: row.userVisaId,
      weekStartDate: formatDateNullable(row.weekStartDate),
      weekEndDate: formatDateNullable(row.weekEndDate),
      hours: toNumber(row.hours),
      eligibleHours: toNumber(row.eligibleHours),
      eligibleDays: row.eligibleDays,
      daysWorked: row.daysWorked,
      createdAt: formatTimestamp(row.createdAt),
      updatedAt: formatTimestamp(row.updatedAt),
    };
  }
}
