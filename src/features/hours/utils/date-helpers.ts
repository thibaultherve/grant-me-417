/**
 * Date Helper Utilities
 *
 * Pure date manipulation functions specific to week-based operations.
 * These functions handle date formatting, week calculations, and date range generation.
 *
 * @module date-helpers
 */

import { format, startOfWeek, addDays } from 'date-fns'

/**
 * Day labels for display purposes
 */
export const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
} as const

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
  return startOfWeek(date, { weekStartsOn: 1 })
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
  const monday = getMondayOfWeek(date)
  const sunday = addDays(monday, 6)

  const startYear = monday.getFullYear()
  const endYear = sunday.getFullYear()

  // Same year: "Mon 19 Sep - Fri 5 Oct 2025"
  if (startYear === endYear) {
    return `${format(monday, 'EEE d MMM')} - ${format(sunday, 'EEE d MMM yyyy')}`
  }

  // Different years: "Mon 30 Dec 2024 - Fri 5 Jan 2025"
  return `${format(monday, 'EEE d MMM yyyy')} - ${format(sunday, 'EEE d MMM yyyy')}`
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
  const monday = getMondayOfWeek(date)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
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
  return format(date, 'yyyy-MM-dd')
}

/**
 * Gets an array of date keys (YYYY-MM-DD) for all days in a week.
 *
 * @param date - Any date within the target week
 * @returns Array of 7 date strings (Monday through Sunday)
 *
 * @example
 * ```ts
 * const wednesday = new Date('2025-01-08')
 * const dateKeys = getWeekDateKeys(wednesday)
 * // Returns ["2025-01-06", "2025-01-07", ..., "2025-01-12"]
 * ```
 */
export function getWeekDateKeys(date: Date): string[] {
  const weekDates = getWeekDates(date)
  return weekDates.map(formatDateKey)
}

/**
 * Gets the day name for a specific date.
 *
 * @param date - The date to check
 * @returns Day name in lowercase (e.g., "monday", "tuesday")
 *
 * @example
 * ```ts
 * const date = new Date('2025-01-08') // A Wednesday
 * const dayName = getDayName(date)
 * // Returns "wednesday"
 * ```
 */
export function getDayName(date: Date): keyof typeof DAY_LABELS {
  const dayIndex = date.getDay()
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return dayNames[dayIndex] as keyof typeof DAY_LABELS
}

/**
 * Gets the display label for a day of the week.
 *
 * @param dayKey - Day key (e.g., "monday", "tuesday")
 * @returns Display label (e.g., "Monday", "Tuesday")
 *
 * @example
 * ```ts
 * const label = getDayLabel('monday')
 * // Returns "Monday"
 * ```
 */
export function getDayLabel(dayKey: keyof typeof DAY_LABELS): string {
  return DAY_LABELS[dayKey]
}

/**
 * Gets the dates for selected days in a week as YYYY-MM-DD strings.
 * Used for API calls to ensure proper date formatting without timezone issues.
 *
 * @param weekDateString - Any date within the target week (YYYY-MM-DD format)
 * @param daysIncluded - Object specifying which days to include
 * @returns Array of date strings in YYYY-MM-DD format
 *
 * @example
 * ```ts
 * const dates = getSelectedWeekDates('2025-01-08', {
 *   monday: true,
 *   tuesday: true,
 *   wednesday: false,
 *   // ...
 * })
 * // Returns ["2025-01-06", "2025-01-07"]
 * ```
 */
export function getSelectedWeekDates(
  weekDateString: string,
  daysIncluded: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
): string[] {
  // Parse the date ensuring no timezone issues
  const weekDate = new Date(weekDateString.split('T')[0])

  // Get Monday of this week
  const monday = startOfWeek(weekDate, { weekStartsOn: 1 })

  // Create array of selected dates
  const dates: string[] = []
  const dayIndexMap = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6
  }

  // Add only selected days
  Object.entries(daysIncluded).forEach(([day, included]) => {
    if (included) {
      const dayIndex = dayIndexMap[day as keyof typeof dayIndexMap]
      const date = addDays(monday, dayIndex)
      // Format as YYYY-MM-DD without timezone
      dates.push(format(date, 'yyyy-MM-dd'))
    }
  })

  return dates
}
