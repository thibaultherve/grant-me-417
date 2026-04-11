import { useMemo, useState } from 'react';

import { useSaveWeekBatch, useWeekEntries } from '../api/use-hours';
import type { LogHoursFormState, LogHoursReturn } from '../types/log-hours';
import {
  formatDateKey,
  getCompactWeekRange,
  getMondayOfWeek,
  getWeekRange,
} from '../utils/date-helpers';
import {
  buildStateFromServer,
  createDayColumns,
} from '../utils/log-hours-helpers';

import { useLogHoursActions } from './use-log-hours-actions';
import { useLogHoursValidation } from './use-log-hours-validation';

/**
 * Core multi-employer form state hook for the Log Hours page.
 *
 * Orchestrates:
 * - Computed date info (dayColumns, dateKeys, weekRange, compactWeekRange)
 * - Server data fetch (useWeekEntries)
 * - Form state (useState) + server sync (useEffect)
 * - Validation (useLogHoursValidation)
 * - Actions (useLogHoursActions)
 *
 * @param currentWeek - Monday of the currently displayed week
 */
export function useLogHoursState(currentWeek: Date): LogHoursReturn {
  const monday = getMondayOfWeek(currentWeek);
  const weekStartKey = formatDateKey(monday);

  // ── Server data ──
  const { data: serverData } = useWeekEntries(weekStartKey);
  const saveWeekBatchMutation = useSaveWeekBatch();

  // ── Core form state ──
  const [state, setState] = useState<LogHoursFormState>({
    employers: {},
    initialEmployers: {},
    isSubmitting: false,
  });

  // Track which weekStart we last synced from server. Kept in state so we
  // can trigger a render-phase resync when the week changes AND new server
  // data is available — React's official pattern for adjusting state on
  // prop change (no useEffect needed).
  const [syncedWeek, setSyncedWeek] = useState<string | null>(null);

  // ── Day columns for current week ──
  const dayColumns = useMemo(() => createDayColumns(monday), [monday]);
  const dateKeys = useMemo(
    () => dayColumns.map((c) => c.dateKey),
    [dayColumns],
  );
  const weekRange = useMemo(() => getWeekRange(monday), [monday]);
  const compactWeekRange = useMemo(() => getCompactWeekRange(monday), [monday]);

  // ── Render-phase sync from server ──
  if (serverData && syncedWeek !== weekStartKey) {
    const { employers, initialEmployers } = buildStateFromServer(
      serverData,
      dateKeys,
    );
    setState({
      employers,
      initialEmployers,
      isSubmitting: false,
    });
    setSyncedWeek(weekStartKey);
  }

  // ── Validation ──
  const {
    employerTotals,
    weekTotal,
    employerErrors,
    crossEmployerErrors,
    isDirty,
    canSubmit,
  } = useLogHoursValidation(
    state.employers,
    state.initialEmployers,
    state.isSubmitting,
    dateKeys,
    monday,
  );

  const isSubmitting = saveWeekBatchMutation.isPending || state.isSubmitting;

  // ── Actions ──
  const { submit, ...actions } = useLogHoursActions(
    setState,
    dateKeys,
    serverData,
    canSubmit,
    saveWeekBatchMutation,
    weekStartKey,
    state.employers,
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
