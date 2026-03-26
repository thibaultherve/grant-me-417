import { HOUR_TO_DAY_THRESHOLDS } from '@regranted/shared';

import type {
  MonthlyTrendChartPoint,
  PaceStatus,
  PaceStatusInfo,
  WeeklyProgressChartPoint,
} from '../types';

import type {
  VisaOverviewMonthlyTrend,
  VisaOverviewPace,
  VisaOverviewWeeklyProgress,
} from '@regranted/shared';

// ─── Pace Status ─────────────────────────────────────────────────────────────

/**
 * Determines pace status based on current vs required pace.
 * Good: currentPace > requiredPace * 1.05 (more than 5% above)
 * At Pace: currentPace >= requiredPace * 0.95 (within 5%)
 * Low: currentPace < requiredPace * 0.95
 */
export function getPaceStatus(pace: VisaOverviewPace): PaceStatusInfo {
  const { currentPace, requiredPace } = pace;

  if (!currentPace || currentPace === 0) {
    return { status: 'no-data', delta: 0, pct: 0 };
  }

  if (requiredPace === 0) {
    return { status: 'good', delta: 0, pct: 0 };
  }

  const delta = currentPace - requiredPace;
  const pct = (delta / requiredPace) * 100;

  let status: PaceStatus;
  if (currentPace > requiredPace * 1.05) {
    status = 'good';
  } else if (currentPace >= requiredPace * 0.95) {
    status = 'at-pace';
  } else {
    status = 'low';
  }

  return { status, delta, pct };
}

// ─── Next Threshold ───────────────────────────────────────────────────────────

/**
 * Returns the next threshold info given current eligible hours this week.
 * Returns null if already at max (30h).
 */
export function getNextThreshold(
  eligibleHours: number,
): { hoursNeeded: number; eligibleDays: number } | null {
  for (const threshold of HOUR_TO_DAY_THRESHOLDS) {
    if (eligibleHours < threshold.minHours) {
      return {
        hoursNeeded: threshold.minHours - eligibleHours,
        eligibleDays: threshold.eligibleDays,
      };
    }
  }
  return null;
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatHours(hours: number): string {
  return `${hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)}h`;
}

export function formatPct(value: number): string {
  return `${Math.round(value)}%`;
}

// ─── Chart Helpers ────────────────────────────────────────────────────────────

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Builds chart data points for the Weekly Progress chart.
 * Adds a prediction segment from current week to end at current pace.
 */
export function buildWeeklyProgressChartData(
  weeklyProgress: VisaOverviewWeeklyProgress[],
  currentPace: number,
  weeksRemaining: number,
  daysRequired: number,
): WeeklyProgressChartPoint[] {
  const actual: WeeklyProgressChartPoint[] = weeklyProgress.map((w) => ({
    label: formatWeekLabel(w.weekStartDate),
    eligibleDays: w.eligibleDays,
    cumulativeEligibleDays: w.cumulativeEligibleDays,
    isPrediction: false,
  }));

  const lastCumulative =
    actual.length > 0 ? actual[actual.length - 1].cumulativeEligibleDays : 0;

  const predictions: WeeklyProgressChartPoint[] = [];
  let cumulative = lastCumulative;
  for (let i = 1; i <= weeksRemaining; i++) {
    cumulative = Math.min(cumulative + currentPace, daysRequired);
    predictions.push({
      label: `+${i}w`,
      eligibleDays: 0,
      cumulativeEligibleDays: Math.round(cumulative),
      isPrediction: true,
    });
  }

  return [...actual, ...predictions];
}

function formatWeekLabel(weekStartDate: string): string {
  const date = new Date(weekStartDate);
  return MONTH_ABBR[date.getMonth()];
}

/**
 * Builds chart data for the Monthly Trend chart.
 */
export function buildMonthlyTrendChartData(
  monthlyTrend: VisaOverviewMonthlyTrend[],
  daysRequired: number,
): MonthlyTrendChartPoint[] {
  const totalMonths = monthlyTrend.length || 1;
  const idealPace = daysRequired / totalMonths;

  return monthlyTrend.map((m) => ({
    label: formatMonthLabel(m.month),
    eligibleDays: m.eligibleDays,
    idealPace: Math.round(idealPace * 10) / 10,
  }));
}

function formatMonthLabel(month: string): string {
  // month is YYYY-MM
  const [, monthNum] = month.split('-');
  return MONTH_ABBR[parseInt(monthNum, 10) - 1];
}

// ─── Percentage Helpers ───────────────────────────────────────────────────────

export function calcProgressPct(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((value / total) * 100), 100);
}
