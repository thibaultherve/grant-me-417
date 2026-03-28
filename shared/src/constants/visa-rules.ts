export const VISA_TYPES = ['first_whv', 'second_whv', 'third_whv'] as const;

export const VISA_DAYS_REQUIRED: Record<(typeof VISA_TYPES)[number], number> = {
  first_whv: 88,
  second_whv: 179,
  third_whv: 0,
};

export const visaHasGoal = (visaType: (typeof VISA_TYPES)[number]): boolean =>
  VISA_DAYS_REQUIRED[visaType] > 0;

/**
 * WHV 417 hour→day thresholds (evaluated in descending order).
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

export const MAX_HOURS_PER_DAY = 24;
export const MAX_HOURS_PER_WEEK = 168; // 7 * 24

/**
 * WHV 417 eligible countries (ISO 3166-1 alpha-2).
 */
export const ELIGIBLE_COUNTRIES_417 = [
  'BE', // Belgium
  'CA', // Canada
  'CY', // Cyprus
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'HK', // Hong Kong SAR
  'IE', // Ireland
  'IT', // Italy
  'JP', // Japan
  'KR', // Republic of Korea
  'MT', // Malta
  'NL', // Netherlands
  'NO', // Norway
  'SE', // Sweden
  'TW', // Taiwan
  'GB', // United Kingdom
] as const;
