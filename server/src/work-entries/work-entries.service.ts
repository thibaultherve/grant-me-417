import type {
  HoursList,
  IndustryType,
  MonthHours,
  SaveWeekBatch,
  VisaType,
  WeekEmployerEntry,
  WeekEntriesResponse,
  WeeklyEmployer,
  WeeklyHoursResponse,
  WorkEntryWithEmployer,
} from '@regranted/shared';
import { MAX_HOURS_PER_DAY } from '@regranted/shared';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
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
    const progressByWeek = new Map<string, typeof weeklyProgress>();
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
        dailyTotals[dateKey] =
          Math.round(((dailyTotals[dateKey] ?? 0) + hours) * 100) / 100;
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
        emp.dailyHours[dateKey] =
          Math.round(((emp.dailyHours[dateKey] ?? 0) + hours) * 100) / 100;
        emp.totalHours = Math.round((emp.totalHours + hours) * 100) / 100;
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
        totalHours: Math.round(totalHours * 100) / 100,
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
   * Get all employers with their hours for a specific week.
   * Returns every employer (even those with 0 hours) so the UI shows all cards.
   */
  async getWeekEntries(
    userId: string,
    weekStart: string,
  ): Promise<WeekEntriesResponse> {
    const monday = new Date(weekStart);

    // Validate weekStart is a Monday
    if (monday.getUTCDay() !== 1) {
      throw new BadRequestException('weekStart must be a Monday');
    }

    const sunday = new Date(monday);
    sunday.setUTCDate(sunday.getUTCDate() + 6);

    // 2 parallel queries: all employers + work entries for the week
    const [employers, entries] = await Promise.all([
      this.prisma.employer.findMany({
        where: { userId },
        select: { id: true, name: true, industry: true, isEligible: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workEntry.findMany({
        where: {
          userId,
          workDate: { gte: monday, lte: sunday },
        },
        select: { employerId: true, workDate: true, hours: true },
      }),
    ]);

    // Group entries by employerId -> dateKey -> hours
    const entryMap = new Map<string, Record<string, number>>();
    for (const entry of entries) {
      const dateKey = formatDate(entry.workDate);
      let employerHours = entryMap.get(entry.employerId);
      if (!employerHours) {
        employerHours = {};
        entryMap.set(entry.employerId, employerHours);
      }
      employerHours[dateKey] = toNumber(entry.hours);
    }

    // Build response with all employers
    const employerEntries: WeekEmployerEntry[] = employers.map((emp) => {
      const hours = entryMap.get(emp.id) ?? {};
      const total =
        Math.round(Object.values(hours).reduce((sum, h) => sum + h, 0) * 100) /
        100;
      return {
        employerId: emp.id,
        employerName: emp.name,
        industry: emp.industry as IndustryType,
        isEligible: emp.isEligible ?? false,
        hours,
        total,
      };
    });

    return { weekStart, employers: employerEntries };
  }

  /**
   * Batch save hours for multiple employers in a single week.
   * Validates cross-employer 24h/day limit, then delete+create within a transaction.
   */
  async saveWeekBatch(
    userId: string,
    input: SaveWeekBatch,
  ): Promise<WeekEntriesResponse> {
    const { weekStart, entries } = input;
    const monday = new Date(weekStart);

    // Validate weekStart is a Monday
    if (monday.getUTCDay() !== 1) {
      throw new BadRequestException('weekStart must be a Monday');
    }

    const sunday = new Date(monday);
    sunday.setUTCDate(sunday.getUTCDate() + 6);
    const mondayKey = formatDate(monday);
    const sundayKey = formatDate(sunday);

    // Validate all employerIds belong to the user
    const employerIds = entries.map((e) => e.employerId);
    const employers = await this.prisma.employer.findMany({
      where: { id: { in: employerIds }, userId },
      select: { id: true },
    });
    const ownedIds = new Set(employers.map((e) => e.id));
    for (const entry of entries) {
      if (!ownedIds.has(entry.employerId)) {
        throw new ForbiddenException(
          `Employer ${entry.employerId} not found or not owned`,
        );
      }
    }

    // Validate all date keys fall within the week
    for (const entry of entries) {
      for (const dateKey of Object.keys(entry.hours)) {
        if (dateKey < mondayKey || dateKey > sundayKey) {
          throw new BadRequestException(
            `Date ${dateKey} is outside the week ${weekStart}`,
          );
        }
      }
    }

    // Cross-employer 24h/day validation
    const dailyTotals: Record<string, number> = {};
    for (const entry of entries) {
      for (const [dateKey, hours] of Object.entries(entry.hours)) {
        dailyTotals[dateKey] = (dailyTotals[dateKey] ?? 0) + hours;
      }
    }
    const violations: string[] = [];
    for (const [dateKey, total] of Object.entries(dailyTotals)) {
      if (total > MAX_HOURS_PER_DAY) {
        violations.push(`${dateKey}: ${total}h exceeds ${MAX_HOURS_PER_DAY}h`);
      }
    }
    if (violations.length > 0) {
      throw new BadRequestException(
        `Daily hours exceed ${MAX_HOURS_PER_DAY}h limit: ${violations.join(', ')}`,
      );
    }

    // Transaction: delete old entries + create new ones for each employer
    await this.prisma.$transaction(async (tx) => {
      for (const entry of entries) {
        // Delete all existing entries for this employer in this week
        await tx.workEntry.deleteMany({
          where: {
            userId,
            employerId: entry.employerId,
            workDate: { gte: monday, lte: sunday },
          },
        });

        // Create new entries for days with hours > 0
        const toCreate = Object.entries(entry.hours)
          .filter(([, hours]) => hours > 0)
          .map(([dateKey, hours]) => ({
            userId,
            employerId: entry.employerId,
            workDate: new Date(dateKey),
            hours,
          }));

        if (toCreate.length > 0) {
          await tx.workEntry.createMany({ data: toCreate });
        }
      }
    });

    // Collect all affected dates for visa progress recalculation
    const affectedDates: Date[] = [];
    for (const entry of entries) {
      for (const dateKey of Object.keys(entry.hours)) {
        affectedDates.push(new Date(dateKey));
      }
    }
    // Also include dates that may have had entries deleted (full week range)
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setUTCDate(d.getUTCDate() + i);
      affectedDates.push(d);
    }

    // Batch recalculate visa progress
    await this.visaProgress.refreshWeeksForDates(userId, affectedDates);

    // Return fresh data
    return this.getWeekEntries(userId, weekStart);
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
