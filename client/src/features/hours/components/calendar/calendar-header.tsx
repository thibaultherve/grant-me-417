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
  /** Optional className */
  className?: string;
};

// Generate year options from 1926 to current year + 1
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
  { length: currentYear - 1926 + 2 },
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
  className,
}: CalendarHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      {/* Month/Year selectors */}
      <div className="flex items-center gap-2">
        {/* Month dropdown */}
        <Select
          value={String(month)}
          onValueChange={(value) => onMonthChange(Number(value))}
        >
          <SelectTrigger className="w-[130px]" aria-label="Select month">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTH_NAMES.map((monthName, index) => (
              <SelectItem key={monthName} value={String(index + 1)}>
                {monthName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year dropdown */}
        <Select
          value={String(year)}
          onValueChange={(value) => onYearChange(Number(value))}
        >
          <SelectTrigger className="w-[100px]" aria-label="Select year">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {YEAR_OPTIONS.map((yearOption) => (
              <SelectItem key={yearOption} value={String(yearOption)}>
                {yearOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={onPreviousMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
