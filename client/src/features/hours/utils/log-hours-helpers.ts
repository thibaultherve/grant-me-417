import { format } from 'date-fns';

import type { WeekEntriesResponse } from '@regranted/shared';

import type { DayColumn, EmployerHoursState } from '../types/log-hours';
import { formatDateKey, getWeekDates } from './date-helpers';
import { validateHours } from './hours-validation';
import { MAX_HOURS_PER_DAY, MAX_HOURS_PER_WEEK } from './week-calculations';

/** Parse a string hours input to a number, defaulting to 0 */
export function parseHoursValue(value: string): number {
  if (!value.trim()) return 0;
  const validation = validateHours(value, MAX_HOURS_PER_DAY);
  return validation.isValid && validation.decimalValue !== null
    ? validation.decimalValue
    : 0;
}

/** Compute total for a single employer from their hours strings */
export function computeEmployerTotal(hours: Record<string, string>): number {
  let total = 0;
  for (const value of Object.values(hours)) {
    total += parseHoursValue(value);
  }
  return Math.round(total * 100) / 100;
}

export function createDayColumns(monday: Date): DayColumn[] {
  return getWeekDates(monday).map((date) => ({
    dateKey: formatDateKey(date),
    date,
    dayName: format(date, 'EEE'),
    dayNumber: format(date, 'd'),
    monthName: format(date, 'MMM'),
  }));
}

export function createDefaultEmployerState(
  dateKeys: string[],
): EmployerHoursState {
  const hours: Record<string, string> = {};
  const selectedDays: Record<string, boolean> = {};

  dateKeys.forEach((key, index) => {
    hours[key] = '';
    // Default: Mon-Fri selected, Sat-Sun not
    selectedDays[key] = index < 5;
  });

  return {
    hours,
    autoDistribute: false,
    selectedDays,
    totalHours: '',
  };
}

/** Build employer state from server data */
export function buildStateFromServer(
  serverData: WeekEntriesResponse,
  dateKeys: string[],
): {
  employers: Record<string, EmployerHoursState>;
  initialEmployers: Record<string, Record<string, number>>;
} {
  const employers: Record<string, EmployerHoursState> = {};
  const initialEmployers: Record<string, Record<string, number>> = {};

  for (const entry of serverData.employers) {
    const state = createDefaultEmployerState(dateKeys);
    const initialHours: Record<string, number> = {};

    // Fill hours from server data
    for (const dateKey of dateKeys) {
      const serverHours = entry.hours[dateKey] ?? 0;
      initialHours[dateKey] = serverHours;
      if (serverHours > 0) {
        state.hours[dateKey] = serverHours.toString();
      }
    }

    employers[entry.employerId] = state;
    initialEmployers[entry.employerId] = initialHours;
  }

  return { employers, initialEmployers };
}

/** Distribute total hours evenly across selected days */
export function distributeHours(
  totalValue: number,
  dateKeys: string[],
  selectedDays: Record<string, boolean>,
): Record<string, string> | null {
  const selectedCount = Object.values(selectedDays).filter(Boolean).length;
  if (selectedCount === 0) return null;

  const hoursPerDay = Math.round((totalValue / selectedCount) * 100) / 100;
  if (hoursPerDay > MAX_HOURS_PER_DAY) return null;

  const result: Record<string, string> = {};
  for (const dateKey of dateKeys) {
    if (selectedDays[dateKey]) {
      result[dateKey] = hoursPerDay > 0 ? hoursPerDay.toString() : '';
    } else {
      result[dateKey] = '';
    }
  }
  return result;
}
