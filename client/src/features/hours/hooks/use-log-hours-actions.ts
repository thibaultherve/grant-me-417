import type { SaveWeekBatch, WeekEntriesResponse } from '@regranted/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import type {
  EmployerHoursState,
  LogHoursActions,
  LogHoursFormState,
} from '../types/log-hours';
import { parseHoursValue } from '../utils/log-hours-helpers';
import {
  applyResetAll,
  applyResetEmployer,
  applySetDayHours,
  applySetTotalHours,
  applyToggleAutoDistribute,
  applyToggleDaySelected,
} from '../utils/log-hours-reducers';

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
    (employerId: string, dateKey: string, value: string) =>
      setState((prev) => applySetDayHours(prev, employerId, dateKey, value)),
    [setState],
  );

  const toggleAutoDistribute = useCallback(
    (employerId: string) =>
      setState((prev) => applyToggleAutoDistribute(prev, employerId, dateKeys)),
    [dateKeys, setState],
  );

  const toggleDaySelected = useCallback(
    (employerId: string, dateKey: string) =>
      setState((prev) =>
        applyToggleDaySelected(prev, employerId, dateKey, dateKeys),
      ),
    [dateKeys, setState],
  );

  const setTotalHours = useCallback(
    (employerId: string, value: string) =>
      setState((prev) => applySetTotalHours(prev, employerId, value, dateKeys)),
    [dateKeys, setState],
  );

  const resetEmployer = useCallback(
    (employerId: string) =>
      setState((prev) => applyResetEmployer(prev, employerId, dateKeys)),
    [dateKeys, setState],
  );

  const resetAll = useCallback(() => {
    if (!serverData) return;
    setState(applyResetAll(serverData, dateKeys));
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
