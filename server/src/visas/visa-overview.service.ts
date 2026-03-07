import { Injectable, NotFoundException } from '@nestjs/common';
import {
  HOUR_TO_DAY_THRESHOLDS,
  type VisaOverview,
  type VisaOverviewMonthlyTrend,
  type VisaOverviewPace,
  type VisaOverviewThisWeek,
  type VisaOverviewTimeline,
  type VisaOverviewWeeklyProgress,
  type VisaType,
} from '@get-granted/shared';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

const MS_PER_DAY = 86_400_000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

const round2 = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class VisaOverviewService {
  constructor(private prisma: PrismaService) {}

  async getOverview(userId: string, visaId: string): Promise<VisaOverview> {
    // Q1: fetch visa with ownership check
    const visa = await this.prisma.userVisa.findFirst({
      where: { id: visaId, userId },
    });
    if (!visa) throw new NotFoundException('Visa not found');

    const arrivalDate = visa.arrivalDate;
    const expiryDate = visa.expiryDate;

    // Q2-Q5 in parallel
    const [weeklyRows, thisWeekEntries, workDistRows, employerRows] =
      await Promise.all([
        this.prisma.visaWeeklyProgress.findMany({
          where: { userVisaId: visaId },
          orderBy: { weekStartDate: 'asc' },
        }),
        this.fetchThisWeekEntries(userId, arrivalDate, expiryDate),
        this.fetchWorkDistribution(userId, arrivalDate, expiryDate),
        this.fetchEmployerBreakdown(userId, arrivalDate, expiryDate),
      ]);

    return {
      visa: {
        id: visa.id,
        visaType: visa.visaType as VisaType,
        arrivalDate: this.toDateStr(arrivalDate),
        expiryDate: expiryDate ? this.toDateStr(expiryDate) : '',
        daysRequired: visa.daysRequired,
        eligibleDays: visa.eligibleDays,
        daysWorked: visa.daysWorked,
        daysRemaining: visa.daysRemaining,
        isEligible: visa.isEligible ?? false,
      },
      timeline: this.computeTimeline(arrivalDate, expiryDate),
      pace: this.computePace(visa, arrivalDate, expiryDate),
      thisWeek: this.computeThisWeek(thisWeekEntries),
      weeklyProgress: this.buildWeeklyProgress(weeklyRows),
      workDistribution: workDistRows.map((r) => ({
        industry: r.industry,
        totalHours: round2(Number(r.total_hours)),
      })),
      employerBreakdown: employerRows.map((r) => ({
        employerId: r.employer_id,
        employerName: r.employer_name,
        isEligible: r.is_eligible,
        totalHours: round2(Number(r.total_hours)),
      })),
      monthlyTrend: this.buildMonthlyTrend(weeklyRows, arrivalDate),
    };
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private toDateStr(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getWeekBounds(date: Date): { start: Date; end: Date } {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    const daysFromMonday = (d.getUTCDay() + 6) % 7;
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - daysFromMonday);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    return { start: monday, end: sunday };
  }

  private hoursToEligibleDays(hours: number): number {
    for (const threshold of HOUR_TO_DAY_THRESHOLDS) {
      if (hours >= threshold.minHours) return threshold.eligibleDays;
    }
    return 0;
  }

  private getNextThreshold(
    currentHours: number,
  ): { hoursNeeded: number; eligibleDays: number } | null {
    // HOUR_TO_DAY_THRESHOLDS is descending; iterate ascending for next threshold
    for (let i = HOUR_TO_DAY_THRESHOLDS.length - 1; i >= 0; i--) {
      const t = HOUR_TO_DAY_THRESHOLDS[i];
      if (currentHours < t.minHours) {
        return {
          hoursNeeded: t.minHours - currentHours,
          eligibleDays: t.eligibleDays,
        };
      }
    }
    return null; // already at max (>=30h)
  }

  // ─── In-memory computations ────────────────────────────────────────────────

  private computeTimeline(
    arrivalDate: Date,
    expiryDate: Date | null,
  ): VisaOverviewTimeline {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const arrival = new Date(arrivalDate);
    arrival.setUTCHours(0, 0, 0, 0);
    const expiry = expiryDate ? new Date(expiryDate) : new Date(arrival);
    expiry.setUTCHours(0, 0, 0, 0);

    const totalDays =
      Math.round((expiry.getTime() - arrival.getTime()) / MS_PER_DAY) + 1;
    const daysElapsed = Math.max(
      0,
      Math.min(
        totalDays,
        Math.round((today.getTime() - arrival.getTime()) / MS_PER_DAY),
      ),
    );
    const daysLeft = Math.max(
      0,
      Math.round((expiry.getTime() - today.getTime()) / MS_PER_DAY),
    );

    return { totalDays, daysElapsed, daysLeft };
  }

  private computePace(
    visa: { eligibleDays: number; daysRequired: number },
    arrivalDate: Date,
    expiryDate: Date | null,
  ): VisaOverviewPace {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const arrival = new Date(arrivalDate);
    arrival.setUTCHours(0, 0, 0, 0);
    const expiry = expiryDate ? new Date(expiryDate) : new Date(arrival);
    expiry.setUTCHours(0, 0, 0, 0);

    const totalWeeks = Math.max(
      1,
      Math.round((expiry.getTime() - arrival.getTime()) / MS_PER_WEEK),
    );
    const weeksElapsed = Math.max(
      0,
      Math.min(
        totalWeeks,
        Math.floor((today.getTime() - arrival.getTime()) / MS_PER_WEEK),
      ),
    );
    const weeksRemaining = Math.max(0, totalWeeks - weeksElapsed);

    const currentPace =
      weeksElapsed > 0 ? visa.eligibleDays / weeksElapsed : 0;
    const requiredPace = visa.daysRequired / totalWeeks;

    return {
      weeksElapsed,
      weeksRemaining,
      totalWeeks,
      currentPace: round2(currentPace),
      requiredPace: round2(requiredPace),
    };
  }

  private computeThisWeek(
    entries: Array<{
      workDate: Date;
      hours: { toNumber(): number };
      employer: { isEligible: boolean | null };
    }>,
  ): VisaOverviewThisWeek {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const { start: weekStart, end: weekEnd } = this.getWeekBounds(today);

    const dailyMap = new Map<string, number>();
    let totalHours = 0;
    let eligibleHours = 0;

    for (const entry of entries) {
      const dateStr = this.toDateStr(entry.workDate);
      const hours = entry.hours.toNumber();
      totalHours += hours;
      if (entry.employer.isEligible) eligibleHours += hours;
      dailyMap.set(dateStr, (dailyMap.get(dateStr) ?? 0) + hours);
    }

    const dailyHours = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setUTCDate(weekStart.getUTCDate() + i);
      const dateStr = this.toDateStr(d);
      return { date: dateStr, dayOfWeek: i + 1, hours: dailyMap.get(dateStr) ?? 0 };
    });

    const nextThreshold = this.getNextThreshold(eligibleHours);
    return {
      weekStartDate: this.toDateStr(weekStart),
      weekEndDate: this.toDateStr(weekEnd),
      totalHours: round2(totalHours),
      eligibleHours: round2(eligibleHours),
      eligibleDays: this.hoursToEligibleDays(eligibleHours),
      dailyHours,
      nextThreshold: nextThreshold
        ? {
            hoursNeeded: round2(nextThreshold.hoursNeeded),
            eligibleDays: nextThreshold.eligibleDays,
          }
        : null,
    };
  }

  private buildWeeklyProgress(
    rows: Array<{
      weekStartDate: Date;
      eligibleDays: number;
      hours: { toNumber(): number };
    }>,
  ): VisaOverviewWeeklyProgress[] {
    let cumulative = 0;
    return rows.map((r) => {
      cumulative += r.eligibleDays;
      return {
        weekStartDate: this.toDateStr(r.weekStartDate),
        eligibleDays: r.eligibleDays,
        hours: round2(r.hours.toNumber()),
        cumulativeEligibleDays: cumulative,
      };
    });
  }

  private buildMonthlyTrend(
    rows: Array<{ weekStartDate: Date; eligibleDays: number }>,
    arrivalDate: Date,
  ): VisaOverviewMonthlyTrend[] {
    const monthMap = new Map<string, number>();
    for (const row of rows) {
      if (row.weekStartDate < arrivalDate) continue;
      const month = row.weekStartDate.toISOString().slice(0, 7);
      monthMap.set(month, (monthMap.get(month) ?? 0) + row.eligibleDays);
    }
    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, eligibleDays]) => ({ month, eligibleDays }));
  }

  // ─── DB queries ────────────────────────────────────────────────────────────

  private async fetchThisWeekEntries(
    userId: string,
    arrivalDate: Date,
    expiryDate: Date | null,
  ) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const { start: weekStart, end: weekEnd } = this.getWeekBounds(today);

    const effectiveStart = weekStart < arrivalDate ? arrivalDate : weekStart;
    const effectiveEnd =
      expiryDate && weekEnd > expiryDate ? expiryDate : weekEnd;

    if (effectiveStart > effectiveEnd) return [];

    return this.prisma.workEntry.findMany({
      where: {
        userId,
        workDate: { gte: effectiveStart, lte: effectiveEnd },
      },
      include: { employer: { select: { isEligible: true } } },
    });
  }

  private async fetchWorkDistribution(
    userId: string,
    arrivalDate: Date,
    expiryDate: Date | null,
  ) {
    if (expiryDate) {
      return this.prisma.$queryRaw<
        Array<{ industry: string; total_hours: unknown }>
      >(Prisma.sql`
        SELECT e.industry::text, COALESCE(SUM(we.hours), 0) AS total_hours
        FROM work_entries we
        JOIN employers e ON e.id = we.employer_id
        WHERE we.user_id = ${userId}::uuid
          AND we.work_date >= ${arrivalDate}::date
          AND we.work_date <= ${expiryDate}::date
        GROUP BY e.industry
        ORDER BY total_hours DESC
      `);
    }
    return this.prisma.$queryRaw<
      Array<{ industry: string; total_hours: unknown }>
    >(Prisma.sql`
      SELECT e.industry::text, COALESCE(SUM(we.hours), 0) AS total_hours
      FROM work_entries we
      JOIN employers e ON e.id = we.employer_id
      WHERE we.user_id = ${userId}::uuid
        AND we.work_date >= ${arrivalDate}::date
      GROUP BY e.industry
      ORDER BY total_hours DESC
    `);
  }

  private async fetchEmployerBreakdown(
    userId: string,
    arrivalDate: Date,
    expiryDate: Date | null,
  ) {
    if (expiryDate) {
      return this.prisma.$queryRaw<
        Array<{
          employer_id: string;
          employer_name: string;
          is_eligible: boolean;
          total_hours: unknown;
        }>
      >(Prisma.sql`
        SELECT e.id AS employer_id, e.name AS employer_name, e.is_eligible,
               COALESCE(SUM(we.hours), 0) AS total_hours
        FROM work_entries we
        JOIN employers e ON e.id = we.employer_id
        WHERE we.user_id = ${userId}::uuid
          AND we.work_date >= ${arrivalDate}::date
          AND we.work_date <= ${expiryDate}::date
        GROUP BY e.id, e.name, e.is_eligible
        ORDER BY total_hours DESC
      `);
    }
    return this.prisma.$queryRaw<
      Array<{
        employer_id: string;
        employer_name: string;
        is_eligible: boolean;
        total_hours: unknown;
      }>
    >(Prisma.sql`
      SELECT e.id AS employer_id, e.name AS employer_name, e.is_eligible,
             COALESCE(SUM(we.hours), 0) AS total_hours
      FROM work_entries we
      JOIN employers e ON e.id = we.employer_id
      WHERE we.user_id = ${userId}::uuid
        AND we.work_date >= ${arrivalDate}::date
      GROUP BY e.id, e.name, e.is_eligible
      ORDER BY total_hours DESC
    `);
  }
}
