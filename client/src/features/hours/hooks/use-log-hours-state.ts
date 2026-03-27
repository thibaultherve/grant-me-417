import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { WeekEntriesResponse } from '@regranted/shared';

import { useSaveWeekBatch, useWeekEntries } from '../api/use-hours';
import type {
  CrossEmployerErrors,
  EmployerErrors,
  EmployerHoursState,
  LogHoursActions,
  LogHoursFormState,
  LogHoursReturn,
} from '../types/log-hours';
import type { DayColumn } from '../types/log-hours';
import {
  formatDateKey,
  getCompactWeekRange,
  getMondayOfWeek,
  getWeekDates,
  getWeekRange,
} from '../utils/date-helpers';
import { validateHours } from '../utils/hours-validation';
import {
  MAX_HOURS_PER_DAY,
  MAX_HOURS_PER_WEEK,
} from '../utils/week-calculations';
import { isWeekStarted } from '../utils/week-validation';

// ============================================
// HELPERS
// ============================================

function createDayColumns(monday: Date): DayColumn[] {
  return getWeekDates(monday).map((date) => ({
    dateKey: formatDateKey(date),
    date,
    dayName: format(date, 'EEE'),
    dayNumber: format(date, 'd'),
    monthName: format(date, 'MMM'),
  }));
}

