'use client';

import { useCallback, useMemo, useState } from 'react';

import { useMonthHours } from '@/features/hours/api/use-hours';
import { getCalendarDays } from '@/features/hours/utils/calendar-helpers';
import { cn } from '@/lib/utils';

import { CalendarGrid } from './calendar-grid';
import { CalendarHeader } from './calendar-header';
import { CalendarSkeleton } from './calendar-skeleton';

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
  const calendarDays = useMemo(
    () => getCalendarDays(year, month),
    [year, month],
  );

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
        <CalendarGrid days={calendarDays} hoursData={hoursData ?? {}} />
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

