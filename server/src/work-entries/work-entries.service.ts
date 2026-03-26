import type {
  HoursList,
  IndustryType,
  MonthHours,
  SaveWeekHoursInput,
  VisaType,
  WeeklyEmployer,
  WeeklyHoursResponse,
  WorkEntryWithEmployer,
} from '@regranted/shared';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { getWeekRanges } from '../common/utils/date.js';
import {
  formatDate,
  formatTimestamp,
  toNumber,
} from '../common/utils/format.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { VisaProgressService } from '../visas/visa-progress.service.js';

const ENTRY_EMPLOYER_INCLUDE = {
  employer: {
    select: { name: true, industry: true, isEligible: true },
  },
} as const;

type WorkEntryWithEmployerRecord = Prisma.WorkEntryGetPayload<{
  include: typeof ENTRY_EMPLOYER_INCLUDE;
}>;

@Injectable()
export class WorkEntriesService {
  constructor(
    private prisma: PrismaService,
    private visaProgress: VisaProgressService,
  ) {}

  /**
   * List work entries with pagination, sorting, and employer join.
   *
   */
  async findAll(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      sortField?: string;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ): Promise<HoursList> {
    const {
      page = 1,
      limit = 10,
      sortField = 'workDate',
      sortOrder = 'desc',
    } = options;
    const skip = (page - 1) * limit;

    const orderBy = this.buildOrderBy(sortField, sortOrder);

    const [entries, total] = await Promise.all([
      this.prisma.workEntry.findMany({
        where: { userId },
        include: ENTRY_EMPLOYER_INCLUDE,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.workEntry.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: entries.map((entry) => this.mapToResponseWithEmployer(entry)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get month hours grouped by day for calendar display.
   * Returns Record<dateKey, DayHoursEntry[]>.
   */
  async getMonthHours(
    userId: string,
    year: number,
    month: number,
  ): Promise<MonthHours> {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0)); // last day of month

    const entries = await this.prisma.workEntry.findMany({
      where: {
        userId,
        workDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        employer: {
          select: { name: true },
        },
      },
      orderBy: [{ workDate: 'asc' }, { employer: { name: 'asc' } }],
    });

    const result: MonthHours = {};

    for (const entry of entries) {
      const dateKey = formatDate(entry.workDate);
      const dayEntry = {
        employerName: entry.employer.name,
        hours: toNumber(entry.hours),
      };

      if (!result[dateKey]) {
        result[dateKey] = [];
      }
      result[dateKey].push(dayEntry);
    }

    return result;
  }

  /**
   * Get weekly hours breakdown for a month.
   * Returns week rows with employer breakdown, visa progress, and daily totals.
   * 3 DB queries: visas, work_entries+employer, visa_weekly_progress.
   */
  async getWeeklyHours(
    userId: string,
    year: number,
    month: number,
  ): Promise<WeeklyHoursResponse> {
    // Date range: full month
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 0)); // last day of month

    // Get week ranges (Mon-Sun) overlapping the month (includes boundary weeks)
    const weeks = getWeekRanges(monthStart, monthEnd);

    // Overall date range from first week start to last week end
    const rangeStart = weeks[0].start;
    const rangeEnd = weeks[weeks.length - 1].end;

    // 3 parallel DB queries
    const [visas, entries, weeklyProgress] = await Promise.all([
      // 1. All user visas
      this.prisma.userVisa.findMany({
        where: { userId },
        select: {
          id: true,
          visaType: true,
          arrivalDate: true,
          expiryDate: true,
        },
      }),
      // 2. All work entries in range with employer data
      this.prisma.workEntry.findMany({
        where: {
          userId,
          workDate: { gte: rangeStart, lte: rangeEnd },
        },
        include: {
          employer: {
            select: {
              id: true,
              name: true,
              industry: true,
              isEligible: true,
            },
          },
        },
        orderBy: { workDate: 'asc' },
      }),
      // 3. Visa weekly progress for all user visas in range
      this.prisma.visaWeeklyProgress.findMany({
        where: {
          userVisa: { userId },
          weekStartDate: { gte: rangeStart, lte: rangeEnd },
        },
        include: {
          userVisa: {
            select: { id: true, visaType: true },
          },
        },
      }),
    ]);

    // Index weekly progress by weekStartDate key
    const progressByWeek = new Map<
      string,
      typeof weeklyProgress
    >();
    for (const row of weeklyProgress) {
      const key = formatDate(row.weekStartDate);
      const bucket = progressByWeek.get(key);
      if (bucket) {
        bucket.push(row);
      } else {
        progressByWeek.set(key, [row]);
      }
    }

    // Build response weeks
    const responseWeeks = weeks.map(({ start, end }) => {
      const weekStartKey = formatDate(start);
      const weekEndKey = formatDate(end);

      // Generate 7 date keys for this week
      const dates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setUTCDate(d.getUTCDate() + i);
        dates.push(formatDate(d));
      }

      // Filter entries for this week
      const weekEntries = entries.filter((e) => {
        const dateKey = formatDate(e.workDate);
        return dateKey >= weekStartKey && dateKey <= weekEndKey;
      });

      // Group by employer
      const employerMap = new Map<string, WeeklyEmployer>();

      const dailyTotals: Record<string, number> = {};
      let totalHours = 0;

      for (const entry of weekEntries) {
        const dateKey = formatDate(entry.workDate);
        const hours = toNumber(entry.hours);

        // Daily totals
        dailyTotals[dateKey] = (dailyTotals[dateKey] ?? 0) + hours;
        totalHours += hours;

        // Employer breakdown
        const empId = entry.employer.id;
        let emp = employerMap.get(empId);
        if (!emp) {
          emp = {
            employerId: empId,
            employerName: entry.employer.name,
            industry: entry.employer.industry as IndustryType,
            isEligible: entry.employer.isEligible ?? false,
            totalHours: 0,
            dailyHours: {},
          };
          employerMap.set(empId, emp);
        }
        emp.dailyHours[dateKey] = (emp.dailyHours[dateKey] ?? 0) + hours;
        emp.totalHours += hours;
      }

      // Visa breakdown from pre-computed weekly progress
      const progressRows = progressByWeek.get(weekStartKey) ?? [];
      const visaBreakdown = progressRows.map((row) => ({
        visaId: row.userVisa.id,
        visaType: row.userVisa.visaType as VisaType,
        eligibleHours: toNumber(row.eligibleHours),
        eligibleDays: row.eligibleDays,
        daysWorked: row.daysWorked,
      }));

      return {
        weekStart: weekStartKey,
        weekEnd: weekEndKey,
        dates,
        totalHours,
        visaBreakdown,
        employers: Array.from(employerMap.values()),
        dailyTotals,
      };
    });

    // Visa info for bar coloring
    const visaInfos = visas.map((v) => ({
      id: v.id,
      visaType: v.visaType as VisaType,
      arrivalDate: formatDate(v.arrivalDate),
      expiryDate: v.expiryDate ? formatDate(v.expiryDate) : '',
    }));

    return {
      weeks: responseWeeks,
      visas: visaInfos,
    };
  }

  /**
   * Smart upsert/delete for week hours.
   * - hours > 0: upsert (create or update)
   * - hours === 0 and exists in DB: delete
   * Then recalculate visa progress for affected dates.
   */
  async saveWeekHours(
    userId: string,
    input: SaveWeekHoursInput,
  ): Promise<{ deleted: number; saved: number }> {
    const { employerId, entries } = input;

    // Verify employer ownership
    const employer = await this.prisma.employer.findUnique({
      where: { id: employerId },
    });

    if (!employer) {
      throw new NotFoundException('Employer not found');
    }
    if (employer.userId !== userId) {
      throw new ForbiddenException('You do not own this employer');
    }

    const workDates = entries.map((e) => new Date(e.workDate));

    // Find existing entries for these dates
    const existing = await this.prisma.workEntry.findMany({
      where: {
        userId,
        employerId,
        workDate: { in: workDates },
      },
    });
    const existingByDate = new Map(
      existing.map((e) => [formatDate(e.workDate), e]),
    );

    const toUpsert = entries.filter((e) => e.hours > 0);
    const toDelete = entries.filter(
      (e) => e.hours === 0 && existingByDate.has(e.workDate),
    );

    // Delete entries with 0 hours that exist
    if (toDelete.length > 0) {
      await this.prisma.workEntry.deleteMany({
        where: {
          userId,
          employerId,
          workDate: { in: toDelete.map((e) => new Date(e.workDate)) },
        },
      });
    }

    // Batch upsert entries with hours > 0 (single SQL query instead of N upserts)
    if (toUpsert.length > 0) {
      const valueFragments = toUpsert.map(
        (entry) =>
          Prisma.sql`(gen_random_uuid(), ${userId}::uuid, ${employerId}::uuid, ${new Date(entry.workDate)}::date, ${entry.hours}::decimal, NOW(), NOW())`,
      );

      await this.prisma.$executeRaw`
        INSERT INTO work_entries (id, user_id, employer_id, work_date, hours, created_at, updated_at)
        VALUES ${Prisma.join(valueFragments)}
        ON CONFLICT (user_id, employer_id, work_date)
        DO UPDATE SET hours = EXCLUDED.hours, updated_at = NOW()
      `;
    }

    // Collect affected dates for batch progress recalculation
    const affectedDates: Date[] = [];
    for (const entry of entries) {
      if (entry.hours > 0 || existingByDate.has(entry.workDate)) {
        affectedDates.push(new Date(entry.workDate));
      }
    }

    // Batch recalculate visa progress (replaces N+1 loop)
    await this.visaProgress.refreshWeeksForDates(userId, affectedDates);

    return { deleted: toDelete.length, saved: toUpsert.length };
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private buildOrderBy(sortField: string, sortOrder: 'asc' | 'desc') {
    switch (sortField) {
      case 'workDate':
        return { workDate: sortOrder } as const;
      case 'hours':
        return { hours: sortOrder } as const;
      case 'employerName':
        return { employer: { name: sortOrder } } as const;
      case 'industry':
        return { employer: { industry: sortOrder } } as const;
      case 'isEligible':
        return { employer: { isEligible: sortOrder } } as const;
      default:
        return { workDate: 'desc' } as const;
    }
  }

  private mapToResponseWithEmployer(
    entry: WorkEntryWithEmployerRecord,
  ): WorkEntryWithEmployer {
    return {
      id: entry.id,
      userId: entry.userId,
      employerId: entry.employerId,
      workDate: formatDate(entry.workDate),
      hours: toNumber(entry.hours),
      createdAt: formatTimestamp(entry.createdAt),
      updatedAt: formatTimestamp(entry.updatedAt),
      employerName: entry.employer.name,
      industry: entry.employer.industry,
      isEligible: entry.employer.isEligible ?? false,
    };
  }
}
