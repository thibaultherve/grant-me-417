import type { WeekEntriesResponse } from '@regranted/shared';

/**
 * Represents a single day column in the week hours grid.
 * Contains all display information needed for a day header cell.
 */
export type DayColumn = {
  /** Date in YYYY-MM-DD format, used as key for dailyHours lookup */
  dateKey: string;
  /** Full Date object for date operations */
  date: Date;
  /** Short day name (e.g., 'Mon', 'Tue') */
  dayName: string;
  /** Day of month (e.g., '15', '16') */
  dayNumber: string;
  /** Short month name (e.g., 'Apr', 'May') */
  monthName: string;
};

export interface EmployerHoursState {
  hours: Record<string, string>; // dateKey -> hours (string to preserve user input format)
  autoDistribute: boolean;
  selectedDays: Record<string, boolean>; // dateKeys selected for auto-distribute
  totalHours: string; // total for auto-distribute input (string for input binding)
}

export interface LogHoursFormState {
  employers: Record<string, EmployerHoursState>; // employerId -> state
  initialEmployers: Record<string, Record<string, number>>; // employerId -> dateKey -> hours (from server)
  isSubmitting: boolean;
}

export interface CrossEmployerErrors {
  /** dateKey -> error message (e.g., "Total: 26h/24h") */
  [dateKey: string]: string;
}

export interface EmployerErrors {
  /** employerId -> dateKey -> error message */
  [employerId: string]: Record<string, string>;
}

export interface LogHoursActions {
  setDayHours: (employerId: string, dateKey: string, value: string) => void;
  toggleAutoDistribute: (employerId: string) => void;
  toggleDaySelected: (employerId: string, dateKey: string) => void;
  setTotalHours: (employerId: string, value: string) => void;
  resetEmployer: (employerId: string) => void;
  resetAll: () => void;
}

export interface LogHoursReturn {
  state: LogHoursFormState;
  actions: LogHoursActions;
  dayColumns: DayColumn[];
  weekRange: string;
  compactWeekRange: string;
  isDirty: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  employerErrors: EmployerErrors;
  crossEmployerErrors: CrossEmployerErrors;
  employerTotals: Record<string, number>; // employerId -> computed total
  weekTotal: number; // sum of all employers
  serverData: WeekEntriesResponse | undefined; // raw server response with employer metadata
  submit: () => Promise<boolean>;
}
