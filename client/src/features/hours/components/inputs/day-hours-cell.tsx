/**
 * Day Hours Cell Component
 *
 * A compact input cell for entering hours for a specific day.
 * Displays the day name and date above the input, with validation support.
 *
 * @example
 * ```tsx
 * <DayHoursCell
 *   dateKey="2025-01-06"
 *   dayName="Mon"
 *   dayNumber="6"
 *   monthName="Jan"
 *   value="8"
 *   onChange={(value) => setDayHours('2025-01-06', value)}
 *   error="Max 24h"
 * />
 * ```
 */

import { forwardRef, memo } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DayHoursCellProps {
  /** Date key in YYYY-MM-DD format */
  dateKey: string;
  /** Short day name (e.g., 'Mon', 'Tue') */
  dayName: string;
  /** Day of month (e.g., '6', '15') */
  dayNumber: string;
  /** Short month name (e.g., 'Jan', 'Apr') */
  monthName: string;
  /** Current hours value (string to preserve user input format) */
  value: string;
  /** Callback when hours value changes */
  onChange: (value: string) => void;
  /** Validation error message */
  error?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

const DayHoursCellInner = forwardRef<HTMLInputElement, DayHoursCellProps>(
  (
    {
      dateKey,
      dayName,
      dayNumber,
      monthName,
      value,
      onChange,
      error,
      disabled = false,
      className,
    },
    ref,
  ) => {
    const hasError = Boolean(error);

    return (
      <div className={cn('flex flex-col items-center gap-1', className)}>
        {/* Day header */}
        <div className="flex flex-col items-center text-xs">
          <span className="font-medium text-muted-foreground">{dayName}</span>
          <span className="text-muted-foreground">
            {dayNumber} {monthName}
          </span>
        </div>

        {/* Hours input */}
        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="0"
          aria-label={`Hours for ${dayName} ${dayNumber} ${monthName}`}
          aria-invalid={hasError}
          className={cn(
            'h-9 w-16 text-center text-sm',
            hasError && 'border-destructive focus-visible:ring-destructive',
          )}
          data-date-key={dateKey}
        />

        {/* Error message */}
        {hasError && (
          <span className="text-[10px] text-destructive max-w-16 text-center leading-tight">
            {error}
          </span>
        )}
      </div>
    );
  },
);

DayHoursCellInner.displayName = 'DayHoursCell';

/**
 * Memoized DayHoursCell to prevent unnecessary re-renders.
 * Only re-renders when value, error, or disabled props change.
 */
export const DayHoursCell = memo(DayHoursCellInner);
