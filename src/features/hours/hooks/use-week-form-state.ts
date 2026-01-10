/**
 * Week Form State Hook
 *
 * Consolidated state management for the unified week-based hours entry form.
 * Handles week navigation, daily hours management, auto-distribution,
 * pre-filling from existing data, and form submission.
 *
 * @module use-week-form-state
 */

import { addDays, format, subDays } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useEmployerHours, useSaveWeekHours } from '../api/use-hours';
import type {
  DayColumn,
  UseWeekFormStateExtendedReturn as ExtendedReturn,
  WeekFormActions,
  WeekFormState,
} from '../types/week-form';
import {
  formatDateKey,
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

/**
 * Result from distributing hours across weekdays
 */
interface DistributeHoursResult {
  dailyHours: Record<string, string>;
  error: string | null;
}

/**
 * Distributes total hours evenly across selected days.
 * Unselected days are set to empty.
 *
 * @param decimalValue - Total hours to distribute
 * @param dayColumns - Array of day columns for the week
 * @param currentDailyHours - Current daily hours to clone
 * @param selectedDays - Record of which days are selected for distribution
 * @returns Object with new daily hours and optional error
 */
function distributeHoursAcrossWeekdays(
  decimalValue: number,
  dayColumns: DayColumn[],
  currentDailyHours: Record<string, string>,
  selectedDays: Record<string, boolean>,
): DistributeHoursResult {
  const selectedCount = Object.values(selectedDays).filter(Boolean).length;

  // Prevent division by zero
  if (selectedCount === 0) {
    return {
      dailyHours: { ...currentDailyHours },
      error: 'Please select at least one day for distribution',
    };
  }

  const hoursPerDay = Math.round((decimalValue / selectedCount) * 100) / 100;
  const newDailyHours = { ...currentDailyHours };

  // Check if hours per day exceeds max
  if (hoursPerDay > MAX_HOURS_PER_DAY) {
    return {
      dailyHours: newDailyHours,
      error: `Cannot exceed ${MAX_HOURS_PER_DAY}h per day. Max total for ${selectedCount} day(s): ${MAX_HOURS_PER_DAY * selectedCount}h`,
    };
  }

  dayColumns.forEach((col) => {
    const isSelected = selectedDays[col.dateKey];
    if (isSelected) {
      newDailyHours[col.dateKey] =
        hoursPerDay > 0 ? hoursPerDay.toString() : '';
    } else {
      // Unselected days get 0
      newDailyHours[col.dateKey] = '';
    }
  });

  return { dailyHours: newDailyHours, error: null };
}

/**
 * Creates initial state for the week form
 */
function createInitialState(initialWeek?: Date): WeekFormState {
  const monday = getMondayOfWeek(initialWeek ?? new Date());
  const dateKeys = getWeekDates(monday).map(formatDateKey);

  // Initialize daily hours with empty strings for all 7 days
  const dailyHours: Record<string, string> = {};
  const initialHours: Record<string, number> = {};
  const selectedDays: Record<string, boolean> = {};

  dateKeys.forEach((key, index) => {
    dailyHours[key] = '';
    initialHours[key] = 0;
    // Default: Mon-Fri (index 0-4) selected, Sat-Sun (index 5-6) not selected
    selectedDays[key] = index < 5;
  });

  return {
    currentWeek: monday,
    dailyHours,
    autoDistribute: false,
    totalHours: '',
    isSubmitting: false,
    errors: {},
    selectedDays,
    initialHours,
  };
}

/**
 * Creates day columns for the current week
 * @param monday - Monday date of the week
 * @returns Array of 7 DayColumn objects
 */
function createDayColumns(monday: Date): DayColumn[] {
  const weekDates = getWeekDates(monday);

  return weekDates.map((date) => ({
    dateKey: formatDateKey(date),
    date,
    dayName: format(date, 'EEE'), // Mon, Tue, etc.
    dayNumber: format(date, 'd'), // 1, 2, etc.
    monthName: format(date, 'MMM'), // Jan, Feb, etc.
  }));
}

/**
 * Hook for managing week-based hours form state.
 *
 * Features:
 * - Week navigation with validation (can't go to incomplete weeks)
 * - Daily hours entry with per-day validation
 * - Auto-distribute mode (spread total hours across Mon-Fri)
 * - Pre-fill from existing employer hours
 * - Form submission with overwrite support
 *
 * @param employerId - The employer ID to manage hours for
 * @param initialWeek - Optional initial week date (defaults to current week)
 * @returns Object with state, actions, computed values, and day columns
 *
 * @example
 * ```tsx
 * const { state, actions, computedTotal, canSubmit, dayColumns } = useWeekFormState(
 *   'employer-123',
 *   new Date('2025-01-06')
 * );
 *
 * // Navigate weeks
 * actions.setWeek(addDays(state.currentWeek, 7));
 *
 * // Update hours for a day
 * actions.setDayHours('2025-01-06', '8');
 *
 * // Enable auto-distribute
 * actions.setAutoDistribute(true);
 * actions.setTotalHours('40');
 * ```
 */
export function useWeekFormState(
  employerId: string,
  initialWeek?: Date,
): ExtendedReturn {
  // Fetch existing hours for the employer
  const { data: existingHours } = useEmployerHours(employerId);

  // Mutation for saving hours with deletion support
  const saveWeekHoursMutation = useSaveWeekHours();

  // Core state
  const [state, setState] = useState<WeekFormState>(() =>
    createInitialState(initialWeek),
  );

  // Track if we've prefilled for the current week to avoid loops
  const [lastPrefilledWeek, setLastPrefilledWeek] = useState<string | null>(
    null,
  );

  // Compute day columns based on current week
  const dayColumns = useMemo(
    () => createDayColumns(state.currentWeek),
    [state.currentWeek],
  );

  // Compute week range string for display
  const weekRange = useMemo(
    () => getWeekRange(state.currentWeek),
    [state.currentWeek],
  );

  // Compute total from daily hours
  const computedTotal = useMemo(() => {
    let total = 0;
    for (const dateKey of Object.keys(state.dailyHours)) {
      const value = state.dailyHours[dateKey];
      if (value) {
        const validation = validateHours(value, MAX_HOURS_PER_DAY);
        if (validation.isValid && validation.decimalValue !== null) {
          total += validation.decimalValue;
        }
      }
    }
    return Math.round(total * 100) / 100; // Round to 2 decimals
  }, [state.dailyHours]);

  // Compute isDirty: check if dailyHours differ from initialHours
  const isDirty = useMemo(() => {
    const dateKeys = Object.keys(state.dailyHours);
    return dateKeys.some((key) => {
      const currentStr = state.dailyHours[key] || '';
      const currentValue =
        currentStr.trim() === '' ? 0 : parseFloat(currentStr) || 0;
      const initialValue = state.initialHours[key] || 0;
      // Compare with small tolerance for floating point
      return Math.abs(currentValue - initialValue) > 0.001;
    });
  }, [state.dailyHours, state.initialHours]);

  // Compute selectedDaysCount: count of days selected for auto-distribute
  const selectedDaysCount = useMemo(() => {
    return Object.values(state.selectedDays).filter(Boolean).length;
  }, [state.selectedDays]);

  // Compute maxTotalHours: 24 hours × selectedDaysCount
  const maxTotalHours = useMemo(() => {
    return MAX_HOURS_PER_DAY * selectedDaysCount;
  }, [selectedDaysCount]);

  // Validate if form can be submitted
  const canSubmit = useMemo(() => {
    // Must have employer
    if (!employerId) return false;

    // Must not be submitting
    if (state.isSubmitting) return false;

    // Must have no errors
    if (Object.keys(state.errors).length > 0) return false;

    // Must have changes from initial state
    if (!isDirty) return false;

    // Must not exceed max weekly hours
    if (computedTotal > MAX_HOURS_PER_WEEK) return false;

    // Week must be complete
    if (!isWeekStarted(state.currentWeek)) return false;

    return true;
  }, [
    employerId,
    state.isSubmitting,
    state.errors,
    isDirty,
    computedTotal,
    state.currentWeek,
  ]);

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Navigate to a different week
   */
  const setWeek = useCallback((date: Date) => {
    const monday = getMondayOfWeek(date);
    const dateKeys = getWeekDates(monday).map(formatDateKey);

    // Initialize daily hours, selectedDays, and initialHours for new week
    const dailyHours: Record<string, string> = {};
    const initialHours: Record<string, number> = {};
    const selectedDays: Record<string, boolean> = {};

    dateKeys.forEach((key, index) => {
      dailyHours[key] = '';
      initialHours[key] = 0;
      // Default: Mon-Fri (index 0-4) selected, Sat-Sun (index 5-6) not selected
      selectedDays[key] = index < 5;
    });

    setState((prev) => ({
      ...prev,
      currentWeek: monday,
      dailyHours,
      initialHours,
      selectedDays,
      errors: {},
      // Preserve auto-distribute and total hours settings
    }));
  }, []);

  /**
   * Update hours for a specific day with validation
   */
  const setDayHours = useCallback((dateKey: string, hours: string) => {
    // Validate the input
    const validation = validateHours(hours, MAX_HOURS_PER_DAY);

    setState((prev) => {
      const newErrors = { ...prev.errors };

      if (!validation.isValid && hours.trim() !== '') {
        newErrors[dateKey] = validation.errorMessage ?? 'Invalid hours';
      } else {
        delete newErrors[dateKey];
      }

      return {
        ...prev,
        dailyHours: {
          ...prev.dailyHours,
          [dateKey]: hours,
        },
        errors: newErrors,
        // When manually editing days, disable auto-distribute
        autoDistribute: false,
      };
    });
  }, []);

  /**
   * Toggle auto-distribute mode
   * When enabled, distributes totalHours across Mon-Fri
   */
  const setAutoDistribute = useCallback(
    (enabled: boolean) => {
      setState((prev) => {
        if (!enabled) {
          // Just disable, keep current values
          return { ...prev, autoDistribute: false };
        }

        // Enable and distribute hours if we have a total
        const totalValidation = validateHours(
          prev.totalHours,
          MAX_HOURS_PER_WEEK,
        );
        if (!totalValidation.isValid || !totalValidation.decimalValue) {
          return { ...prev, autoDistribute: true };
        }

        // Distribute hours to selected days using helper
        const newErrors = { ...prev.errors };
        const result = distributeHoursAcrossWeekdays(
          totalValidation.decimalValue,
          dayColumns,
          prev.dailyHours,
          prev.selectedDays,
        );

        if (result.error) {
          newErrors.total = result.error;
          return { ...prev, autoDistribute: true, errors: newErrors };
        }

        // Clear any day-specific errors when auto-distributing
        dayColumns.forEach((col) => delete newErrors[col.dateKey]);
        delete newErrors.total;

        return {
          ...prev,
          autoDistribute: true,
          dailyHours: result.dailyHours,
          errors: newErrors,
        };
      });
    },
    [dayColumns],
  );

  /**
   * Update total hours (used in auto-distribute mode)
   */
  const setTotalHours = useCallback(
    (hours: string) => {
      const validation = validateHours(hours, MAX_HOURS_PER_WEEK);

      setState((prev) => {
        const newErrors = { ...prev.errors };

        if (!validation.isValid && hours.trim() !== '') {
          newErrors.total = validation.errorMessage ?? 'Invalid hours';
        } else {
          delete newErrors.total;
        }

        const newState = {
          ...prev,
          totalHours: hours,
          errors: newErrors,
        };

        // If auto-distribute is on and we have valid hours, distribute
        if (
          prev.autoDistribute &&
          validation.isValid &&
          validation.decimalValue !== null
        ) {
          const result = distributeHoursAcrossWeekdays(
            validation.decimalValue,
            dayColumns,
            prev.dailyHours,
            prev.selectedDays,
          );

          if (result.error) {
            newErrors.total = result.error;
            return { ...newState, errors: newErrors };
          }

          // Clear day-specific errors
          dayColumns.forEach((col) => delete newErrors[col.dateKey]);

          return {
            ...newState,
            dailyHours: result.dailyHours,
            errors: newErrors,
          };
        }

        return newState;
      });
    },
    [dayColumns],
  );

  /**
   * Toggle a day's selection for auto-distribute
   * Validates that unchecking won't cause hours per day to exceed 24h
   * Redistributes hours if auto-distribute is active
   */
  const setDaySelected = useCallback(
    (dateKey: string, selected: boolean) => {
      setState((prev) => {
        const newSelectedDays = { ...prev.selectedDays, [dateKey]: selected };
        const newSelectedCount =
          Object.values(newSelectedDays).filter(Boolean).length;

        // Prevent unchecking if it would cause hours/day > 24h
        if (!selected && newSelectedCount > 0 && prev.autoDistribute) {
          const totalValidation = validateHours(
            prev.totalHours,
            MAX_HOURS_PER_WEEK,
          );
          if (totalValidation.isValid && totalValidation.decimalValue) {
            const hoursPerDay = totalValidation.decimalValue / newSelectedCount;
            if (hoursPerDay > MAX_HOURS_PER_DAY) {
              return {
                ...prev,
                errors: {
                  ...prev.errors,
                  [dateKey]: `Cannot uncheck: would exceed ${MAX_HOURS_PER_DAY}h/day`,
                },
              };
            }
          }
        }

        // Clear any error for this day
        const newErrors = { ...prev.errors };
        delete newErrors[dateKey];

        // If auto-distribute is active, redistribute hours with new selection
        if (prev.autoDistribute && prev.totalHours) {
          const totalValidation = validateHours(
            prev.totalHours,
            MAX_HOURS_PER_WEEK,
          );
          if (totalValidation.isValid && totalValidation.decimalValue) {
            const result = distributeHoursAcrossWeekdays(
              totalValidation.decimalValue,
              dayColumns,
              prev.dailyHours,
              newSelectedDays,
            );

            if (result.error) {
              newErrors.total = result.error;
              return {
                ...prev,
                selectedDays: newSelectedDays,
                errors: newErrors,
              };
            }

            // Clear day-specific errors when redistributing
            dayColumns.forEach((col) => delete newErrors[col.dateKey]);
            delete newErrors.total;

            return {
              ...prev,
              selectedDays: newSelectedDays,
              dailyHours: result.dailyHours,
              errors: newErrors,
            };
          }
        }

        return {
          ...prev,
          selectedDays: newSelectedDays,
          errors: newErrors,
        };
      });
    },
    [dayColumns],
  );

  /**
   * Reset form to initial state
   */
  const reset = useCallback(() => {
    setState(createInitialState(initialWeek));
    setLastPrefilledWeek(null);
  }, [initialWeek]);

  /**
   * Reset form to initial values from database
   * Reverts all daily hours to their original values
   */
  const resetToInitial = useCallback(() => {
    setState((prev) => {
      // Convert initialHours (numbers) back to dailyHours (strings)
      const newDailyHours: Record<string, string> = {};
      const newSelectedDays: Record<string, boolean> = {};

      Object.keys(prev.dailyHours).forEach((key, index) => {
        const initialValue = prev.initialHours[key] || 0;
        newDailyHours[key] = initialValue > 0 ? initialValue.toString() : '';
        // Reset to default: Mon-Fri (index 0-4) selected
        newSelectedDays[key] = index < 5;
      });

      return {
        ...prev,
        dailyHours: newDailyHours,
        selectedDays: newSelectedDays,
        autoDistribute: false,
        totalHours: '',
        errors: {},
      };
    });
  }, []);

  /**
   * Pre-fill form with existing hours data
   * Also stores the values in initialHours for dirty state comparison
   */
  const prefillFromExisting = useCallback(
    (hoursByDate: Record<string, number>) => {
      setState((prev) => {
        const newDailyHours = { ...prev.dailyHours };
        const newInitialHours = { ...prev.initialHours };

        // Fill in hours for days that have existing data
        // Also store in initialHours for dirty state tracking
        Object.entries(hoursByDate).forEach(([dateKey, hours]) => {
          if (dateKey in newDailyHours) {
            if (hours > 0) {
              newDailyHours[dateKey] = hours.toString();
              newInitialHours[dateKey] = hours;
            } else {
              newDailyHours[dateKey] = '';
              newInitialHours[dateKey] = 0;
            }
          }
        });

        return {
          ...prev,
          dailyHours: newDailyHours,
          initialHours: newInitialHours,
          // Don't enable auto-distribute when pre-filling
          autoDistribute: false,
          errors: {},
        };
      });
    },
    [],
  );

  // ============================================
  // SUBMISSION
  // ============================================

  /**
   * Submit form data to save hours for the week
   * Transforms daily hours to work entries and calls the mutation
   * Supports both upsert (hours > 0) and delete (hours === 0) operations
   */
  const submit = useCallback(async (): Promise<boolean> => {
    if (!canSubmit || !employerId) {
      return false;
    }

    // Set submitting state
    setState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      // Transform ALL daily hours (including zeros) for proper deletion support
      const weekEntries: Array<{ work_date: string; hours: number }> = [];

      Object.entries(state.dailyHours).forEach(([dateKey, hoursStr]) => {
        const validation = validateHours(hoursStr || '0', MAX_HOURS_PER_DAY);
        const hours = validation.decimalValue || 0;
        weekEntries.push({
          work_date: dateKey,
          hours: hours,
        });
      });

      // Get existing dates from initialHours for deletion logic
      // Only dates with hours > 0 in the database need to be considered for deletion
      const existingDates = Object.entries(state.initialHours)
        .filter(([, hours]) => hours > 0)
        .map(([dateKey]) => dateKey);

      // Execute the mutation with new API
      await saveWeekHoursMutation.mutateAsync({
        employerId,
        weekEntries,
        existingDates,
      });

      // Update initial hours to reflect saved state (for dirty tracking)
      const newInitialHours: Record<string, number> = {};
      weekEntries.forEach((e) => {
        newInitialHours[e.work_date] = e.hours;
      });

      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        initialHours: newInitialHours,
      }));

      return true;
    } catch {
      // Reset submitting state on error
      setState((prev) => ({ ...prev, isSubmitting: false }));
      return false;
    }
  }, [canSubmit, employerId, state.dailyHours, state.initialHours, saveWeekHoursMutation]);

  /**
   * Check if form is currently submitting
   */
  const isSubmitting = saveWeekHoursMutation.isPending || state.isSubmitting;

  // ============================================
  // EFFECTS
  // ============================================

  /**
   * Pre-fill effect: When week changes or existing hours load,
   * automatically populate form with existing data
   */
  useEffect(() => {
    if (!existingHours || existingHours.length === 0) return;

    const weekKey = formatDateKey(state.currentWeek);

    // Avoid re-prefilling the same week
    if (lastPrefilledWeek === weekKey) return;

    // Build hours by date map for the current week
    const weekDateKeys = getWeekDates(state.currentWeek).map(formatDateKey);
    const hoursByDate: Record<string, number> = {};

    let hasDataForWeek = false;
    existingHours.forEach((entry) => {
      if (weekDateKeys.includes(entry.work_date)) {
        hoursByDate[entry.work_date] = entry.hours;
        hasDataForWeek = true;
      }
    });

    // Only prefill if there's data for this week
    if (hasDataForWeek) {
      prefillFromExisting(hoursByDate);
    }

    setLastPrefilledWeek(weekKey);
  }, [
    existingHours,
    state.currentWeek,
    lastPrefilledWeek,
    prefillFromExisting,
  ]);

  // ============================================
  // NAVIGATION HELPERS
  // ============================================

  /**
   * Check if can navigate to previous week
   */
  const canGoPrevWeek = useMemo(() => {
    // Can always go to previous weeks (they're in the past)
    return true;
  }, []);

  /**
   * Check if can navigate to next week
   */
  const canGoNextWeek = useMemo(() => {
    const nextMonday = addDays(state.currentWeek, 7);
    return isWeekStarted(nextMonday);
  }, [state.currentWeek]);

  /**
   * Navigate to previous week
   */
  const goPrevWeek = useCallback(() => {
    const prevMonday = subDays(state.currentWeek, 7);
    setWeek(prevMonday);
  }, [state.currentWeek, setWeek]);

  /**
   * Navigate to next week
   */
  const goNextWeek = useCallback(() => {
    if (canGoNextWeek) {
      const nextMonday = addDays(state.currentWeek, 7);
      setWeek(nextMonday);
    }
  }, [state.currentWeek, canGoNextWeek, setWeek]);

  // ============================================
  // RETURN
  // ============================================

  const actions: WeekFormActions = useMemo(
    () => ({
      setWeek,
      setDayHours,
      setAutoDistribute,
      setTotalHours,
      reset,
      prefillFromExisting,
      setDaySelected,
      resetToInitial,
    }),
    [
      setWeek,
      setDayHours,
      setAutoDistribute,
      setTotalHours,
      reset,
      prefillFromExisting,
      setDaySelected,
      resetToInitial,
    ],
  );

  return {
    state: {
      ...state,
      // Override isSubmitting with the combined state from mutation + local
      isSubmitting,
    },
    actions,
    computedTotal,
    canSubmit,
    dayColumns,
    weekRange,
    // Dirty state and selected days
    isDirty,
    selectedDaysCount,
    maxTotalHours,
    // Navigation helpers
    canGoPrevWeek,
    canGoNextWeek,
    goPrevWeek,
    goNextWeek,
    // Submission
    submit,
  };
}

// Re-export the extended return type for consumers
export type { UseWeekFormStateExtendedReturn } from '../types/week-form';
