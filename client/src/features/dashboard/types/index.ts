// ─── Pace ────────────────────────────────────────────────────────────────────

export type PaceStatus = 'good' | 'at-pace' | 'low' | 'no-data';

export interface PaceStatusInfo {
  status: PaceStatus;
  /** Difference between currentPace and requiredPace (positive = above, negative = below) */
  delta: number;
  /** Percentage above/below required pace */
  pct: number;
}

export interface WeeklyProgressChartPoint {
  label: string;
  eligibleDays: number;
  cumulativeEligibleDays: number;
  isPrediction: boolean;
}

export interface MonthlyTrendChartPoint {
  label: string;
  eligibleDays: number;
  idealPace: number;
}

// ─── Goal Date Prediction ────────────────────────────────────────────────────

export type GoalPredictionStatus = 'on-track' | 'tight' | 'at-risk' | 'completed' | 'no-data' | 'no-goal';

export interface GoalDatePrediction {
  status: GoalPredictionStatus;
  projectedDate: Date | null;
  countdownDays: number;
  countdownLabel: string;
  timelineProgress: number;
  subtextMessage: string;
  goalLabel: string;
}
