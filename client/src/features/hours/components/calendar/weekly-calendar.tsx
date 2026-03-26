import { useCallback, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import { VisaLegend } from '@/components/visa-legend';

import { useVisas } from '@/features/visas/api/use-visas';

import { useWeeklyHours } from '../../api/use-hours';
import { useWeekExpansion } from '../../hooks/use-week-expansion';

import { CalendarHeader } from './calendar-header';
import { WeeklyTable } from './weekly-table';
import { WeeklyCards } from './weekly-cards';
import { WeeklySkeleton, WeeklySkeletonMobile } from './weekly-skeleton';

export interface WeeklyCalendarProps {
  initialYear?: number;
  initialMonth?: number;
  className?: string;
}

/**
 * Main weekly calendar container. Replaces MonthCalendar.
 * Manages date navigation, fetches weekly data, and renders
 * desktop table or mobile cards based on viewport.
 */
export function WeeklyCalendar({
  initialYear,
  initialMonth,
  className,
}: WeeklyCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(initialYear ?? now.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? now.getMonth() + 1);

  const { data, isLoading } = useWeeklyHours(year, month);
  const { data: visas } = useVisas();
  const { isExpanded, toggleWeek } = useWeekExpansion();

  const activeVisaTypes = useMemo(() => {
    if (!data || data.weeks.length === 0) return [];
    const rangeStart = data.weeks[0].weekStart;
    const rangeEnd = data.weeks[data.weeks.length - 1].weekEnd;
    return data.visas
      .filter((v) => v.arrivalDate <= rangeEnd && (!v.expiryDate || v.expiryDate >= rangeStart))
      .map((v) => v.visaType);
  }, [data]);

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
      <CalendarHeader
        year={year}
        month={month}
        onYearChange={handleYearChange}
        onMonthChange={handleMonthChange}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        visas={visas}
      />

      {isLoading ? (
        <>
          <div className="hidden md:block">
            <WeeklySkeleton />
          </div>
          <div className="md:hidden">
            <WeeklySkeletonMobile />
          </div>
        </>
      ) : data ? (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <WeeklyTable
              weeks={data.weeks}
              visas={data.visas}
              isExpanded={isExpanded}
              toggleWeek={toggleWeek}
              year={year}
              month={month}
            />
          </div>

          {/* Mobile cards */}
          <div className="md:hidden">
            <WeeklyCards
              weeks={data.weeks}
              visas={data.visas}
              isExpanded={isExpanded}
              toggleWeek={toggleWeek}
              year={year}
              month={month}
            />
          </div>
        </>
      ) : null}

      <VisaLegend visaTypes={activeVisaTypes} />
    </div>
  );
}
