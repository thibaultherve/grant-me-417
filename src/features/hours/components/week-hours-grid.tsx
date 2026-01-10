/**
 * Week Hours Grid Component
 *
 * Displays a responsive table layout with employer name, 7 day columns (Mon-Sun),
 * a calculated total column, and a reset button. Each day column has a checkbox
 * for auto-distribute selection.
 *
 * @example
 * ```tsx
 * <WeekHoursGrid
 *   employerName="ABC Pty Ltd"
 *   dayColumns={dayColumns}
 *   dailyHours={state.dailyHours}
 *   onDayChange={actions.setDayHours}
 *   errors={state.errors}
 *   computedTotal={computedTotal}
 *   selectedDays={state.selectedDays}
 *   onDaySelectedChange={actions.setDaySelected}
 *   onReset={actions.resetToInitial}
 *   isDirty={isDirty}
 * />
 * ```
 */

import { RotateCcw } from 'lucide-react';
import { memo } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import type { DayColumn } from '../types/week-form';
import { formatDecimalHours } from '../utils/hours-validation';
import { DayHoursCell } from './day-hours-cell';

interface WeekHoursGridProps {
  /** Employer name to display in the first column */
  employerName: string;
  /** Array of 7 day columns for the current week */
  dayColumns: DayColumn[];
  /** Hours per day indexed by date key (YYYY-MM-DD format) */
  dailyHours: Record<string, string>;
  /** Callback when a day's hours change */
  onDayChange: (dateKey: string, value: string) => void;
  /** Validation errors indexed by date key */
  errors: Record<string, string>;
  /** Computed total hours for the week */
  computedTotal: number;
  /** Selected days for auto-distribute indexed by date key */
  selectedDays: Record<string, boolean>;
  /** Callback when a day's selection state changes */
  onDaySelectedChange: (dateKey: string, selected: boolean) => void;
  /** Callback when reset button is clicked */
  onReset: () => void;
  /** Whether form has changes from initial state */
  isDirty: boolean;
  /** Whether all inputs are disabled */
  disabled?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

export const WeekHoursGrid = memo(function WeekHoursGrid({
  employerName,
  dayColumns,
  dailyHours,
  onDayChange,
  errors,
  computedTotal,
  selectedDays,
  onDaySelectedChange,
  onReset,
  isDirty,
  disabled = false,
  className,
}: WeekHoursGridProps) {
  return (
    <TooltipProvider>
      <div
        className={cn(
          'w-full overflow-x-auto rounded-lg border bg-card',
          className,
        )}
      >
        <div className="min-w-fit p-4">
          {/* Grid container */}
          <div className="flex items-end gap-3">
            {/* Employer column */}
            <div className="flex min-w-24 flex-col items-start justify-end gap-1 pb-1">
              <span className="text-xs font-medium text-muted-foreground">
                Employer
              </span>
              <span className="text-sm font-medium leading-9 truncate max-w-32">
                {employerName}
              </span>
            </div>

            {/* Day columns with checkboxes */}
            {dayColumns.map((column) => (
              <div
                key={column.dateKey}
                className="flex flex-col items-center gap-1"
              >
                {/* Day selection checkbox */}
                <div className="flex items-center justify-center h-5">
                  <Checkbox
                    checked={selectedDays[column.dateKey] ?? false}
                    onCheckedChange={(checked) =>
                      onDaySelectedChange(column.dateKey, checked === true)
                    }
                    disabled={disabled}
                    aria-label={`Select ${column.dayName} for auto-distribute`}
                  />
                </div>

                {/* Day hours cell */}
                <DayHoursCell
                  dateKey={column.dateKey}
                  dayName={column.dayName}
                  dayNumber={column.dayNumber}
                  monthName={column.monthName}
                  value={dailyHours[column.dateKey] || ''}
                  onChange={(value) => onDayChange(column.dateKey, value)}
                  error={errors[column.dateKey]}
                  disabled={disabled}
                />
              </div>
            ))}

            {/* Total column */}
            <div className="flex min-w-16 flex-col items-center gap-1 pb-1">
              <span className="text-xs font-medium text-muted-foreground">
                Total
              </span>
              <span
                className={cn(
                  'flex h-9 items-center justify-center text-sm font-semibold',
                  computedTotal > 0 ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {formatDecimalHours(computedTotal)}h
              </span>
            </div>

            {/* Reset button - only visible when form is dirty */}
            {isDirty && (
              <div className="flex min-w-16 flex-col items-center gap-1 pb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Reset
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onReset}
                      disabled={disabled}
                      aria-label="Reset to initial values"
                      className="h-9 w-9"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset to initial values</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
});
