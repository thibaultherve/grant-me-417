import { getDay, isToday as isTodayFn } from 'date-fns';
import * as React from 'react';

import type { MonthHoursData } from '@/features/hours/types';
import type { CalendarDay } from '@/features/hours/utils/calendar-helpers';
import { WEEKDAY_HEADERS } from '@/features/hours/utils/calendar-helpers';
import { cn } from '@/lib/utils';

import { CalendarDayCell } from './calendar-day-cell';

export type CalendarGridProps = {
  /** Array of 42 calendar days (6 weeks) */
  days: CalendarDay[];
  /** Hours data indexed by date key (YYYY-MM-DD) */
  hoursData: MonthHoursData;
  /** Optional className for the grid container */
  className?: string;
};

/**
 * Renders the calendar grid with weekday headers and day cells.
 * Uses CSS Grid with 7 columns for the days of the week.
 */
function CalendarGridComponent({
  days,
  hoursData,
  className,
}: CalendarGridProps) {
  return (
    <div
      className={cn('overflow-hidden rounded-lg border', className)}
      role="grid"
      aria-label="Monthly calendar"
    >
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b bg-muted/50" role="row">
        {WEEKDAY_HEADERS.map((day, index) => {
          const isWeekend = index >= 5; // Saturday (5) and Sunday (6)
          return (
            <div
              key={day}
              role="columnheader"
              className={cn(
                'border-r px-2 py-2 text-center text-xs font-medium text-muted-foreground last:border-r-0',
                isWeekend && 'text-muted-foreground/70',
              )}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Calendar days grid */}
      <div className="grid grid-cols-7" role="rowgroup">
        {days.map((day) => {
          const dayOfWeek = getDay(day.date);
          // Sunday = 0, Saturday = 6, but we use Monday-first (0=Mon, 6=Sun)
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const isToday = isTodayFn(day.date);
          const dayHours = hoursData[day.dateKey] || [];

          return (
            <CalendarDayCell
              key={day.dateKey}
              dayNumber={day.date.getDate()}
              isCurrentMonth={day.isCurrentMonth}
              hoursData={dayHours}
              isToday={isToday}
              isWeekend={isWeekend}
            />
          );
        })}
      </div>
    </div>
  );
}

export const CalendarGrid = React.memo(CalendarGridComponent);
CalendarGrid.displayName = 'CalendarGrid';
