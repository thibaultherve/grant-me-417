/**
 * Day Calculations Utilities
 *
 * Pure utility functions for managing daily work entries.
 * These functions handle entry creation, manipulation, and calculations
 * for the by-day form component.
 *
 * @module day-calculations
 */

import { format } from 'date-fns';

/**
 * Work entry representation for a single day
 */
export interface WorkEntry {
  id: string;
  work_date: string;
  hours_worked: string;
  decimal_hours: number;
}

/**
 * Calculates the total hours worked across all entries.
 *
 * @param entries - Array of work entries
 * @returns Total decimal hours worked
 *
 * @example
 * ```ts
 * const entries = [
 *   { id: '1', work_date: '2025-01-06', hours_worked: '8', decimal_hours: 8 },
 *   { id: '2', work_date: '2025-01-07', hours_worked: '7.5', decimal_hours: 7.5 }
 * ]
 * const total = calculateTotalHours(entries)
 * // Returns 15.5
 * ```
 */
export function calculateTotalHours(entries: WorkEntry[]): number {
  return entries.reduce((sum, entry) => {
    const hours = parseFloat(entry.hours_worked) || 0;
    return sum + hours;
  }, 0);
}

/**
 * Sorts work entries by date in ascending order (earliest first).
 *
 * @param entries - Array of work entries to sort
 * @returns New array sorted by work_date
 *
 * @example
 * ```ts
 * const entries = [
 *   { ..., work_date: '2025-01-08' },
 *   { ..., work_date: '2025-01-06' },
 *   { ..., work_date: '2025-01-07' }
 * ]
 * const sorted = sortEntriesByDate(entries)
 * // Returns entries ordered: Jan 6, Jan 7, Jan 8
 * ```
 */
export function sortEntriesByDate(entries: WorkEntry[]): WorkEntry[] {
  return [...entries].sort((a, b) => a.work_date.localeCompare(b.work_date));
}

/**
 * Merges a new entry into the entries list, replacing an existing entry
 * if the date already exists, or adding it as a new entry if not.
 * The result is automatically sorted by date.
 *
 * @param entries - Current array of work entries
 * @param newEntry - New entry to merge or add
 * @returns New array with the entry merged and sorted
 *
 * @example
 * ```ts
 * const entries = [
 *   { id: '1', work_date: '2025-01-06', hours_worked: '8', decimal_hours: 8 }
 * ]
 * const newEntry = { id: '2', work_date: '2025-01-06', hours_worked: '7', decimal_hours: 7 }
 * const result = mergeOrAddEntry(entries, newEntry)
 * // Returns array with newEntry replacing the old entry for Jan 6
 * ```
 */
export function mergeOrAddEntry(
  entries: WorkEntry[],
  newEntry: WorkEntry,
): WorkEntry[] {
  const existingIndex = entries.findIndex(
    (entry) => entry.work_date === newEntry.work_date,
  );

  if (existingIndex >= 0) {
    // Replace existing entry
    return entries.map((entry, index) =>
      index === existingIndex ? newEntry : entry,
    );
  } else {
    // Add new entry and sort by date
    return sortEntriesByDate([...entries, newEntry]);
  }
}

/**
 * Creates a work entry object with a unique ID and formatted date.
 *
 * @param date - The work date
 * @param decimalHours - Hours worked as a decimal number
 * @returns New WorkEntry object
 *
 * @example
 * ```ts
 * const entry = createWorkEntry(new Date('2025-01-06'), 8.5)
 * // Returns {
 * //   id: 'entry-1704556800000',
 * //   work_date: '2025-01-06',
 * //   hours_worked: '8.5',
 * //   decimal_hours: 8.5
 * // }
 * ```
 */
export function createWorkEntry(date: Date, decimalHours: number): WorkEntry {
  return {
    id: `entry-${Date.now()}`,
    work_date: format(date, 'yyyy-MM-dd'),
    hours_worked: decimalHours.toString(),
    decimal_hours: decimalHours,
  };
}

/**
 * Removes a work entry from the list by its ID.
 *
 * @param entries - Current array of work entries
 * @param entryId - ID of the entry to remove
 * @returns New array without the specified entry
 *
 * @example
 * ```ts
 * const entries = [
 *   { id: '1', work_date: '2025-01-06', hours_worked: '8', decimal_hours: 8 },
 *   { id: '2', work_date: '2025-01-07', hours_worked: '7.5', decimal_hours: 7.5 }
 * ]
 * const result = removeEntryById(entries, '1')
 * // Returns array with only the Jan 7 entry
 * ```
 */
export function removeEntryById(
  entries: WorkEntry[],
  entryId: string,
): WorkEntry[] {
  return entries.filter((entry) => entry.id !== entryId);
}

/**
 * Checks if a work entry exists for a specific date.
 *
 * @param entries - Array of work entries to search
 * @param date - Date to check (as Date object or ISO string)
 * @returns true if an entry exists for this date, false otherwise
 *
 * @example
 * ```ts
 * const entries = [
 *   { id: '1', work_date: '2025-01-06', hours_worked: '8', decimal_hours: 8 }
 * ]
 * hasEntryForDate(entries, new Date('2025-01-06')) // true
 * hasEntryForDate(entries, new Date('2025-01-07')) // false
 * ```
 */
export function hasEntryForDate(
  entries: WorkEntry[],
  date: Date | string,
): boolean {
  const dateString =
    typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
  return entries.some((entry) => entry.work_date === dateString);
}
