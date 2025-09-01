import { buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import * as React from "react";
import type { DayProps } from "react-day-picker";

interface HoursBadgeProps {
  hours: number;
  className?: string;
}

interface CalendarWithHoursProps {
  hoursByDate: { [date: string]: number };
  mode?: "single" | "multiple" | "range";
  selected?: Date | Date[];
  onSelect?: (date: Date | Date[] | undefined) => void;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
  className?: string;
  [key: string]: any;
}

/**
 * Custom DayButton component that displays hours worked below the date
 * Following shadcn/ui and react-day-picker best practices
 */
function CustomDayButton({
  day,
  modifiers,
  hoursByDate,
  ...props
}: DayProps & {
  hoursByDate: { [date: string]: number };
}) {
  const dateKey = day.date.toISOString().split("T")[0];
  const hoursForDate = hoursByDate[dateKey] || 0;

  const ref = React.useRef<HTMLButtonElement>(null);

  // Auto-focus when focused modifier is active (shadcn pattern)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

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
        // Today state
        modifiers.today && "bg-accent text-accent-foreground rounded-md",
        // Outside month
        modifiers.outside && "text-muted-foreground"
      )}
      {...props}
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
  ...props
}: CalendarWithHoursProps) {
  // Create the custom DayButton with hours display
  const DayButtonWithHours = React.useCallback(
    (dayProps: DayProps) => (
      <CustomDayButton {...dayProps} hoursByDate={hoursByDate} />
    ),
    [hoursByDate]
  );

  return (
    <Calendar
      {...props}
      components={{
        DayButton: DayButtonWithHours,
      }}
    />
  );
}
