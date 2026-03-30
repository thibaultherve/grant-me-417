import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { MONTH_NAMES } from '@/features/hours/utils/calendar-helpers';

import type { Visa, VisaType } from '@regranted/shared';
import { getVisaBarColor } from '../../utils/weekly-helpers';

export type CalendarHeaderProps = {
  /** Current year displayed */
  year: number;
  /** Current month displayed (1-12) */
  month: number;
  /** Callback when year changes */
  onYearChange: (year: number) => void;
  /** Callback when month changes */
  onMonthChange: (month: number) => void;
  /** Callback to go to previous month */
  onPreviousMonth: () => void;
  /** Callback to go to next month */
  onNextMonth: () => void;
  /** User visas for year dots */
  visas?: Visa[];
  /** Optional className */
  className?: string;
};

// Generate year options: current year + 1 down to 2008 (WHV 417 era)
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
  { length: currentYear - 2008 + 2 },
  (_, i) => currentYear + 1 - i
);

/**
 * Navigation header for the monthly calendar.
 * Contains month/year dropdowns and prev/next arrows.
 */
export function CalendarHeader({
  year,
  month,
  onYearChange,
  onMonthChange,
  onPreviousMonth,
  onNextMonth,
  visas = [],
  className,
}: CalendarHeaderProps) {
  // Map year → visa types active that year
  const visasByYear = useMemo(() => {
    const map = new Map<number, VisaType[]>();
    for (const visa of visas) {
      const startYear = new Date(visa.arrivalDate).getFullYear();
      const endYear = new Date(visa.expiryDate).getFullYear();
      for (let y = startYear; y <= endYear; y++) {
        const existing = map.get(y);
        if (existing) {
          if (!existing.includes(visa.visaType)) existing.push(visa.visaType);
        } else {
          map.set(y, [visa.visaType]);
        }
      }
    }
    return map;
  }, [visas]);

  // Map month (1-12) → visa types active that month for the selected year
  const visasByMonth = useMemo(() => {
    const map = new Map<number, VisaType[]>();
    for (const visa of visas) {
      for (let m = 1; m <= 12; m++) {
        // Month start/end as YYYY-MM-DD strings for easy comparison
        const monthStart = `${year}-${String(m).padStart(2, '0')}-01`;
        const lastDay = new Date(year, m, 0).getDate();
        const monthEnd = `${year}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        if (visa.arrivalDate <= monthEnd && visa.expiryDate >= monthStart) {
          const existing = map.get(m);
          if (existing) {
            if (!existing.includes(visa.visaType)) existing.push(visa.visaType);
          } else {
            map.set(m, [visa.visaType]);
          }
        }
      }
    }
    return map;
  }, [visas, year]);

  const now = new Date();
  const currentYearNow = now.getFullYear();
  const currentMonthNow = now.getMonth() + 1;
  const isCurrentMonth = year === currentYearNow && month === currentMonthNow;
  const isFutureBlocked = year > currentYearNow || (year === currentYearNow && month >= currentMonthNow);

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        className
      )}
    >
      {/* Month dropdown */}
      <Select
        value={String(month)}
        onValueChange={(value) => onMonthChange(Number(value))}
      >
        <SelectTrigger className="flex-1 min-w-0 sm:flex-none sm:w-40 bg-card dark:bg-card shadow-sm rounded-lg" aria-label="Select month">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTH_NAMES.map((monthName, index) => {
            const m = index + 1;
            const monthVisas = visasByMonth.get(m);
            const isFuture = year > currentYearNow || (year === currentYearNow && m > currentMonthNow);
            if (isFuture) return null;
            return (
              <SelectItem key={monthName} value={String(m)}>
                <span className="flex items-center gap-2">
                  {monthName}
                  {monthVisas && (
                    <span className="flex items-center gap-0.5">
                      {monthVisas.map((vt) => (
                        <span
                          key={vt}
                          className={cn('h-1.25 w-1.25 rounded-full', getVisaBarColor(vt))}
                        />
                      ))}
                    </span>
                  )}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Year dropdown */}
      <Select
        value={String(year)}
        onValueChange={(value) => onYearChange(Number(value))}
      >
        <SelectTrigger className="flex-1 min-w-0 sm:flex-none sm:w-32.5 bg-card dark:bg-card shadow-sm rounded-lg" aria-label="Select year">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {YEAR_OPTIONS.map((yearOption) => {
            if (yearOption > currentYearNow) return null;
            const yearVisas = visasByYear.get(yearOption);
            return (
              <SelectItem key={yearOption} value={String(yearOption)}>
                <span className="flex items-center gap-2">
                  {yearOption}
                  {yearVisas && (
                    <span className="flex items-center gap-0.5">
                      {yearVisas.map((vt) => (
                        <span
                          key={vt}
                          className={cn('h-1.25 w-1.25 rounded-full', getVisaBarColor(vt))}
                        />
                      ))}
                    </span>
                  )}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Navigation arrows */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="outline"
          size="icon"
          className="bg-card dark:bg-card shadow-sm rounded-lg"
          onClick={onPreviousMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-card dark:bg-card shadow-sm rounded-lg"
          onClick={onNextMonth}
          disabled={isFutureBlocked}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
