/**
 * Week Calculations Utilities
 *
 * Pure utility functions for calculating and manipulating weekly work hours data.
 * These functions have no side effects and are easily testable.
 *
 * @module week-calculations
 */

import { startOfWeek, addDays, format } from 'date-fns';

import type { DaysIncluded } from '../schemas';

/**
 * Daily entry representation for a single day of the week
 */
export interface DailyEntry {
  day: keyof DaysIncluded;
  date: string;
  hours: string;
  decimalHours: number;
  isCalculated: boolean;
}

/**
 * Week hours data structure containing hours per day and total
 */
export interface WeekHoursData {
  weekHours: Record<string, number>;
  totalHours: number;
}

/**
 * Day names mapping for iteration
 */
const DAY_NAMES: (keyof DaysIncluded)[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

/**
 * Maximum hours allowed per day
 */
export const MAX_HOURS_PER_DAY = 24;

/**
 * Maximum hours allowed per week (7 days * 24 hours)
 */
export const MAX_HOURS_PER_WEEK = 168;

/**
 * Retrieves work hours data for a specific week from a hours-by-date mapping.
 *
 * @param weekDate - Any date within the target week (Monday will be calculated)
 * @param hoursByDate - Object mapping date strings (YYYY-MM-DD) to hours worked
 * @returns Object containing hours per day and total hours for the week
 *
 * @example
 * ```ts
 * const weekDate = new Date('2025-01-08') // A Wednesday
 * const hoursByDate = {
 *   '2025-01-06': 8,   // Monday
 *   '2025-01-07': 7.5, // Tuesday
 *   '2025-01-08': 8,   // Wednesday
 * }
 *
 * const result = getWeekHoursData(weekDate, hoursByDate)
 * // {
 * //   weekHours: { monday: 8, tuesday: 7.5, wednesday: 8, ... },
 * //   totalHours: 23.5
 * // }
 * ```
 */
export function getWeekHoursData(
  weekDate: Date,
  hoursByDate: Record<string, number>,
): WeekHoursData {
  const mondayDate = startOfWeek(weekDate, { weekStartsOn: 1 });
  const weekHours: Record<string, number> = {};
  let totalHours = 0;

  // Check each day of the week (Monday = 0, Sunday = 6)
  for (let i = 0; i < 7; i++) {
    const dayDate = addDays(mondayDate, i);
    const dateKey = format(dayDate, 'yyyy-MM-dd');
    const hours = hoursByDate[dateKey] || 0;

    weekHours[DAY_NAMES[i]] = hours;
    totalHours += hours;
  }

  return { weekHours, totalHours };
}

/**
 * Calculates how hours should be distributed across selected days.
 * Hours are divided equally among selected days, rounded to 2 decimal places.
 *
 * @param totalHours - Total hours to distribute across the week
 * @param daysIncluded - Object indicating which days should receive hours
 * @returns Hours per day for selected days (0 for unselected days)
 *
 * @example
 * ```ts
 * const daysIncluded = {
 *   monday: true,
 *   tuesday: true,
 *   wednesday: true,
 *   thursday: true,
 *   friday: true,
 *   saturday: false,
 *   sunday: false
 * }
 *
 * const hoursPerDay = calculateHoursPerDay(40, daysIncluded)
 * // Returns 8 (40 hours / 5 days)
 * ```
 */
export function calculateHoursPerDay(
  totalHours: number,
  daysIncluded: DaysIncluded,
): number {
  const selectedDayKeys = Object.keys(daysIncluded).filter(
    (day) => daysIncluded[day as keyof DaysIncluded],
  ) as (keyof DaysIncluded)[];

  if (selectedDayKeys.length === 0) return 0;
  if (totalHours <= 0) return 0;

  // Round to 2 decimal places to avoid floating point issues
  return Math.round((totalHours / selectedDayKeys.length) * 100) / 100;
}

/**
 * Creates daily entry objects for all days of a week with calculated hours distribution.
 *
 * @param weekDate - Any date within the target week
 * @param totalHours - Total hours to distribute
 * @param daysIncluded - Which days should receive hours
 * @param isCalculated - Whether these entries are calculated (true) or pre-filled (false)
 * @returns Array of 7 daily entries (Monday through Sunday)
 *
 * @example
 * ```ts
 * const entries = createDailyEntriesFromTotal(
 *   new Date('2025-01-06'),
 *   40,
 *   { monday: true, tuesday: true, ..., sunday: false },
 *   true
 * )
 *
 * // Returns 7 entries, with 8 hours for Mon-Fri, 0 for Sat-Sun
 * ```
 */
export function createDailyEntriesFromTotal(
  weekDate: Date,
  totalHours: number,
  daysIncluded: DaysIncluded,
  isCalculated: boolean = true,
): DailyEntry[] {
  const mondayDate = startOfWeek(weekDate, { weekStartsOn: 1 });
  const hoursPerDay = calculateHoursPerDay(totalHours, daysIncluded);

  return DAY_NAMES.map((day, index) => {
    const dayDate = addDays(mondayDate, index);
    const isSelected = daysIncluded[day];

    return {
      day,
      date: format(dayDate, 'yyyy-MM-dd'),
      hours: isSelected ? hoursPerDay.toString() : '0',
      decimalHours: isSelected ? hoursPerDay : 0,
      isCalculated: isSelected && isCalculated,
    };
  });
}

/**
 * Creates daily entries from pre-existing week hours data (for pre-filling forms).
 *
 * @param weekDate - Any date within the target week
 * @param weekHours - Object with hours for each day of the week
 * @returns Array of 7 daily entries with actual hours from weekHours
 *
 * @example
 * ```ts
 * const weekHours = {
 *   monday: 8,
 *   tuesday: 7.5,
 *   wednesday: 8,
 *   thursday: 8,
 *   friday: 6.5,
 *   saturday: 0,
 *   sunday: 0
 * }
 *
 * const entries = createDailyEntriesFromWeekHours(
 *   new Date('2025-01-06'),
 *   weekHours
 * )
 * ```
 */
export function createDailyEntriesFromWeekHours(
  weekDate: Date,
  weekHours: Record<string, number>,
): DailyEntry[] {
  const mondayDate = startOfWeek(weekDate, { weekStartsOn: 1 });

  return DAY_NAMES.map((day, index) => {
    const dayDate = addDays(mondayDate, index);
    const hours = weekHours[day] || 0;

    return {
      day,
      date: format(dayDate, 'yyyy-MM-dd'),
      hours: hours.toString(),
      decimalHours: hours,
      isCalculated: false, // Pre-filled from existing data, not calculated
    };
  });
}

/**
 * Creates a DaysIncluded object from week hours data.
 * Days with hours > 0 are marked as included.
 *
 * @param weekHours - Object with hours for each day
 * @returns DaysIncluded object with boolean flags
 *
 * @example
 * ```ts
 * const weekHours = { monday: 8, tuesday: 7.5, ..., saturday: 0, sunday: 0 }
 * const daysIncluded = createDaysIncludedFromWeekHours(weekHours)
 * // { monday: true, tuesday: true, ..., saturday: false, sunday: false }
 * ```
 */
export function createDaysIncludedFromWeekHours(
  weekHours: Record<string, number>,
): DaysIncluded {
  return {
    monday: (weekHours.monday || 0) > 0,
    tuesday: (weekHours.tuesday || 0) > 0,
    wednesday: (weekHours.wednesday || 0) > 0,
    thursday: (weekHours.thursday || 0) > 0,
    friday: (weekHours.friday || 0) > 0,
    saturday: (weekHours.saturday || 0) > 0,
    sunday: (weekHours.sunday || 0) > 0,
  };
}

/**
 * Counts how many days are selected in a DaysIncluded object.
 *
 * @param daysIncluded - Object with boolean flags for each day
 * @returns Number of days where the value is true
 *
 * @example
 * ```ts
 * const count = countSelectedDays({
 *   monday: true,
 *   tuesday: true,
 *   wednesday: false,
 *   // ...
 * })
 * // Returns 2
 * ```
 */
export function countSelectedDays(daysIncluded: DaysIncluded): number {
  return Object.values(daysIncluded).filter(Boolean).length;
}

/**
 * Calculates total hours from daily entries for selected days only.
 *
 * @param entries - Array of daily entries
 * @param daysIncluded - Which days to include in the total
 * @returns Sum of decimalHours for included days
 *
 * @example
 * ```ts
 * const total = calculateTotalFromEntries(dailyEntries, daysIncluded)
 * // Returns sum of hours for days where daysIncluded[day] === true
 * ```
 */
export function calculateTotalFromEntries(
  entries: DailyEntry[],
  daysIncluded: DaysIncluded,
): number {
  return entries
    .filter((entry) => daysIncluded[entry.day])
    .reduce((sum, entry) => sum + entry.decimalHours, 0);
}
