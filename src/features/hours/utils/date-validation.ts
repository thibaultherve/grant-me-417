/**
 * Date Validation Utilities
 *
 * Pure validation functions for date-related business rules.
 * Shared utilities used across both by-day and by-week forms.
 *
 * @module date-validation
 */

import { isAfter } from 'date-fns'

/**
 * Checks if a date should be disabled for work entry selection.
 * Future dates are disabled as users cannot log work for dates that haven't occurred yet.
 *
 * @param date - The date to check
 * @returns true if the date should be disabled, false if selectable
 *
 * @example
 * ```ts
 * const futureDate = new Date('2026-01-01')
 * const pastDate = new Date('2024-12-01')
 * const today = new Date()
 *
 * isDateDisabled(futureDate) // true
 * isDateDisabled(pastDate) // false
 * isDateDisabled(today) // false
 * ```
 */
export function isDateDisabled(date: Date): boolean {
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  // Disable future dates
  return isAfter(date, today)
}
