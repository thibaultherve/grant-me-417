/**
 * Calendar Helper Utilities
 *
 * Pure date manipulation functions for monthly calendar grid generation.
 * These functions handle calendar grid building, month detection, and formatting.
 *
 * @module calendar-helpers
 */

import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { formatDateKey } from './date-helpers';

/**
 * Represents a single day in the calendar grid.
 */
export type CalendarDay = {
  /** The date object for this day */
  date: Date;
  /** ISO date string (YYYY-MM-DD) for use as object key */
  dateKey: string;
  /** Whether this day belongs to the currently displayed month */
  isCurrentMonth: boolean;
};

/**
 * Generates a calendar grid of 42 days (6 weeks) for a given month.
 * Includes padding days from previous and next months to fill complete weeks.
 * Week starts on Monday.
 *
 * @param year - The year (e.g., 2025)
 * @param month - The month (1-12, where 1 = January)
 * @returns Array of 42 CalendarDay objects representing the full grid
 *
 * @example
 * ```ts
 * const days = getCalendarDays(2025, 1) // January 2025
 * // Returns 42 days starting from Monday Dec 30 2024
 * // through Sunday Feb 9 2025
 * ```
 */
export function getCalendarDays(year: number, month: number): CalendarDay[] {
  // Create date for the first day of the target month (month is 1-indexed, Date uses 0-indexed)
  const targetDate = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(targetDate);

  // Get the Monday of the week containing the first day of the month
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });

  // Get 6 full weeks (42 days) to ensure consistent grid size
  const gridEnd = endOfWeek(addWeeks(gridStart, 5), { weekStartsOn: 1 });

  // Generate all days in the interval
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return allDays.map((date) => ({
    date,
    dateKey: formatDateKey(date),
    isCurrentMonth: isSameMonth(date, targetDate),
  }));
}

/**
 * Checks if a date falls within a specific month and year.
 *
 * @param date - The date to check
 * @param year - The target year (e.g., 2025)
 * @param month - The target month (1-12, where 1 = January)
 * @returns true if the date is within the specified month/year
 *
 * @example
 * ```ts
 * const date = new Date('2025-01-15')
 * isCurrentMonth(date, 2025, 1) // true
 * isCurrentMonth(date, 2025, 2) // false
 * ```
 */
export function isCurrentMonth(
  date: Date,
  year: number,
  month: number
): boolean {
  const targetDate = new Date(year, month - 1, 1);
  return isSameMonth(date, targetDate);
}

/**
 * Formats a year and month into a readable string.
 *
 * @param year - The year (e.g., 2025)
 * @param month - The month (1-12, where 1 = January)
 * @returns Formatted string like "January 2025"
 *
 * @example
 * ```ts
 * formatMonthYear(2025, 1) // "January 2025"
 * formatMonthYear(2025, 12) // "December 2025"
 * ```
 */
export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return format(date, 'MMMM yyyy');
}

/**
 * Weekday headers for the calendar grid (Monday first).
 */
export const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Month names for dropdown selection.
 */
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
