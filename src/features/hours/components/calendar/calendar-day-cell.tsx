import * as React from 'react';

import { cn } from '@/lib/utils';
import type { DayHoursEntry } from '@/features/hours/types';

export type CalendarDayCellProps = {
  /** Day number to display (1-31) */
  dayNumber: number;
  /** Whether this day belongs to the currently displayed month */
  isCurrentMonth: boolean;
  /** Hours data for this day, grouped by employer */
  hoursData?: DayHoursEntry[];
  /** Whether this is today's date */
  isToday?: boolean;
  /** Whether this is a weekend day (Saturday or Sunday) */
  isWeekend?: boolean;
};

/**
 * Displays a single day cell in the monthly calendar.
 * Shows day number, list of employers with hours, and daily total.
 */
function CalendarDayCellComponent({
  dayNumber,
  isCurrentMonth,
  hoursData = [],
  isToday = false,
  isWeekend = false,
}: CalendarDayCellProps) {
  const totalHours = Math.round(hoursData.reduce((sum, entry) => sum + entry.hours, 0) * 100) / 100;
  const hasHours = totalHours > 0;

  return (
    <div
      className={cn(
        'min-h-[100px] border-b border-r p-2 text-sm transition-colors',
        // Current month vs padding days
        isCurrentMonth
          ? 'bg-card'
          : 'bg-muted text-muted-foreground',
        // Weekend styling
        isWeekend && isCurrentMonth && 'bg-muted',
        // Hover effect for days with hours
        hasHours && isCurrentMonth && 'hover:bg-accent',
      )}
    >
      {/* Day number */}
      <div
        className={cn(
          'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
          isToday && 'bg-primary text-primary-foreground',
          !isToday && !isCurrentMonth && 'text-muted-foreground',
        )}
      >
        {dayNumber}
      </div>

      {/* Employer hours list */}
      {isCurrentMonth && hasHours && (
        <div className="space-y-0.5">
          {hoursData.map((entry, index) => (
            <div
              key={`${entry.employerName}-${index}`}
              className="truncate text-xs text-muted-foreground"
              title={`${entry.employerName}: ${entry.hours}h`}
            >
              <span className="font-medium text-foreground">
                {entry.employerName}:
              </span>{' '}
              {entry.hours}h
            </div>
          ))}

          {/* Daily total */}
          <div className="mt-1 border-t pt-1 text-xs font-semibold text-primary">
            Total: {totalHours}h
          </div>
        </div>
      )}
    </div>
  );
}

export const CalendarDayCell = React.memo(CalendarDayCellComponent);
CalendarDayCell.displayName = 'CalendarDayCell';
