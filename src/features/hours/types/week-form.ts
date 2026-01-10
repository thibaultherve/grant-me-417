/**
 * Types for the unified week-based hours entry form.
 * These types consolidate the state management previously split
 * across by-day-form.tsx and by-week-form.tsx into a single cohesive model.
 */

/**
 * State interface for the week hours form.
 * Consolidates all form state into a single object for easier management.
 */
export type WeekFormState = {
  /** Monday of the currently selected week */
  currentWeek: Date;
  /** Hours per day indexed by date key (YYYY-MM-DD format) */
  dailyHours: Record<string, string>;
  /** Whether auto-distribute mode is enabled */
  autoDistribute: boolean;
  /** Total hours input value (string to preserve user input format) */
  totalHours: string;
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
  /** Validation errors indexed by field key (date keys or 'total') */
  errors: Record<string, string>;
  /** Selected days for auto-distribute, indexed by date key (YYYY-MM-DD format) */
  selectedDays: Record<string, boolean>;
  /** Initial hours from database, used for dirty state comparison */
  initialHours: Record<string, number>;
};

/**
 * Actions interface for the week hours form.
 * Defines all state mutations available to the form.
 */
export type WeekFormActions = {
  /** Navigate to a different week */
  setWeek: (date: Date) => void;
  /** Update hours for a specific day */
  setDayHours: (dateKey: string, hours: string) => void;
  /** Toggle auto-distribute mode */
  setAutoDistribute: (enabled: boolean) => void;
  /** Update total hours (when auto-distribute is enabled) */
  setTotalHours: (hours: string) => void;
  /** Reset the form to initial state */
  reset: () => void;
  /** Pre-fill form with existing hours data */
  prefillFromExisting: (hoursByDate: Record<string, number>) => void;
  /** Toggle a day's selection for auto-distribute */
  setDaySelected: (dateKey: string, selected: boolean) => void;
  /** Reset form to initial values from database */
  resetToInitial: () => void;
};

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

/**
 * Combined interface for the useWeekFormState hook return value.
 * Provides both state and actions in a single object.
 */
export type WeekFormReturn = {
  /** Current form state */
  state: WeekFormState;
  /** Available actions to modify state */
  actions: WeekFormActions;
  /** Computed total hours from daily entries */
  computedTotal: number;
  /** Whether the form is valid and can be submitted */
  canSubmit: boolean;
  /** Array of day columns for the current week */
  dayColumns: DayColumn[];
  /** Whether form has changes from initial values */
  isDirty: boolean;
  /** Number of days selected for auto-distribute */
  selectedDaysCount: number;
  /** Maximum total hours based on selected days (24 * selectedDaysCount) */
  maxTotalHours: number;
  /** Formatted week range string (e.g., "Mon 6 Jan - Sun 12 Jan 2025") */
  weekRange: string;
  /** Whether navigation to previous week is allowed */
  canGoPrevWeek: boolean;
  /** Whether navigation to next week is allowed */
  canGoNextWeek: boolean;
  /** Navigate to previous week */
  goPrevWeek: () => void;
  /** Navigate to next week */
  goNextWeek: () => void;
  /** Submit form and save hours */
  submit: () => Promise<boolean>;
  /** Dates that have work hours logged (for calendar highlighting) */
  datesWithHours: Date[];
};
