import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type VisaOverview,
  type VisaOverviewMonthlyTrend,
  type VisaOverviewPace,
  type VisaOverviewWeeklyProgress,
  type VisaType,
} from '@regranted/shared';
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

    // Q2-Q4 in parallel
    const [weeklyRows, workDistRows, employerRows] = await Promise.all([
      this.prisma.visaWeeklyProgress.findMany({
        where: { userVisaId: visaId },
        orderBy: { weekStartDate: 'asc' },
      }),
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
      pace: this.computePace(visa, arrivalDate, expiryDate),
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

  // ─── In-memory computations ────────────────────────────────────────────────

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

    const currentPace = weeksElapsed > 0 ? visa.eligibleDays / weeksElapsed : 0;
    const requiredPace = visa.daysRequired / totalWeeks;

    return {
      weeksElapsed,
      weeksRemaining,
      totalWeeks,
      currentPace: round2(currentPace),
      requiredPace: round2(requiredPace),
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
