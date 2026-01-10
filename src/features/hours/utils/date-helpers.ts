/**
 * Date Helper Utilities
 *
 * Pure date manipulation functions specific to week-based operations.
 * These functions handle date formatting, week calculations, and date range generation.
 *
 * @module date-helpers
 */

import { addDays, format, startOfWeek } from 'date-fns';

/**
 * Gets the Monday date for any date within a week.
 *
 * @param date - Any date within the target week
 * @returns The Monday (start) of that week
 *
 * @example
 * ```ts
 * const wednesday = new Date('2025-01-08')
 * const monday = getMondayOfWeek(wednesday)
 * // Returns Mon Jan 06 2025
 * ```
 */
export function getMondayOfWeek(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

/**
 * Formats a week range as a readable string.
 * Returns format:
 * - Same year: "Mon 19 Sep - Fri 5 Oct 2025"
 * - Different years: "Mon 30 Dec 2024 - Fri 5 Jan 2025"
 *
 * @param date - Any date within the target week
 * @returns Formatted week range string
 *
 * @example
 * ```ts
 * const wednesday = new Date('2025-01-08')
 * const range = getWeekRange(wednesday)
 * // Returns "Mon 6 Jan - Sun 12 Jan 2025"
 * ```
 */
export function getWeekRange(date: Date): string {
  const monday = getMondayOfWeek(date);
  const sunday = addDays(monday, 6);

  const startYear = monday.getFullYear();
  const endYear = sunday.getFullYear();

  // Same year: "Mon 19 Sep - Fri 5 Oct 2025"
  if (startYear === endYear) {
    return `${format(monday, 'EEE d MMM')} - ${format(sunday, 'EEE d MMM yyyy')}`;
  }

  // Different years: "Mon 30 Dec 2024 - Fri 5 Jan 2025"
  return `${format(monday, 'EEE d MMM yyyy')} - ${format(sunday, 'EEE d MMM yyyy')}`;
}

/**
 * Gets all 7 dates for a week (Monday through Sunday).
 *
 * @param date - Any date within the target week
 * @returns Array of 7 Date objects starting with Monday
 *
 * @example
 * ```ts
 * const wednesday = new Date('2025-01-08')
 * const weekDates = getWeekDates(wednesday)
 * // Returns [Mon Jan 06, Tue Jan 07, ..., Sun Jan 12]
 * ```
 */
export function getWeekDates(date: Date): Date[] {
  const monday = getMondayOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/**
 * Formats a date to YYYY-MM-DD format (ISO date string).
 *
 * @param date - Date to format
 * @returns ISO date string (YYYY-MM-DD)
 *
 * @example
 * ```ts
 * const date = new Date('2025-01-08')
 * const formatted = formatDateKey(date)
 * // Returns "2025-01-08"
 * ```
 */
export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
