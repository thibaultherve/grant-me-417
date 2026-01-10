/**
 * Week Validation Utilities
 *
 * Pure validation functions for week-based work hour entries.
 * Handles business rules like maximum hours per day, week completeness, etc.
 *
 * @module week-validation
 */

import { addDays, startOfWeek, isAfter } from 'date-fns';

import type { DaysIncluded } from '../schemas';

import {
  countSelectedDays,
  MAX_HOURS_PER_DAY,
  MAX_HOURS_PER_WEEK,
} from './week-calculations';

/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  errorMessage: string | null;
}

/**
 * Checks if a week is complete (at least Friday has passed).
 * A week is considered complete when Friday of that week has passed.
 *
 * @param date - Any date within the week to check
 * @returns true if the week is complete (Friday has passed), false otherwise
 *
 * @example
 * ```ts
 * const today = new Date('2025-01-09') // Thursday
 * const mondayThisWeek = new Date('2025-01-06')
 * const mondayLastWeek = new Date('2024-12-30')
 *
 * isWeekComplete(mondayThisWeek) // false (Friday hasn't passed yet)
 * isWeekComplete(mondayLastWeek) // true (Friday has passed)
 * ```
 */
export function isWeekComplete(date: Date): boolean {
  const today = new Date();
  const mondayOfWeek = startOfWeek(date, { weekStartsOn: 1 });
  const fridayOfWeek = addDays(mondayOfWeek, 4); // Friday is 4 days after Monday

  return today >= fridayOfWeek;
}

/**
 * Checks if a date should be disabled in the calendar.
 * Dates are disabled if they are in the future or if their week is not yet complete.
 *
 * @param date - The date to check
 * @returns true if the date should be disabled, false if selectable
 *
 * @example
 * ```ts
 * const futureDate = new Date('2026-01-01')
 * const incompleteWeek = new Date() // Today (week not complete)
 * const completeWeek = new Date('2024-12-01')
 *
 * isDateDisabled(futureDate) // true
 * isDateDisabled(incompleteWeek) // true
 * isDateDisabled(completeWeek) // false
 * ```
 */
export function isDateDisabled(date: Date): boolean {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Disable future dates
  if (isAfter(date, today)) return true;

  // Disable incomplete weeks
  return !isWeekComplete(date);
}

/**
 * Validates if total hours can be distributed across selected days without exceeding
 * the maximum hours per day limit (24h).
 *
 * @param totalHours - Total hours to distribute
 * @param selectedDaysCount - Number of days to distribute hours across
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```ts
 * validateTotalHours(40, 5)
 * // { isValid: true, errorMessage: null } - 8h per day is OK
 *
 * validateTotalHours(100, 2)
 * // { isValid: false, errorMessage: 'Cannot exceed 24 hours per day...' }
 * ```
 */
export function validateTotalHours(
  totalHours: number,
  selectedDaysCount: number,
): ValidationResult {
  if (totalHours <= 0) {
    return {
      isValid: false,
      errorMessage: 'Total hours must be greater than 0',
    };
  }

  if (totalHours > MAX_HOURS_PER_WEEK) {
    return {
      isValid: false,
      errorMessage: `Cannot exceed ${MAX_HOURS_PER_WEEK} hours per week`,
    };
  }

  if (selectedDaysCount === 0) {
    return {
      isValid: false,
      errorMessage: 'At least one day must be selected',
    };
  }

  const hoursPerDay = totalHours / selectedDaysCount;

  if (hoursPerDay > MAX_HOURS_PER_DAY) {
    return {
      isValid: false,
      errorMessage: `Cannot exceed ${MAX_HOURS_PER_DAY} hours per day. With ${selectedDaysCount} day(s) selected, maximum total is ${MAX_HOURS_PER_DAY * selectedDaysCount}h`,
    };
  }

  return {
    isValid: true,
    errorMessage: null,
  };
}

