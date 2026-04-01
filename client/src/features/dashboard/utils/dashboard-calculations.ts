import { GOAL_TIGHT_THRESHOLD_WEEKS } from '@regranted/shared';
import type {
  VisaOverviewMonthlyTrend,
  VisaOverviewPace,
  VisaOverviewVisa,
  VisaOverviewWeeklyProgress,
} from '@regranted/shared';

import type {
  GoalDatePrediction,
  MonthlyTrendChartPoint,
  PaceStatus,
  PaceStatusInfo,
  WeeklyProgressChartPoint,
} from '../types';

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

// ─── Goal Date Prediction ────────────────────────────────────────────────────

const MS_PER_DAY = 86_400_000;

/**
 * Projects when the user will reach their required eligible days
 * based on current weekly pace.
 */
export function computeGoalDatePrediction(
  visa: VisaOverviewVisa,
  pace: VisaOverviewPace,
): GoalDatePrediction {
  const { daysRequired, eligibleDays, isEligible, expiryDate } = visa;
  const { currentPace } = pace;

  // Edge case: no goal (third_whv)
  if (daysRequired === 0) {
    return {
      status: 'no-goal',
      projectedDate: null,
      countdownDays: 0,
      countdownLabel: '',
      timelineProgress: 0,
      subtextMessage: 'This visa type has no specified work day requirement.',
      goalLabel: '',
    };
  }

  // Edge case: completed
  if (isEligible) {
    return {
      status: 'completed',
      projectedDate: null,
      countdownDays: eligibleDays,
      countdownLabel: 'days earned',
      timelineProgress: 1,
      subtextMessage: `You've earned ${eligibleDays} eligible days — goal of ${daysRequired} achieved!`,
      goalLabel: 'Goal reached',
    };
  }

  // Edge case: no data
  if (currentPace === 0) {
    return {
      status: 'no-data',
      projectedDate: null,
      countdownDays: 0,
      countdownLabel: '',
      timelineProgress: 0,
      subtextMessage:
        'Start logging eligible work to see your goal prediction.',
      goalLabel: '',
    };
  }

  // Projection
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setUTCHours(0, 0, 0, 0);

  const daysToGo = daysRequired - eligibleDays;
  const weeksToGoal = daysToGo / currentPace;
  const projectedDate = new Date(
    today.getTime() + weeksToGoal * 7 * MS_PER_DAY,
  );

  const daysUntilExpiry = Math.max(
    1,
    Math.round((expiry.getTime() - today.getTime()) / MS_PER_DAY),
  );
  const daysUntilGoal = Math.round(
    (projectedDate.getTime() - today.getTime()) / MS_PER_DAY,
  );

  // Determine status
  const weeksBeforeExpiry =
    (expiry.getTime() - projectedDate.getTime()) / (7 * MS_PER_DAY);
  const isAfterExpiry = projectedDate > expiry;

  let status: GoalDatePrediction['status'];
  if (isAfterExpiry) {
    status = 'at-risk';
  } else if (weeksBeforeExpiry <= GOAL_TIGHT_THRESHOLD_WEEKS) {
    status = 'tight';
  } else {
    status = 'on-track';
  }

  // Countdown
  let countdownDays: number;
  let countdownLabel: string;
  if (isAfterExpiry) {
    countdownDays = Math.round(
      (projectedDate.getTime() - expiry.getTime()) / MS_PER_DAY,
    );
    countdownLabel = 'days over';
  } else {
    countdownDays = daysUntilGoal;
    countdownLabel = 'days';
  }

  // Timeline progress: fraction of today→expiry
  const timelineProgress = isAfterExpiry
    ? 1
    : Math.min(Math.max(daysUntilGoal / daysUntilExpiry, 0), 1);

  // Goal label
  const goalLabel = isAfterExpiry
    ? 'Goal past expiry'
    : `↑ Goal · ${formatShortDate(projectedDate.toISOString().split('T')[0])}`;

  // Subtext
  const weeksRounded = Math.round(weeksToGoal);
  const subtextMessage = isAfterExpiry
    ? `At current pace, you'll reach your goal ~${countdownDays} days after visa expiry.`
    : `You'll reach your goal in ~${weeksRounded} week${weeksRounded !== 1 ? 's' : ''} at current pace.`;

  return {
    status,
    projectedDate,
    countdownDays,
    countdownLabel,
    timelineProgress,
    subtextMessage,
    goalLabel,
  };
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export { formatDate, formatShortDate } from '@/utils/date-format';

// ─── Chart Helpers ────────────────────────────────────────────────────────────

const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

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

  const lastDate =
    weeklyProgress.length > 0
      ? new Date(weeklyProgress[weeklyProgress.length - 1].weekStartDate)
      : new Date();

  const predictions: WeeklyProgressChartPoint[] = [];
  let cumulative = lastCumulative;
  let weeksAfterGoal = 0;
  for (let i = 1; i <= weeksRemaining; i++) {
    cumulative = cumulative + currentPace;
    const predDate = new Date(lastDate);
    predDate.setDate(predDate.getDate() + i * 7);
    predictions.push({
      label: `W${getISOWeekNumber(predDate)}`,
      eligibleDays: 0,
      cumulativeEligibleDays: Math.round(cumulative),
      isPrediction: true,
    });
    if (daysRequired > 0 && cumulative >= daysRequired) {
      weeksAfterGoal++;
      if (weeksAfterGoal >= 4) break;
    }
  }

  return [...actual, ...predictions];
}

function formatWeekLabel(weekStartDate: string): string {
  const date = new Date(weekStartDate);
  return `W${getISOWeekNumber(date)}`;
}

function getISOWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
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
