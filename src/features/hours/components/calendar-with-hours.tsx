import { buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import * as React from "react";
import type { DayProps } from "react-day-picker";
import { startOfWeek, isSameDay } from "date-fns";

interface CalendarWithHoursProps {
  hoursByDate: { [date: string]: number };
  mode?: "single" | "multiple" | "range";
  selected?: Date | Date[];
  onSelect?: (date: Date | Date[] | undefined) => void;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
  className?: string;
  disableWeekHighlight?: boolean;
}

/**
 * Helper function to check if two dates are in the same week
 * Week starts on Monday (ISO standard)
 */
function isSameWeek(date1: Date, date2: Date): boolean {
  const week1Start = startOfWeek(date1, { weekStartsOn: 1 });
  const week2Start = startOfWeek(date2, { weekStartsOn: 1 });
  return isSameDay(week1Start, week2Start);
}

/**
 * Custom DayButton component that displays hours worked below the date
 * Following shadcn/ui and react-day-picker best practices
 */
function CustomDayButton({
  day,
  modifiers,
  hoursByDate,
  hoveredWeekDate,
  setHoveredWeekDate,
  selectedWeekDate,
  disableWeekHighlight,
  ...props
}: DayProps & {
  hoursByDate: { [date: string]: number };
  hoveredWeekDate: Date | null;
  setHoveredWeekDate: (date: Date | null) => void;
  selectedWeekDate: Date | null;
  disableWeekHighlight: boolean;
}) {
  const dateKey = day.date.toISOString().split("T")[0];
  const hoursForDate = hoursByDate[dateKey] || 0;

  const ref = React.useRef<HTMLButtonElement>(null);

  // Check if current day is in the hovered week (only if week highlight is enabled)
  const isInHoveredWeek = !disableWeekHighlight && hoveredWeekDate ? isSameWeek(day.date, hoveredWeekDate) : false;

  // Check if current day is in the selected week (only if week highlight is enabled)
  const isInSelectedWeek = !disableWeekHighlight && selectedWeekDate ? isSameWeek(day.date, selectedWeekDate) : false;

  // Auto-focus when focused modifier is active (shadcn pattern)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  // Extract handlers from props to combine them
  const { onMouseEnter: propsOnMouseEnter, onMouseLeave: propsOnMouseLeave, ...restProps } = props;

  // Handle mouse events - combine with original handlers (only if week highlight is enabled)
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!disableWeekHighlight) {
      setHoveredWeekDate(day.date);
    }
    if (propsOnMouseEnter) {
      propsOnMouseEnter(e);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (!disableWeekHighlight) {
      setHoveredWeekDate(null);
    }
    if (propsOnMouseLeave) {
      propsOnMouseLeave(e);
    }
  };

  return (
    <button
      ref={ref}
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      {...restProps}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        // Base button styles using shadcn buttonVariants
        buttonVariants({ variant: "ghost", size: "icon" }),
        // Calendar day specific styles (from shadcn calendar.tsx)
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
        "data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground",
        "data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
        "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
        "flex aspect-square size-auto w-full min-w-8 flex-col gap-0.5 leading-none font-normal",
        "hover:bg-accent hover:text-accent-foreground",
        "data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md",
        "data-[range-middle=true]:rounded-none",
        "data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md",

        // Disabled state overrides cursor
        modifiers.disabled && "!cursor-not-allowed opacity-50",
        // Outside month
        modifiers.outside && "text-muted-foreground",

        // Week highlighting - Selected week (same color as selected date)
        // Only apply if there's actually a selected date (not just today)
        isInSelectedWeek && !modifiers.selected && selectedWeekDate && "bg-primary text-primary-foreground",
        // Week highlighting - Hovered week (same color as hovered date)
        isInHoveredWeek && !isInSelectedWeek && !modifiers.selected && "bg-accent text-accent-foreground"
      )}
    >
      {/* Date number */}
      <span className="text-sm">{day.date.getDate()}</span>

      {/* Hours display */}
      {hoursForDate > 0 && (
        <span className="text-[9px] font-bold text-blue-600 leading-none">
          {hoursForDate >= 10
            ? Math.floor(hoursForDate)
            : hoursForDate.toFixed(1).replace(".0", "")}
          h
        </span>
      )}
    </button>
  );
}

/**
 * Calendar component enhanced with hour display below each date
 * Built following shadcn/ui and react-day-picker best practices
 *
 * @param hoursByDate - Pre-loaded hours data by date (format: { "2025-09-01": 8.5, ... })
 * @param props - Standard Calendar props (mode, selected, onSelect, etc.)
 */
export function CalendarWithHours({
  hoursByDate,
  selected,
  disableWeekHighlight = false,
  ...props
}: CalendarWithHoursProps) {
  // State to track which week is being hovered (only if week highlight is enabled)
  const [hoveredWeekDate, setHoveredWeekDate] = React.useState<Date | null>(null);

  // Extract selected date (works with single, multiple, and range modes)
  const selectedWeekDate = React.useMemo(() => {
    if (!selected) return null;
    if (selected instanceof Date) return selected;
    if (Array.isArray(selected) && selected.length > 0) return selected[0];
    return null;
  }, [selected]);


  // Create the custom DayButton with hours display and week highlighting
  const DayButtonWithHours = React.useCallback(
    (dayProps: DayProps) => (
      <CustomDayButton
        {...dayProps}
        hoursByDate={hoursByDate}
        hoveredWeekDate={hoveredWeekDate}
        setHoveredWeekDate={setHoveredWeekDate}
        selectedWeekDate={selectedWeekDate}
        disableWeekHighlight={disableWeekHighlight}
      />
    ),
    [hoursByDate, hoveredWeekDate, selectedWeekDate, disableWeekHighlight]
  );

  return (
    <Calendar
      {...props}
      selected={selected}
      weekStartsOn={1}
      classNames={{
        today: "", // Remove default "today" styling
      }}
      components={{
        DayButton: DayButtonWithHours,
      }}
    />
  );
}