/**
 * Checks if a day can be toggled (checked/unchecked) without violating the
 * 24-hour-per-day maximum rule.
 *
 * @param daysIncluded - Current days included state
 * @param dayToToggle - The day key that would be toggled
 * @param totalDecimalHours - Current total hours for the week
 * @returns true if the day can be toggled, false if it would violate rules
 *
 * @example
 * ```ts
 * const daysIncluded = { monday: true, tuesday: true, ..., sunday: false }
 * const totalHours = 48
 *
 * // Trying to uncheck tuesday (would leave 48h on 1 day = too much)
 * canToggleDay(daysIncluded, 'tuesday', totalHours)
 * // Returns false
 *
 * // Trying to check saturday (would distribute 48h across 3 days = 16h each)
 * canToggleDay(daysIncluded, 'saturday', totalHours)
 * // Returns true
 * ```
 */
export function canToggleDay(
  daysIncluded: DaysIncluded,
  dayToToggle: keyof DaysIncluded,
  totalDecimalHours: number,
): boolean {
  const currentSelectedDays = countSelectedDays(daysIncluded);
  const isCurrentlyIncluded = daysIncluded[dayToToggle];

  // Always allow checking a day (adding more days)
  if (!isCurrentlyIncluded) {
    return true;
  }

  // Unchecking: check if we'd have at least 1 day left
  if (currentSelectedDays <= 1) {
    return false; // Can't uncheck the last day
  }

  // Check if remaining days would exceed 24h per day
  if (totalDecimalHours) {
    const newSelectedDays = currentSelectedDays - 1;
    const hoursPerDay = totalDecimalHours / newSelectedDays;

    if (hoursPerDay > MAX_HOURS_PER_DAY) {
      return false; // Would exceed 24h per day
    }
  }

  return true;
}

/**
 * Validates if form data is complete and ready for submission.
 *
 * @param selectedWeekDate - The selected week date
 * @param daysIncluded - Days included in the week
 * @param isTotalHoursValid - Whether total hours field is valid
 * @param totalDecimalHours - Total hours value
 * @returns true if form can be submitted, false otherwise
 *
 * @example
 * ```ts
 * canSubmitForm(
 *   new Date('2025-01-06'),
 *   { monday: true, tuesday: true, ... },
 *   true,
 *   40
 * )
 * // Returns true
 * ```
 */
export function canSubmitForm(
  selectedWeekDate: Date | undefined,
  daysIncluded: DaysIncluded,
  isTotalHoursValid: boolean,
  totalDecimalHours: number,
): boolean {
  if (!selectedWeekDate) return false;
  if (!isTotalHoursValid) return false;
  if (totalDecimalHours <= 0) return false;

  const selectedDaysCount = countSelectedDays(daysIncluded);
  if (selectedDaysCount === 0) return false;

  return true;
}

/**
 * Checks if a warning should be shown about days that can't be unchecked.
 * Returns true if unchecking any day would cause hours per day to exceed 24h.
 *
 * @param daysIncluded - Current days included state
 * @param totalDecimalHours - Total hours for the week
 * @returns true if warning should be displayed, false otherwise
 *
 * @example
 * ```ts
 * const daysIncluded = { monday: true, tuesday: true, ..., sunday: false }
 *
 * shouldShowDayToggleWarning(daysIncluded, 48)
 * // Returns true (48h / 1 day = 48h > 24h max)
 *
 * shouldShowDayToggleWarning(daysIncluded, 30)
 * // Returns false (30h / 1 day = 30h, but close to limit)
 * ```
 */
export function shouldShowDayToggleWarning(
  daysIncluded: DaysIncluded,
  totalDecimalHours: number,
): boolean {
  const selectedDaysCount = countSelectedDays(daysIncluded);

  // Warning only makes sense if there are multiple days selected
  if (selectedDaysCount <= 1) return false;

  // No warning if no hours set
  if (!totalDecimalHours) return false;

  // Check if removing one day would exceed limit
  const hoursIfOneDayRemoved = totalDecimalHours / (selectedDaysCount - 1);

  return hoursIfOneDayRemoved > MAX_HOURS_PER_DAY;
}
