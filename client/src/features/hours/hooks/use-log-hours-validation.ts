import { useMemo } from 'react';

import type {
  CrossEmployerErrors,
  EmployerErrors,
  EmployerHoursState,
} from '../types/log-hours';
import { validateHours } from '../utils/hours-validation';
import {
  computeEmployerTotal,
  parseHoursValue,
} from '../utils/log-hours-helpers';
import {
  MAX_HOURS_PER_DAY,
  MAX_HOURS_PER_WEEK,
} from '../utils/week-calculations';
import { isWeekStarted } from '../utils/week-validation';

export function useLogHoursValidation(
  employers: Record<string, EmployerHoursState>,
  initialEmployers: Record<string, Record<string, number>>,
  isSubmitting: boolean,
  dateKeys: string[],
  monday: Date,
): {
  employerTotals: Record<string, number>;
  weekTotal: number;
  employerErrors: EmployerErrors;
  crossEmployerErrors: CrossEmployerErrors;
  isDirty: boolean;
  canSubmit: boolean;
} {
  /** Per-employer computed totals */
  const employerTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const [employerId, empState] of Object.entries(employers)) {
      totals[employerId] = computeEmployerTotal(empState.hours);
    }
    return totals;
  }, [employers]);

  /** Week total (sum of all employers) */
  const weekTotal = useMemo(() => {
    let sum = 0;
    for (const total of Object.values(employerTotals)) {
      sum += total;
    }
    return Math.round(sum * 100) / 100;
  }, [employerTotals]);

  /** Per-employer field errors (input format validation) */
  const employerErrors = useMemo<EmployerErrors>(() => {
    const errors: EmployerErrors = {};
    for (const [employerId, empState] of Object.entries(employers)) {
      const empErrors: Record<string, string> = {};
      for (const [dateKey, value] of Object.entries(empState.hours)) {
        if (value.trim()) {
          const validation = validateHours(value, MAX_HOURS_PER_DAY);
          if (!validation.isValid && validation.errorMessage) {
            empErrors[dateKey] = validation.errorMessage;
          }
        }
      }
      if (Object.keys(empErrors).length > 0) {
        errors[employerId] = empErrors;
      }
    }
    return errors;
  }, [employers]);

  /** Cross-employer 24h/day validation */
  const crossEmployerErrors = useMemo<CrossEmployerErrors>(() => {
    const errors: CrossEmployerErrors = {};

    for (const dateKey of dateKeys) {
      let dayTotal = 0;
      for (const empState of Object.values(employers)) {
        dayTotal += parseHoursValue(empState.hours[dateKey] ?? '');
      }
      dayTotal = Math.round(dayTotal * 100) / 100;

      if (dayTotal > MAX_HOURS_PER_DAY) {
        errors[dateKey] = `Total: ${dayTotal}h/${MAX_HOURS_PER_DAY}h`;
      }
    }
    return errors;
  }, [employers, dateKeys]);

  /** Dirty tracking: compare current vs initial (rounded to 2 decimals) */
  const isDirty = useMemo(() => {
    for (const [employerId, empState] of Object.entries(employers)) {
      const initial = initialEmployers[employerId];
      if (!initial) return true; // New employer not in initial

      for (const dateKey of dateKeys) {
        const currentValue = parseHoursValue(empState.hours[dateKey] ?? '');
        const initialValue = initial[dateKey] ?? 0;
        if (Math.round(currentValue * 100) !== Math.round(initialValue * 100))
          return true;
      }
    }
    return false;
  }, [employers, initialEmployers, dateKeys]);

  /** Can submit: dirty + no errors + week started */
  const canSubmit = useMemo(() => {
    if (!isDirty) return false;
    if (isSubmitting) return false;
    if (Object.keys(crossEmployerErrors).length > 0) return false;
    if (Object.keys(employerErrors).length > 0) return false;
    if (!isWeekStarted(monday)) return false;
    // Check individual employer weekly limits
    for (const total of Object.values(employerTotals)) {
      if (total > MAX_HOURS_PER_WEEK) return false;
    }
    return true;
  }, [
    isDirty,
    isSubmitting,
    crossEmployerErrors,
    employerErrors,
    monday,
    employerTotals,
  ]);

  return {
    employerTotals,
    weekTotal,
    employerErrors,
    crossEmployerErrors,
    isDirty,
    canSubmit,
  };
}
