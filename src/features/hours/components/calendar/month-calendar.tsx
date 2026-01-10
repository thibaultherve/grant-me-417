'use client';

import { Calendar } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import { useMonthHours } from '@/features/hours/api/use-hours';
import { getCalendarDays } from '@/features/hours/utils/calendar-helpers';

import { CalendarGrid } from './calendar-grid';
import { CalendarHeader } from './calendar-header';

export type MonthCalendarProps = {
  /** Optional initial year (defaults to current year) */
  initialYear?: number;
  /** Optional initial month (defaults to current month, 1-12) */
  initialMonth?: number;
  /** Optional className for the container */
  className?: string;
};

/**
 * Monthly calendar component displaying work hours by day.
 * Shows a grid view with employer hours per day and daily totals.
 */
export function MonthCalendar({
  initialYear,
  initialMonth,
  className,
}: MonthCalendarProps) {
  // Initialize with current date
  const now = new Date();
  const [year, setYear] = useState(initialYear ?? now.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? now.getMonth() + 1);

  // Fetch hours data for the current month
  const { data: hoursData, isLoading } = useMonthHours(year, month);

  // Generate calendar grid days
  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  // Navigation handlers
  const handlePreviousMonth = useCallback(() => {
    if (month === 1) {
      setYear((prev) => prev - 1);
      setMonth(12);
    } else {
      setMonth((prev) => prev - 1);
    }
  }, [month]);

  const handleNextMonth = useCallback(() => {
    if (month === 12) {
      setYear((prev) => prev + 1);
      setMonth(1);
    } else {
      setMonth((prev) => prev + 1);
    }
  }, [month]);

  const handleYearChange = useCallback((newYear: number) => {
    setYear(newYear);
  }, []);

  const handleMonthChange = useCallback((newMonth: number) => {
    setMonth(newMonth);
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Title */}
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Monthly Calendar</h2>
      </div>

      {/* Header with navigation */}
      <CalendarHeader
        year={year}
        month={month}
        onYearChange={handleYearChange}
        onMonthChange={handleMonthChange}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />

      {/* Calendar grid with loading state */}
      {isLoading ? (
        <CalendarSkeleton />
      ) : (
        <CalendarGrid
          days={calendarDays}
          hoursData={hoursData ?? {}}
        />
      )}

      {/* Empty state message */}
      {!isLoading && hoursData && Object.keys(hoursData).length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No hours recorded this month
        </p>
      )}
    </div>
  );
}

/**
 * Skeleton loader for the calendar grid.
 * Shows an animated placeholder while data is loading.
 */
function CalendarSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      {/* Header row skeleton */}
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="border-r px-2 py-2 last:border-r-0"
          >
            <div className="mx-auto h-4 w-8 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Grid skeleton (6 rows x 7 columns = 42 cells) */}
      <div className="grid grid-cols-7">
        {Array.from({ length: 42 }).map((_, i) => (
          <div
            key={i}
            className="min-h-[100px] border-b border-r p-2"
          >
            <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
            <div className="mt-2 space-y-1">
              <div className="h-3 w-16 animate-pulse rounded bg-muted/60" />
              <div className="h-3 w-12 animate-pulse rounded bg-muted/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
