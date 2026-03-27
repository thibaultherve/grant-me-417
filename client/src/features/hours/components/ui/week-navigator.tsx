/**
 * Week Navigator Component
 *
 * Displays week navigation with prev/next arrows and the current week range.
 * Includes a calendar popover for quick week selection.
 * Used in the unified week-based hours entry form.
 *
 * @example
 * ```tsx
 * <WeekNavigator
 *   weekRange="Mon 15 Apr — Sun 21 Apr 2024"
 *   currentWeek={new Date('2024-04-15')}
 *   onPrevWeek={() => goPrevWeek()}
 *   onNextWeek={() => goNextWeek()}
 *   onSelectWeek={(date) => setWeek(date)}
 *   canGoPrev={true}
 *   canGoNext={false}
 * />
 * ```
 */

import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { memo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { CalendarDropdown } from '@/components/ui/calendar-dropdown';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface WeekNavigatorProps {
  /** Formatted week range string (e.g., "Mon 15 Apr — Sun 21 Apr 2024") */
  weekRange: string;
  /** Compact week range without year for mobile (e.g., "Mon 15 — Sun 21 Apr") */
  compactWeekRange?: string;
  /** Current week date (Monday of the week) */
  currentWeek: Date;
  /** Callback when previous week button is clicked */
  onPrevWeek: () => void;
  /** Callback when next week button is clicked */
  onNextWeek: () => void;
  /** Callback when a week is selected from the calendar */
  onSelectWeek: (date: Date) => void;
  /** Whether navigation to previous week is allowed */
  canGoPrev?: boolean;
  /** Whether navigation to next week is allowed */
  canGoNext?: boolean;
  /** Dates to highlight in the calendar (dates with work hours) */
  highlightedDates?: Date[];
  /** Additional CSS classes */
  className?: string;
}

export const WeekNavigator = memo(function WeekNavigator({
  weekRange,
  compactWeekRange,
  currentWeek,
  onPrevWeek,
  onNextWeek,
  onSelectWeek,
  canGoPrev = true,
  canGoNext = true,
  highlightedDates,
  className,
}: WeekNavigatorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Determine which dates should be disabled in the calendar
  // Disable future dates and weeks that haven't started yet (Monday hasn't arrived)
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    const dayOfWeek = date.getDay();

    // If it's a future date, disable it
    if (date > today) return true;

    // Get the Monday of this date's week
    const monday = new Date(date);
    monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    // Disable if Monday hasn't arrived yet
    return monday > today;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    // Convert selected date to Monday of that week
    const dayOfWeek = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    onSelectWeek(monday);
    setIsCalendarOpen(false);
  };

  return (
    <div
      className={cn(
        'flex items-center rounded-lg border bg-card p-3',
        className,
      )}
    >
      {/* Previous week button — plain chevron, no outline */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrevWeek}
        disabled={!canGoPrev}
        aria-label="Go to previous week"
        className="h-auto gap-1 px-2 py-1 text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline text-sm">Prev</span>
      </Button>

      {/* Week range display with calendar popover */}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="mx-auto h-auto gap-2 px-2 py-1 font-medium hover:bg-accent text-sm"
            aria-label="Open calendar to select week"
          >
            <CalendarIcon className="h-4 w-4 shrink-0" />
            {compactWeekRange ? (
              <>
                <span className="sm:hidden">{compactWeekRange}</span>
                <span className="hidden sm:inline">{weekRange}</span>
              </>
            ) : (
              weekRange
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <CalendarDropdown
            mode="single"
            selected={currentWeek}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            highlightedDates={highlightedDates}
          />
        </PopoverContent>
      </Popover>

      {/* Next week button — plain chevron, no outline */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onNextWeek}
        disabled={!canGoNext}
        aria-label="Go to next week"
        className="h-auto gap-1 px-2 py-1 text-muted-foreground hover:text-foreground"
      >
        <span className="hidden sm:inline text-sm">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
});
