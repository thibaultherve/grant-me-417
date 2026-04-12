import type { WeekEntriesResponse } from '@regranted/shared';

import type { LogHoursFormState } from '../types/log-hours';

import { validateHours } from './hours-validation';
import {
  buildStateFromServer,
  createDefaultEmployerState,
  distributeHours,
} from './log-hours-helpers';
import { MAX_HOURS_PER_WEEK } from './week-calculations';

export function applySetDayHours(
  state: LogHoursFormState,
  employerId: string,
  dateKey: string,
  value: string,
): LogHoursFormState {
  const empState = state.employers[employerId];
  if (!empState) return state;

  return {
    ...state,
    employers: {
      ...state.employers,
      [employerId]: {
        ...empState,
        hours: { ...empState.hours, [dateKey]: value },
        // Disable auto-distribute when manually editing
        autoDistribute: false,
      },
    },
  };
}

export function applyToggleAutoDistribute(
  state: LogHoursFormState,
  employerId: string,
  dateKeys: string[],
): LogHoursFormState {
  const empState = state.employers[employerId];
  if (!empState) return state;

  const newAutoDistribute = !empState.autoDistribute;

  if (!newAutoDistribute) {
    return {
      ...state,
      employers: {
        ...state.employers,
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
        ...state,
        employers: {
          ...state.employers,
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
    ...state,
    employers: {
      ...state.employers,
      [employerId]: { ...empState, autoDistribute: true },
    },
  };
}

export function applyToggleDaySelected(
  state: LogHoursFormState,
  employerId: string,
  dateKey: string,
  dateKeys: string[],
): LogHoursFormState {
  const empState = state.employers[employerId];
  if (!empState) return state;

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
    ...state,
    employers: {
      ...state.employers,
      [employerId]: {
        ...empState,
        selectedDays: newSelected,
        hours: newHours,
      },
    },
  };
}

export function applySetTotalHours(
  state: LogHoursFormState,
  employerId: string,
  value: string,
  dateKeys: string[],
): LogHoursFormState {
  const empState = state.employers[employerId];
  if (!empState) return state;

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
    ...state,
    employers: {
      ...state.employers,
      [employerId]: {
        ...empState,
        totalHours: value,
        hours: newHours,
      },
    },
  };
}

export function applyResetEmployer(
  state: LogHoursFormState,
  employerId: string,
  dateKeys: string[],
): LogHoursFormState {
  const initial = state.initialEmployers[employerId];
  if (!initial) return state;

  const resetState = createDefaultEmployerState(dateKeys);
  // Restore initial hours
  for (const dateKey of dateKeys) {
    const value = initial[dateKey] ?? 0;
    resetState.hours[dateKey] = value > 0 ? value.toString() : '';
  }

  return {
    ...state,
    employers: {
      ...state.employers,
      [employerId]: resetState,
    },
  };
}

export function applyResetAll(
  serverData: WeekEntriesResponse,
  dateKeys: string[],
): LogHoursFormState {
  const { employers, initialEmployers } = buildStateFromServer(
    serverData,
    dateKeys,
  );
  return {
    employers,
    initialEmployers,
    isSubmitting: false,
  };
}
