import { HOUR_TO_DAY_THRESHOLDS, getDaysRequired } from '@regranted/shared';
import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { getWeekForDate, getWeekRanges } from '../common/utils/date.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class VisaProgressService {
  constructor(private prisma: PrismaService) {}

  /**
   * Convert weekly eligible hours to eligible days using WHV 417 thresholds.
   * Thresholds (descending): >=30h→7d, >=24h→4d, >=18h→3d, >=12h→2d, >=6h→1d, <6h→0d
   */
  hoursToEligibleDays(weeklyHours: number): number {
    for (const threshold of HOUR_TO_DAY_THRESHOLDS) {
      if (weeklyHours >= threshold.minHours) {
        return threshold.eligibleDays;
      }
    }
    return 0;
  }

  /**
   * Calculate a single week's progress for a visa.
   * Sums work_entries within the week, filtering by visa date range.
   * Returns { hours, eligibleHours, eligibleDays, daysWorked }.
   */
  async calculateWeeklyProgress(
    visaId: string,
    weekStartDate: Date,
    weekEndDate: Date,
  ) {
    const visa = await this.prisma.userVisa.findUnique({
      where: { id: visaId },
    });

    if (!visa) {
      return { hours: 0, eligibleHours: 0, eligibleDays: 0, daysWorked: 0 };
    }

    // Clamp week boundaries to visa date range
    const visaStart = visa.arrivalDate;
    const visaEnd = visa.expiryDate;
    const effectiveStart =
      visaStart && weekStartDate < visaStart ? visaStart : weekStartDate;
    const effectiveEnd =
      visaEnd && weekEndDate > visaEnd ? visaEnd : weekEndDate;

    if (effectiveStart > effectiveEnd) {
      return { hours: 0, eligibleHours: 0, eligibleDays: 0, daysWorked: 0 };
    }

    // Fetch work entries for this user within the effective date range
    const entries = await this.prisma.workEntry.findMany({
      where: {
        userId: visa.userId,
        workDate: {
          gte: effectiveStart,
          lte: effectiveEnd,
        },
      },
      include: {
        employer: {
          select: { isEligible: true },
        },
      },
    });

    let totalHours = 0;
    let eligibleHours = 0;
    const workedDates = new Set<string>();

    for (const entry of entries) {
      const hours = Number(entry.hours);
      totalHours += hours;
      if (entry.employer.isEligible) {
        eligibleHours += hours;
      }
      workedDates.add(entry.workDate.toISOString().split('T')[0]);
    }

    totalHours = Math.round(totalHours * 100) / 100;
    eligibleHours = Math.round(eligibleHours * 100) / 100;
    const eligibleDays = this.hoursToEligibleDays(eligibleHours);
    const daysWorked = workedDates.size;

    return { hours: totalHours, eligibleHours, eligibleDays, daysWorked };
  }

  /**
   * Recalculate all visa aggregate progress (eligible_days, days_worked)
   * by summing all weekly progress rows.
   */
  async calculateVisaProgress(visaId: string) {
    const visa = await this.prisma.userVisa.findUnique({
      where: { id: visaId },
    });

    if (!visa) return;

    const weeklyRows = await this.prisma.visaWeeklyProgress.findMany({
      where: { userVisaId: visaId },
    });

    let totalEligibleDays = 0;
    let totalDaysWorked = 0;

    for (const week of weeklyRows) {
      totalEligibleDays += week.eligibleDays;
      totalDaysWorked += week.daysWorked;
    }

    const daysRequired = visa.daysRequired;
    const daysRemaining = Math.max(0, daysRequired - totalEligibleDays);
    const progressPercentage =
      daysRequired > 0
        ? Math.round((totalEligibleDays / daysRequired) * 10000) / 100
        : 0;
    const isEligible = totalEligibleDays >= daysRequired;

    await this.prisma.userVisa.update({
      where: { id: visaId },
      data: {
        eligibleDays: totalEligibleDays,
        daysWorked: totalDaysWorked,
        daysRemaining,
        progressPercentage,
        isEligible,
      },
    });
  }

  /**
   * Generate all weekly progress rows for a visa (~52 weeks from arrival to expiry).
   */
  async generateWeeklyRows(visaId: string) {
    const visa = await this.prisma.userVisa.findUnique({
      where: { id: visaId },
    });

    if (!visa || !visa.expiryDate) return;

    const weeks = getWeekRanges(visa.arrivalDate, visa.expiryDate);

    // Delete existing rows first (idempotent)
    await this.prisma.visaWeeklyProgress.deleteMany({
      where: { userVisaId: visaId },
    });

    // Batch insert all weeks
    await this.prisma.visaWeeklyProgress.createMany({
      data: weeks.map(({ start, end }) => ({
        userVisaId: visaId,
        weekStartDate: start,
        weekEndDate: end,
        hours: 0,
        eligibleHours: 0,
        eligibleDays: 0,
        daysWorked: 0,
      })),
    });
  }

  /**
   * Refresh a specific week's progress data for a visa,
   * then recalculate the visa's aggregate totals.
   */
  async refreshWeekForDate(userId: string, workDate: Date) {
    // Find all visas for this user that cover this work date
    const visas = await this.prisma.userVisa.findMany({
      where: {
        userId,
        arrivalDate: { lte: workDate },
        expiryDate: { gte: workDate },
      },
    });

    for (const visa of visas) {
      const { start, end } = getWeekForDate(workDate);

      const progress = await this.calculateWeeklyProgress(visa.id, start, end);

      // Upsert the weekly progress row
      const existing = await this.prisma.visaWeeklyProgress.findUnique({
        where: {
          userVisaId_weekStartDate: {
            userVisaId: visa.id,
            weekStartDate: start,
          },
        },
      });

      if (existing) {
        await this.prisma.visaWeeklyProgress.update({
          where: { id: existing.id },
          data: {
            hours: progress.hours,
            eligibleHours: progress.eligibleHours,
            eligibleDays: progress.eligibleDays,
            daysWorked: progress.daysWorked,
          },
        });
      } else {
        await this.prisma.visaWeeklyProgress.create({
          data: {
            userVisaId: visa.id,
            weekStartDate: start,
            weekEndDate: end,
            hours: progress.hours,
            eligibleHours: progress.eligibleHours,
            eligibleDays: progress.eligibleDays,
            daysWorked: progress.daysWorked,
          },
        });
      }

      // Recalculate visa aggregate totals
      await this.calculateVisaProgress(visa.id);
    }
  }

  /**
   * Refresh all weekly progress rows for a visa (e.g., after employer eligibility changes).
   * Optimized: fetches all work entries in a single query, groups by week in-memory,
   * then batch-updates all weekly progress rows in a single transaction.
   */
  async refreshAllWeeksForVisa(visaId: string) {
    const visa = await this.prisma.userVisa.findUnique({
      where: { id: visaId },
    });

    if (!visa || !visa.expiryDate) return;

    const weeks = getWeekRanges(visa.arrivalDate, visa.expiryDate);

    // Fetch ALL work entries for the visa period in a single query
    const allEntries = await this.prisma.workEntry.findMany({
      where: {
        userId: visa.userId,
        workDate: {
          gte: visa.arrivalDate,
          lte: visa.expiryDate,
        },
      },
      include: {
        employer: {
          select: { isEligible: true },
        },
      },
    });

    // Group entries by week (keyed by week start date ISO string)
    const entriesByWeek = new Map<string, typeof allEntries>();

    for (const entry of allEntries) {
      const { start } = getWeekForDate(entry.workDate);
      const key = start.toISOString();
      const bucket = entriesByWeek.get(key);
      if (bucket) {
        bucket.push(entry);
      } else {
        entriesByWeek.set(key, [entry]);
      }
    }

    // Compute weekly progress for all weeks in-memory
    const weekUpdates = weeks.map(({ start, end }) => {
      const entries = entriesByWeek.get(start.toISOString()) ?? [];

      // Clamp week boundaries to visa date range
      const effectiveStart =
        start < visa.arrivalDate ? visa.arrivalDate : start;
      const effectiveEnd =
        visa.expiryDate && end > visa.expiryDate ? visa.expiryDate : end;

      let totalHours = 0;
      let eligibleHours = 0;
      const workedDates = new Set<string>();

      for (const entry of entries) {
        // Only count entries within the effective date range
        if (entry.workDate < effectiveStart || entry.workDate > effectiveEnd) {
          continue;
        }
        const hours = Number(entry.hours);
        totalHours += hours;
        if (entry.employer.isEligible) {
          eligibleHours += hours;
        }
        workedDates.add(entry.workDate.toISOString().split('T')[0]);
      }

      totalHours = Math.round(totalHours * 100) / 100;
      eligibleHours = Math.round(eligibleHours * 100) / 100;
      const eligibleDays = this.hoursToEligibleDays(eligibleHours);
      const daysWorked = workedDates.size;

      return {
        weekStartDate: start,
        hours: totalHours,
        eligibleHours,
        eligibleDays,
        daysWorked,
      };
    });

    // Batch update all weeks in a single parameterized raw SQL query
    if (weekUpdates.length > 0) {
      const valueFragments = weekUpdates.map(
        (u) =>
          Prisma.sql`(${u.weekStartDate}::date, ${u.hours}::decimal, ${u.eligibleHours}::decimal, ${u.eligibleDays}::int, ${u.daysWorked}::int)`,
      );

      await this.prisma.$executeRaw`
        UPDATE visa_weekly_progress AS vwp
        SET hours = v.hours,
            eligible_hours = v.eligible_hours,
            eligible_days = v.eligible_days,
            days_worked = v.days_worked
        FROM (VALUES ${Prisma.join(valueFragments)}) AS v(week_start_date, hours, eligible_hours, eligible_days, days_worked)
        WHERE vwp.user_visa_id = ${visaId}::uuid
          AND vwp.week_start_date = v.week_start_date
      `;
    }

    await this.calculateVisaProgress(visaId);
  }

  /**
   * Batch refresh weekly progress for multiple affected dates.
   * Optimized: fetches all data in 2-3 queries, calculates in-memory,
   * then batch-upserts all weekly progress rows and recalculates visa aggregates.
   *
   * Replaces the N+1 loop of refreshWeekForDate() calls.
   */
  async refreshWeeksForDates(userId: string, affectedDates: Date[]) {
    if (affectedDates.length === 0) return;

    // 1. Deduplicate into unique weeks
    const weekMap = new Map<string, { start: Date; end: Date }>();
    for (const date of affectedDates) {
      const week = getWeekForDate(date);
      const key = week.start.toISOString();
      if (!weekMap.has(key)) {
        weekMap.set(key, week);
      }
    }
    const uniqueWeeks = Array.from(weekMap.values());

    // 2. Get the overall date range
    const minDate = uniqueWeeks.reduce(
      (min, w) => (w.start < min ? w.start : min),
      uniqueWeeks[0].start,
    );
    const maxDate = uniqueWeeks.reduce(
      (max, w) => (w.end > max ? w.end : max),
      uniqueWeeks[0].end,
    );

    // 3. Find all visas covering any date in the range (single query)
    const visas = await this.prisma.userVisa.findMany({
      where: {
        userId,
        arrivalDate: { lte: maxDate },
        expiryDate: { gte: minDate },
      },
    });

    if (visas.length === 0) return;

    // 4. Fetch ALL work entries for the date range (single query)
    const allEntries = await this.prisma.workEntry.findMany({
      where: {
        userId,
        workDate: { gte: minDate, lte: maxDate },
      },
      include: {
        employer: { select: { isEligible: true } },
      },
    });

    // 5. Group entries by week key
    const entriesByWeek = new Map<string, typeof allEntries>();
    for (const entry of allEntries) {
      const { start } = getWeekForDate(entry.workDate);
      const key = start.toISOString();
      const bucket = entriesByWeek.get(key);
      if (bucket) {
        bucket.push(entry);
      } else {
        entriesByWeek.set(key, [entry]);
      }
    }

    // 6. For each visa × week, compute progress and collect updates
    const affectedVisaIds = new Set<string>();
    const allUpsertFragments: Prisma.Sql[] = [];

    for (const visa of visas) {
      for (const week of uniqueWeeks) {
        // Skip if week doesn't overlap with visa period
        if (
          week.end < visa.arrivalDate ||
          (visa.expiryDate && week.start > visa.expiryDate)
        ) {
          continue;
        }

        const entries = entriesByWeek.get(week.start.toISOString()) ?? [];

        // Clamp week boundaries to visa date range
        const effectiveStart =
          week.start < visa.arrivalDate ? visa.arrivalDate : week.start;
        const effectiveEnd =
          visa.expiryDate && week.end > visa.expiryDate
            ? visa.expiryDate
            : week.end;

        let totalHours = 0;
        let eligibleHours = 0;
        const workedDates = new Set<string>();

        for (const entry of entries) {
          if (
            entry.workDate < effectiveStart ||
            entry.workDate > effectiveEnd
          ) {
            continue;
          }
          const hours = Number(entry.hours);
          totalHours += hours;
          if (entry.employer.isEligible) {
            eligibleHours += hours;
          }
          workedDates.add(entry.workDate.toISOString().split('T')[0]);
        }

        totalHours = Math.round(totalHours * 100) / 100;
        eligibleHours = Math.round(eligibleHours * 100) / 100;
        const eligibleDays = this.hoursToEligibleDays(eligibleHours);
        const daysWorked = workedDates.size;

        allUpsertFragments.push(
          Prisma.sql`(gen_random_uuid(), ${visa.id}::uuid, ${week.start}::date, ${week.end}::date, ${totalHours}::decimal, ${eligibleHours}::decimal, ${eligibleDays}::int, ${daysWorked}::int, NOW(), NOW())`,
        );

        affectedVisaIds.add(visa.id);
      }
    }

    // 7. Batch upsert all weekly progress rows (single query)
    if (allUpsertFragments.length > 0) {
      await this.prisma.$executeRaw`
        INSERT INTO visa_weekly_progress (id, user_visa_id, week_start_date, week_end_date, hours, eligible_hours, eligible_days, days_worked, created_at, updated_at)
        VALUES ${Prisma.join(allUpsertFragments)}
        ON CONFLICT (user_visa_id, week_start_date)
        DO UPDATE SET
          hours = EXCLUDED.hours,
          eligible_hours = EXCLUDED.eligible_hours,
          eligible_days = EXCLUDED.eligible_days,
          days_worked = EXCLUDED.days_worked,
          updated_at = NOW()
      `;
    }

    // 8. Recalculate visa aggregates with SQL SUM (1 query per visa)
    for (const visaId of affectedVisaIds) {
      await this.recalculateVisaAggregates(visaId);
    }
  }

  /**
   * Recalculate visa aggregate totals using SQL SUM (single query).
   * More efficient than fetching all rows and summing in JS.
   */
  private async recalculateVisaAggregates(visaId: string) {
    await this.prisma.$executeRaw`
      UPDATE user_visas
      SET
        eligible_days = sub.total_eligible_days,
        days_worked = sub.total_days_worked,
        days_remaining = GREATEST(0, days_required - sub.total_eligible_days),
        progress_percentage = CASE
          WHEN days_required > 0
          THEN ROUND(sub.total_eligible_days::decimal / days_required * 100, 2)
          ELSE 0
        END,
        is_eligible = sub.total_eligible_days >= days_required,
        updated_at = NOW()
      FROM (
        SELECT
          COALESCE(SUM(eligible_days), 0)::int AS total_eligible_days,
          COALESCE(SUM(days_worked), 0)::int AS total_days_worked
        FROM visa_weekly_progress
        WHERE user_visa_id = ${visaId}::uuid
      ) sub
      WHERE id = ${visaId}::uuid
    `;
  }

  /**
   * Recalculate all visas for a user (e.g., after employer eligibility change).
   */
  async recalculateAllVisasForUser(userId: string) {
    const visas = await this.prisma.userVisa.findMany({
      where: { userId },
    });

    await Promise.all(visas.map((visa) => this.refreshAllWeeksForVisa(visa.id)));
  }

  /**
   * Get days_required for a visa type from shared constants.
   */
  getDaysRequired(visaType: string): number {
    return getDaysRequired(visaType);
  }

}
