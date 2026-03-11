import { CalendarIcon, ExternalLink, Info } from 'lucide-react';
import * as React from 'react';
import { DayButton } from 'react-day-picker';

import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import type { VisaType } from '@get-granted/shared';
import type {
  BlockedRange,
  OrderingConstraint,
} from '../hooks/use-blocked-ranges';
import { OVERLAP_ZONE_COLOR } from '../hooks/use-blocked-ranges';
import { getVisaOrdinal } from '../utils/visa-helpers';

const VEVO_URL = 'https://online.immi.gov.au/evo/firstParty?actionType=query';

const VISA_INDICATOR_COLORS: Record<VisaType, string> = {
  first_whv: '#10b981',
  second_whv: '#3b82f6',
  third_whv: '#f59e0b',
};

// ─── Context ───────────────────────────────────────────────────────────────
// Passes the blocked-day color map down to the custom DayButton without
// creating components inside other components (which would cause remounting).
const DayColorContext = React.createContext<Map<string, string>>(new Map());
const MinDateContext = React.createContext<Date | undefined>(undefined);
const MaxDateContext = React.createContext<Date | undefined>(undefined);

// ─── Custom DayButton ────────────────────────────────────────────────────────
function VisaDayButton({
  children,
  day,
  modifiers,
  className,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const dayColorMap = React.useContext(DayColorContext);
  const minDate = React.useContext(MinDateContext);
  const maxDate = React.useContext(MaxDateContext);
  const mapColor = dayColorMap.get(day.date.toDateString()) ?? null;
  // Show grey bar for ordering-blocked dates (before minDate or after maxDate)
  const indicatorColor =
    mapColor ??
    (minDate && day.date < minDate ? OVERLAP_ZONE_COLOR : null) ??
    (maxDate && day.date > maxDate ? OVERLAP_ZONE_COLOR : null);

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isSelected =
    modifiers.selected &&
    !modifiers.range_start &&
    !modifiers.range_end &&
    !modifiers.range_middle;

  return (
    <button
      ref={ref}
      data-day={day.date.toLocaleDateString()}
      data-selected-single={isSelected || undefined}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5 rounded-md w-full aspect-square text-[13px] font-normal transition-colors select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:z-10 relative',
        // Default hover (only for available, non-blocked days)
        !indicatorColor &&
          !modifiers.disabled &&
          'hover:bg-accent hover:text-accent-foreground',
        // Selected state
        isSelected && !indicatorColor && 'bg-primary text-white font-semibold',
        // Today (not selected, not blocked)
        modifiers.today &&
          !isSelected &&
          !indicatorColor &&
          'bg-accent text-accent-foreground',
        // Blocked day (with indicator)
        indicatorColor && 'text-[#9ca3af] cursor-default',
        // Disabled (non-blocked) — includes ordering constraint dates
        modifiers.disabled &&
          !indicatorColor &&
          'text-muted-foreground opacity-50 cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {children}
      {indicatorColor && (
        <span
          style={{
            width: 16,
            height: 3,
            backgroundColor: indicatorColor,
            borderRadius: 2,
            display: 'block',
            flexShrink: 0,
          }}
        />
      )}
    </button>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatLegendDate(start: Date, end: Date): string {
  const s = start.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  });
  const e = end.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `${s} to ${e}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
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

  // Separate ranges by reason for legend display
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

  // Disabled matchers: blocked ranges + ordering minDate/maxDate
  const disabledMatchers = React.useMemo(() => {
    const matchers: Array<{ from: Date; to: Date } | { before: Date } | { after: Date }> =
      blockedRanges.map((r) => ({
        from: new Date(r.start),
        to: new Date(r.end),
      }));
    if (minDate) {
      matchers.push({ before: minDate });
    }
    if (maxDate) {
      matchers.push({ after: maxDate });
    }
    return matchers;
  }, [blockedRanges, minDate, maxDate]);

  const hasLegend =
    visaPeriodRanges.length > 0 ||
    overlapZoneRanges.length > 0 ||
    !!orderingConstraint ||
    !!successorConstraint;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <label
        className="font-semibold uppercase"
        style={{
          fontSize: 11,
          letterSpacing: 0.8,
          color: '#6c727e',
        }}
      >
        Arrival Date in Australia
      </label>

      {/* Popover trigger */}
      <Popover open={disabled ? false : open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex items-center gap-2 w-full rounded-md border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              disabled
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-accent',
            )}
            style={{
              backgroundColor: '#f8f8f8',
              borderColor: '#d1d4db',
              padding: '10px 12px',
              borderRadius: 6,
            }}
          >
            <CalendarIcon
              className="w-4 h-4 shrink-0"
              style={{ color: '#6c727e' }}
            />
            <span style={{ color: value ? '#1d293d' : '#6c727e' }}>
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
            {/* Calendar */}
            <MinDateContext.Provider value={minDate}>
            <MaxDateContext.Provider value={maxDate}>
            <DayColorContext.Provider value={dayColorMap}>
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
                fromYear={2010}
                toYear={2040}
                className="bg-[#fafafa]"
                components={{ DayButton: VisaDayButton }}
              />
            </DayColorContext.Provider>
            </MaxDateContext.Provider>
            </MinDateContext.Provider>

            {/* Legend (right side) */}
            {hasLegend && (
              <>
                <div className="w-px bg-[#d1d4db]" />
                <div className="flex flex-col gap-1.5 px-3 pt-3 pb-3" style={{ minWidth: 200, maxWidth: 220 }}>
                  <span
                    className="font-semibold uppercase tracking-wide"
                    style={{ fontSize: 10, letterSpacing: 0.6, color: '#6c727e' }}
                  >
                    Dates Unavailable
                  </span>

                  {/* Ordering constraint (oldest) */}
                  {orderingConstraint && (
                    <div className="flex items-center gap-2">
                      <span
                        className="shrink-0 rounded-sm"
                        style={{
                          width: 24,
                          height: 4,
                          backgroundColor: '#d1d5db',
                          display: 'block',
                        }}
                      />
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: '#1d293d' }}
                      >
                        Before{' '}
                        {getVisaOrdinal(orderingConstraint.visaType)} WHV 417 —{' '}
                        {orderingConstraint.arrivalDate.toLocaleDateString(
                          'en-AU',
                          { day: 'numeric', month: 'short', year: 'numeric' },
                        )}
                      </span>
                    </div>
                  )}

                  {/* Overlap zone entries (grey bars) */}
                  {overlapZoneRanges.map((range, i) => (
                    <div
                      key={`overlap-${i}`}
                      className="flex items-center gap-2"
                    >
                      <span
                        className="shrink-0 rounded-sm"
                        style={{
                          width: 24,
                          height: 4,
                          backgroundColor: OVERLAP_ZONE_COLOR,
                          display: 'block',
                        }}
                      />
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: '#1d293d' }}
                      >
                        Would overlap the{' '}
                        {getVisaOrdinal(range.visaType)} WHV 417 — after{' '}
                        {range.start.toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  ))}

                  {/* Visa period entries (colored bars, most recent) */}
                  {visaPeriodRanges.map((range, i) => (
                    <div key={`period-${i}`} className="flex items-center gap-2">
                      <span
                        className="shrink-0 rounded-sm"
                        style={{
                          width: 24,
                          height: 4,
                          backgroundColor: VISA_INDICATOR_COLORS[range.visaType],
                          display: 'block',
                        }}
                      />
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: '#1d293d' }}
                      >
                        {getVisaOrdinal(range.visaType)} WHV 417 —{' '}
                        {formatLegendDate(range.start, range.end)}
                      </span>
                    </div>
                  ))}

                  {/* Successor ordering constraint (newest) */}
                  {successorConstraint && (
                    <div className="flex items-center gap-2">
                      <span
                        className="shrink-0 rounded-sm"
                        style={{
                          width: 24,
                          height: 4,
                          backgroundColor: '#d1d5db',
                          display: 'block',
                        }}
                      />
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: '#1d293d' }}
                      >
                        After{' '}
                        {getVisaOrdinal(successorConstraint.visaType)} WHV 417 —{' '}
                        {successorConstraint.expiryDate.toLocaleDateString(
                          'en-AU',
                          { day: 'numeric', month: 'short', year: 'numeric' },
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-1.5 mt-1">
                    <Info
                      className="w-3 h-3 shrink-0 mt-0.5"
                      style={{ color: '#6c727e' }}
                    />
                    <span className="text-[11px]" style={{ color: '#6c727e' }}>
                      Your arrival date must be outside existing visa periods and
                      respect visa ordering (1st before 2nd, 2nd before 3rd)
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Description + VEVO hint + VEVO link */}
      <div className="flex flex-col gap-1.5">
          <p
            className="text-[12px] leading-[1.43]"
            style={{ color: '#6c727e' }}
          >
            The date your visa period starts — either when you arrived in
            Australia, or when your new visa was granted if you were already in
            the country.
          </p>

          <div className="flex items-start gap-1.5">
            <Info
              className="w-3 h-3 shrink-0 mt-0.5"
              style={{ color: '#6c727e' }}
            />
            <span
              className="text-[11px] leading-[1.4]"
              style={{ color: '#6c727e' }}
            >
              Not sure? Check your exact arrival date on VEVO.
            </span>
          </div>

          <a
            href={VEVO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline w-fit"
          >
            <ExternalLink
              className="w-2.5 h-2.5 shrink-0"
              style={{ color: '#6468f0' }}
            />
            <span
              className="text-[11px] font-medium"
              style={{ color: '#6468f0' }}
            >
              Open VEVO — Visa holder enquiry
            </span>
          </a>
        </div>
    </div>
  );
}
