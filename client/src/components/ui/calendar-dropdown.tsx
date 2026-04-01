'use client';

import * as React from 'react';
import type {
  PropsBase,
  PropsMulti,
  PropsRange,
  PropsSingle,
} from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export type CalendarDropdownLayout =
  | 'dropdown'
  | 'dropdown-months'
  | 'dropdown-years';

type BaseDropdownProps = {
  captionLayout?: CalendarDropdownLayout;
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
  className?: string;
  defaultMonth?: Date;
  /** Dates to highlight (displayed in blue and bold) */
  highlightedDates?: Date[];
};

export type CalendarDropdownSingleProps = PropsSingle & BaseDropdownProps;
export type CalendarDropdownMultipleProps = PropsMulti & BaseDropdownProps;
export type CalendarDropdownRangeProps = PropsRange & BaseDropdownProps;
export type CalendarDropdownBaseProps = PropsBase & BaseDropdownProps;

export type CalendarDropdownProps =
  | CalendarDropdownSingleProps
  | CalendarDropdownMultipleProps
  | CalendarDropdownRangeProps
  | CalendarDropdownBaseProps;

function getDefaultMonthFromSelected(
  selected: Date | Date[] | { from?: Date; to?: Date } | undefined,
): Date | undefined {
  if (!selected) return undefined;
  if (selected instanceof Date) return selected;
  if (Array.isArray(selected)) return selected[0];
  if ('from' in selected && selected.from) return selected.from;
  return undefined;
}

/**
 * CalendarDropdown - Calendar component with dropdown month/year selection
 *
 * A reusable calendar component that wraps the base Calendar with dropdown
 * navigation for month and year selection. Supports all DayPicker props.
 *
 * @example
 * ```tsx
 * // Single date selection
 * <CalendarDropdown
 *   mode="single"
 *   selected={date}
 *   onSelect={setDate}
 *   disabled={(date) => date > new Date()}
 * />
 *
 * // Range selection with custom layout
 * <CalendarDropdown
 *   mode="range"
 *   selected={range}
 *   onSelect={setRange}
 *   captionLayout="dropdown-months"
 * />
 * ```
 */
function CalendarDropdown({
  className,
  captionLayout = 'dropdown',
  buttonVariant = 'ghost',
  defaultMonth,
  highlightedDates,
  ...props
}: CalendarDropdownProps) {
  const calendarProps = props as React.ComponentProps<typeof Calendar> & {
    selected?: Date | Date[] | { from?: Date; to?: Date };
  };
  const computedDefaultMonth =
    defaultMonth ?? getDefaultMonthFromSelected(calendarProps.selected);

  return (
    <Calendar
      {...calendarProps}
      defaultMonth={computedDefaultMonth}
      weekStartsOn={1}
      captionLayout={captionLayout}
      buttonVariant={buttonVariant}
      modifiers={{
        ...calendarProps.modifiers,
        hasHours: highlightedDates ?? [],
      }}
      modifiersClassNames={{
        ...calendarProps.modifiersClassNames,
        hasHours: '!text-blue-600 !font-bold hover:!text-blue-700',
      }}
      className={cn('rounded-lg border shadow-sm', className)}
    />
  );
}

export { CalendarDropdown };
