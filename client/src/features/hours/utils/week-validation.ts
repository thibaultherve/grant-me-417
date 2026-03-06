/**
 * Week Validation Utilities
 *
 * Pure validation functions for week-based work hour entries.
 *
 * @module week-validation
 */

import { startOfWeek } from 'date-fns';

/**
 * Checks if a week has started (Monday has arrived).
 * A week is considered started when Monday of that week has arrived.
 *
 * @param date - Any date within the week to check
 * @returns true if the week has started (Monday has arrived), false otherwise
 *
 * @example
 * ```ts
 * const today = new Date('2025-01-09') // Thursday
 * const mondayThisWeek = new Date('2025-01-06')
 * const mondayNextWeek = new Date('2025-01-13')
 *
 * isWeekStarted(mondayThisWeek) // true (Monday has arrived)
 * isWeekStarted(mondayNextWeek) // false (Monday hasn't arrived yet)
 * ```
 */
export function isWeekStarted(date: Date): boolean {
  const today = new Date();
  const mondayOfWeek = startOfWeek(date, { weekStartsOn: 1 });

  return today >= mondayOfWeek;
}