function createDefaultEmployerState(
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

/** Parse a string hours input to a number, defaulting to 0 */
function parseHoursValue(value: string): number {
  if (!value.trim()) return 0;
  const validation = validateHours(value, MAX_HOURS_PER_DAY);
  return validation.isValid && validation.decimalValue !== null
    ? validation.decimalValue
    : 0;
}

/** Compute total for a single employer from their hours strings */
function computeEmployerTotal(hours: Record<string, string>): number {
  let total = 0;
  for (const value of Object.values(hours)) {
    total += parseHoursValue(value);
  }
  return Math.round(total * 100) / 100;
}

/** Build employer state from server data */
function buildStateFromServer(
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
function distributeHours(
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

// ============================================
// HOOK
// ============================================

/**
 * Core multi-employer form state hook for the Log Hours page.
 *
 * Manages:
 * - Per-employer hours, auto-distribute, selected days
 * - Cross-employer 24h/day validation (real-time)
 * - Dirty tracking (current state vs server data)
 * - Submit (batch PUT via useSaveWeekBatch)
 *
 * @param currentWeek - Monday of the currently displayed week
 */
export function useLogHoursState(currentWeek: Date): LogHoursReturn {
  const monday = getMondayOfWeek(currentWeek);
  const weekStartKey = formatDateKey(monday);

  // Server data
  const { data: serverData } = useWeekEntries(weekStartKey);
  const saveWeekBatchMutation = useSaveWeekBatch();

  // Core form state
  const [state, setState] = useState<LogHoursFormState>({
    employers: {},
    initialEmployers: {},
    isSubmitting: false,
  });

  // Track which weekStart we last synced from server to avoid re-sync loops
  const lastSyncedWeek = useRef<string | null>(null);

  // Day columns for current week
  const dayColumns = useMemo(() => createDayColumns(monday), [monday]);
  const dateKeys = useMemo(() => dayColumns.map((c) => c.dateKey), [dayColumns]);
  const weekRange = useMemo(() => getWeekRange(monday), [monday]);
  const compactWeekRange = useMemo(() => getCompactWeekRange(monday), [monday]);

  // ============================================
  // SYNC FROM SERVER
  // ============================================

  useEffect(() => {
    if (!serverData) return;
    if (lastSyncedWeek.current === weekStartKey) return;

    const { employers, initialEmployers } = buildStateFromServer(
      serverData,
      dateKeys,
    );

    setState({
      employers,
      initialEmployers,
      isSubmitting: false,
    });
    lastSyncedWeek.current = weekStartKey;
  }, [serverData, weekStartKey, dateKeys]);

  // Reset sync tracker when week changes so next server data triggers sync
  useEffect(() => {
    lastSyncedWeek.current = null;
  }, [weekStartKey]);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  /** Per-employer computed totals */
  const employerTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const [employerId, empState] of Object.entries(state.employers)) {
      totals[employerId] = computeEmployerTotal(empState.hours);
    }
    return totals;
  }, [state.employers]);

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
    for (const [employerId, empState] of Object.entries(state.employers)) {
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
  }, [state.employers]);

  /** Cross-employer 24h/day validation */
  const crossEmployerErrors = useMemo<CrossEmployerErrors>(() => {
    const errors: CrossEmployerErrors = {};

    for (const dateKey of dateKeys) {
      let dayTotal = 0;
      for (const empState of Object.values(state.employers)) {
        dayTotal += parseHoursValue(empState.hours[dateKey] ?? '');
      }
      dayTotal = Math.round(dayTotal * 100) / 100;

      if (dayTotal > MAX_HOURS_PER_DAY) {
        errors[dateKey] = `Total: ${dayTotal}h/${MAX_HOURS_PER_DAY}h`;
      }
    }
    return errors;
  }, [state.employers, dateKeys]);

  /** Dirty tracking: compare current vs initial */
  const isDirty = useMemo(() => {
    for (const [employerId, empState] of Object.entries(state.employers)) {
      const initial = state.initialEmployers[employerId];
      if (!initial) return true; // New employer not in initial

      for (const dateKey of dateKeys) {
        const currentValue = parseHoursValue(empState.hours[dateKey] ?? '');
        const initialValue = initial[dateKey] ?? 0;
        if (Math.abs(currentValue - initialValue) > 0.001) return true;
      }
    }
    return false;
  }, [state.employers, state.initialEmployers, dateKeys]);

  /** Can submit: dirty + no errors + week started */
  const canSubmit = useMemo(() => {
    if (!isDirty) return false;
    if (state.isSubmitting) return false;
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
    state.isSubmitting,
    crossEmployerErrors,
    employerErrors,
    monday,
    employerTotals,
  ]);

  const isSubmitting =
    saveWeekBatchMutation.isPending || state.isSubmitting;

  // ============================================
  // ACTIONS
  // ============================================

  const setDayHours = useCallback(
    (employerId: string, dateKey: string, value: string) => {
      setState((prev) => {
        const empState = prev.employers[employerId];
        if (!empState) return prev;

        return {
          ...prev,
          employers: {
            ...prev.employers,
            [employerId]: {
              ...empState,
              hours: { ...empState.hours, [dateKey]: value },
              // Disable auto-distribute when manually editing
              autoDistribute: false,
            },
          },
        };
      });
    },
    [],
  );

  const toggleAutoDistribute = useCallback(
    (employerId: string) => {
      setState((prev) => {
        const empState = prev.employers[employerId];
        if (!empState) return prev;

        const newAutoDistribute = !empState.autoDistribute;

        if (!newAutoDistribute) {
          // Just disable, keep current values
          return {
            ...prev,
            employers: {
              ...prev.employers,
              [employerId]: { ...empState, autoDistribute: false },
            },
          };
        }

        // Enable: if we have a valid total, distribute
        const totalValidation = validateHours(
          empState.totalHours,
          MAX_HOURS_PER_WEEK,
        );
        if (totalValidation.isValid && totalValidation.decimalValue) {
          const distributed = distributeHours(
            totalValidation.decimalValue,
            dateKeys,
            empState.selectedDays,
          );
          if (distributed) {
            return {
              ...prev,
              employers: {
                ...prev.employers,
                [employerId]: {
                  ...empState,
                  autoDistribute: true,
                  hours: distributed,
                },
              },
            };
          }
        }

        return {
          ...prev,
          employers: {
            ...prev.employers,
            [employerId]: { ...empState, autoDistribute: true },
          },
        };
      });
    },
    [dateKeys],
  );

  const toggleDaySelected = useCallback(
    (employerId: string, dateKey: string) => {
      setState((prev) => {
        const empState = prev.employers[employerId];
        if (!empState) return prev;

        const newSelected = {
          ...empState.selectedDays,
          [dateKey]: !empState.selectedDays[dateKey],
        };

        let newHours = empState.hours;

        // If auto-distribute is active, redistribute with new selection
        if (empState.autoDistribute && empState.totalHours) {
          const totalValidation = validateHours(
            empState.totalHours,
            MAX_HOURS_PER_WEEK,
          );
          if (totalValidation.isValid && totalValidation.decimalValue) {
            const distributed = distributeHours(
              totalValidation.decimalValue,
              dateKeys,
              newSelected,
            );
            if (distributed) {
              newHours = distributed;
            }
          }
        }

        return {
          ...prev,
          employers: {
            ...prev.employers,
            [employerId]: {
              ...empState,
              selectedDays: newSelected,
              hours: newHours,
            },
          },
        };
      });
    },
    [dateKeys],
  );

  const setTotalHours = useCallback(
    (employerId: string, value: string) => {
      setState((prev) => {
        const empState = prev.employers[employerId];
        if (!empState) return prev;

        let newHours = empState.hours;

        // If auto-distribute is on, redistribute
        if (empState.autoDistribute) {
          const validation = validateHours(value, MAX_HOURS_PER_WEEK);
          if (validation.isValid && validation.decimalValue !== null) {
            const distributed = distributeHours(
              validation.decimalValue,
              dateKeys,
              empState.selectedDays,
            );
            if (distributed) {
              newHours = distributed;
            }
          }
        }

        return {
          ...prev,
          employers: {
            ...prev.employers,
            [employerId]: {
              ...empState,
              totalHours: value,
              hours: newHours,
            },
          },
        };
      });
    },
    [dateKeys],
  );

  const resetEmployer = useCallback(
    (employerId: string) => {
      setState((prev) => {
        const initial = prev.initialEmployers[employerId];
        if (!initial) return prev;

        const resetState = createDefaultEmployerState(dateKeys);
        // Restore initial hours
        for (const dateKey of dateKeys) {
          const value = initial[dateKey] ?? 0;
          resetState.hours[dateKey] = value > 0 ? value.toString() : '';
        }

        return {
          ...prev,
          employers: {
            ...prev.employers,
            [employerId]: resetState,
          },
        };
      });
    },
    [dateKeys],
  );

  const resetAll = useCallback(() => {
    if (!serverData) return;

    const { employers, initialEmployers } = buildStateFromServer(
      serverData,
      dateKeys,
    );

    setState({
      employers,
      initialEmployers,
      isSubmitting: false,
    });
  }, [serverData, dateKeys]);

  // ============================================
  // SUBMIT
  // ============================================

  const submit = useCallback(async (): Promise<boolean> => {
    if (!canSubmit) return false;

    setState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const entries = Object.entries(state.employers).map(
        ([employerId, empState]) => {
          const hours: Record<string, number> = {};
          for (const dateKey of dateKeys) {
            hours[dateKey] = parseHoursValue(empState.hours[dateKey] ?? '');
          }
          return { employerId, hours };
        },
      );

      await saveWeekBatchMutation.mutateAsync({
        weekStart: weekStartKey,
        entries,
      });

      // Update initial state to match saved state (reset dirty tracking)
      setState((prev) => {
        const newInitial: Record<string, Record<string, number>> = {};
        for (const entry of entries) {
          newInitial[entry.employerId] = { ...entry.hours };
        }
        return {
          ...prev,
          isSubmitting: false,
          initialEmployers: newInitial,
        };
      });

      return true;
    } catch {
      setState((prev) => ({ ...prev, isSubmitting: false }));
      return false;
    }
  }, [canSubmit, state.employers, dateKeys, weekStartKey, saveWeekBatchMutation]);

  // ============================================
  // RETURN
  // ============================================

  const actions: LogHoursActions = useMemo(
    () => ({
      setDayHours,
      toggleAutoDistribute,
      toggleDaySelected,
      setTotalHours,
      resetEmployer,
      resetAll,
    }),
    [
      setDayHours,
      toggleAutoDistribute,
      toggleDaySelected,
      setTotalHours,
      resetEmployer,
      resetAll,
    ],
  );

  return {
    state,
    actions,
    dayColumns,
    weekRange,
    compactWeekRange,
    isDirty,
    canSubmit,
    isSubmitting,
    employerErrors,
    crossEmployerErrors,
    employerTotals,
    weekTotal,
    serverData,
    submit,
  };
}
