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
