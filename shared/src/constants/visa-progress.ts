import type { VisaType } from '../types';

export const VISA_DAYS_REQUIRED: Record<VisaType, number> = {
  first_whv: 88,
  second_whv: 179,
  third_whv: 0,
};

/**
 * WHV 417 hour->day thresholds (evaluated in descending order).
 * Weekly hours worked determine how many eligible days are counted.
 */
export const HOUR_TO_DAY_THRESHOLDS = [
  { minHours: 30, eligibleDays: 7 },
  { minHours: 24, eligibleDays: 4 },
  { minHours: 18, eligibleDays: 3 },
  { minHours: 12, eligibleDays: 2 },
  { minHours: 6, eligibleDays: 1 },
] as const;

export const ELIGIBLE_DAYS_VALUES = [0, 1, 2, 3, 4, 7] as const;

/**
 * If the projected goal date is within this many weeks of visa expiry,
 * the prediction status is "tight" instead of "on-track".
 */
export const GOAL_TIGHT_THRESHOLD_WEEKS = 4;

export const MAX_HOURS_PER_DAY = 24;
export const MAX_HOURS_PER_WEEK = 168; // 7 * 24
