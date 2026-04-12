import { CalendarIcon, ExternalLink, Info } from 'lucide-react';
import * as React from 'react';

import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import type {
  BlockedRange,
  OrderingConstraint,
} from '../hooks/use-blocked-ranges';
import { OVERLAP_ZONE_COLOR } from '../hooks/use-blocked-ranges';

import {
  formatDisplayDate,
  VEVO_URL,
  VISA_INDICATOR_COLORS,
} from './visa-date-picker-helpers';
import { VisaDatePickerLegend } from './visa-date-picker-legend';
import {
  VisaDayButton,
  VisaDayContext,
  type VisaDayContextValue,
} from './visa-day-button';

export interface VisaDatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  blockedRanges?: BlockedRange[];
  /** Earliest allowed date (from ordering rules) */
  minDate?: Date;
  /** Latest allowed date (from successor ordering rules) */
  maxDate?: Date;
  /** Ordering constraint info for legend (predecessor) */
  orderingConstraint?: OrderingConstraint;
  /** Successor ordering constraint info for legend */
  successorConstraint?: OrderingConstraint;
  /** Disable the entire picker (e.g. no visa type selected yet) */
  disabled?: boolean;
}

export function VisaDatePicker({
  value,
  onChange,
  blockedRanges = [],
  minDate,
  maxDate,
  orderingConstraint,
  successorConstraint,
  disabled = false,
}: VisaDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const visaPeriodRanges = React.useMemo(
    () => blockedRanges.filter((r) => r.reason === 'visa_period'),
    [blockedRanges],
  );
  const overlapZoneRanges = React.useMemo(
    () => blockedRanges.filter((r) => r.reason === 'overlap_zone'),
    [blockedRanges],
  );

  // Map: date.toDateString() → hex color (for indicator bars)
  const dayColorMap = React.useMemo(() => {
    const map = new Map<string, string>();
    blockedRanges.forEach((range) => {
      const color =
        range.reason === 'overlap_zone'
          ? OVERLAP_ZONE_COLOR
          : VISA_INDICATOR_COLORS[range.visaType];
      const current = new Date(range.start);
      const end = new Date(range.end);
      current.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      while (current <= end) {
        map.set(current.toDateString(), color);
        current.setDate(current.getDate() + 1);
      }
    });
    return map;
  }, [blockedRanges]);

  const dayContextValue = React.useMemo<VisaDayContextValue>(
    () => ({ dayColorMap, minDate, maxDate }),
    [dayColorMap, minDate, maxDate],
  );

  const disabledMatchers = React.useMemo(() => {
    const matchers: Array<
      { from: Date; to: Date } | { before: Date } | { after: Date }
    > = blockedRanges.map((r) => ({
      from: new Date(r.start),
      to: new Date(r.end),
    }));
    if (minDate) matchers.push({ before: minDate });
    if (maxDate) matchers.push({ after: maxDate });
    return matchers;
  }, [blockedRanges, minDate, maxDate]);

  const hasLegend =
    visaPeriodRanges.length > 0 ||
    overlapZoneRanges.length > 0 ||
    !!orderingConstraint ||
    !!successorConstraint;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-semibold uppercase text-[11px] tracking-[0.8px] text-muted-foreground">
        Arrival Date in Australia
      </span>

      <Popover open={disabled ? false : open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex items-center gap-2 w-full rounded-md border border-border bg-background text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring px-3 py-2.5',
              disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-accent',
            )}
          >
            <CalendarIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
            <span
              className={value ? 'text-foreground' : 'text-muted-foreground'}
            >
              {value
                ? formatDisplayDate(value)
                : disabled
                  ? 'Select a visa type first'
                  : 'Pick a date'}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0 overflow-hidden rounded-lg shadow-lg"
          align="start"
        >
          <div className={cn('flex', hasLegend && 'flex-row')}>
            <VisaDayContext.Provider value={dayContextValue}>
              <Calendar
                mode="single"
                selected={value}
                onSelect={(date) => {
                  onChange(date);
                  if (date) setOpen(false);
                }}
                disabled={disabledMatchers}
                captionLayout="dropdown"
                weekStartsOn={1}
                showOutsideDays={false}
                startMonth={new Date(2010, 0)}
                endMonth={new Date(2040, 11)}
                className="bg-popover"
                components={{ DayButton: VisaDayButton }}
              />
            </VisaDayContext.Provider>

            {hasLegend && (
              <>
                <div className="w-px bg-border" />
                <VisaDatePickerLegend
                  visaPeriodRanges={visaPeriodRanges}
                  overlapZoneRanges={overlapZoneRanges}
                  orderingConstraint={orderingConstraint}
                  successorConstraint={successorConstraint}
                />
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex flex-col gap-1.5">
        <p className="text-[12px] leading-[1.43] text-muted-foreground">
          The date your visa period starts — either when you arrived in
          Australia, or when your new visa was granted if you were already in
          the country.
        </p>

        <div className="flex items-start gap-1.5">
          <Info className="w-3 h-3 shrink-0 mt-0.5 text-muted-foreground" />
          <span className="text-[11px] leading-[1.4] text-muted-foreground">
            Not sure? Check your exact arrival date on VEVO.
          </span>
        </div>

        <a
          href={VEVO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:underline w-fit"
        >
          <ExternalLink className="w-2.5 h-2.5 shrink-0 text-primary" />
          <span className="text-[11px] font-medium text-primary">
            Open VEVO — Visa holder enquiry
          </span>
        </a>
      </div>
    </div>
  );
}
