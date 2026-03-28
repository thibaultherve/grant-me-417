import { useCallback, useMemo } from 'react';

import type { UseMutationResult } from '@tanstack/react-query';
import type { SaveWeekBatch, WeekEntriesResponse } from '@regranted/shared';

import type {
  EmployerHoursState,
  LogHoursActions,
  LogHoursFormState,
} from '../types/log-hours';
import { validateHours } from '../utils/hours-validation';
import {
  buildStateFromServer,
  createDefaultEmployerState,
  distributeHours,
  parseHoursValue,
} from '../utils/log-hours-helpers';
import { MAX_HOURS_PER_WEEK } from '../utils/week-calculations';

export function useLogHoursActions(
  setState: React.Dispatch<React.SetStateAction<LogHoursFormState>>,
  dateKeys: string[],
  serverData: WeekEntriesResponse | undefined,
  canSubmit: boolean,
  saveWeekBatchMutation: UseMutationResult<
    WeekEntriesResponse,
    Error,
    SaveWeekBatch
  >,
  weekStartKey: string,
  employers: Record<string, EmployerHoursState>,
): LogHoursActions & { submit: () => Promise<boolean> } {
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
    [setState],
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
    [dateKeys, setState],
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
    [dateKeys, setState],
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
    [dateKeys, setState],
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
    [dateKeys, setState],
  );

  const resetAll = useCallback(() => {
    if (!serverData) return;

    const { employers: newEmployers, initialEmployers } =
      buildStateFromServer(serverData, dateKeys);

    setState({
      employers: newEmployers,
      initialEmployers,
      isSubmitting: false,
    });
  }, [serverData, dateKeys, setState]);

  const submit = useCallback(async (): Promise<boolean> => {
    if (!canSubmit) return false;

    setState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const entries = Object.entries(employers).map(
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
  }, [
    canSubmit,
    employers,
    dateKeys,
    weekStartKey,
    saveWeekBatchMutation,
    setState,
  ]);

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

  return { ...actions, submit };
}
