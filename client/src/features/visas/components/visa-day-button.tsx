import * as React from 'react';
import { DayButton } from 'react-day-picker';

import { cn } from '@/lib/utils';

import { OVERLAP_ZONE_COLOR } from '../hooks/use-blocked-ranges';

export type VisaDayContextValue = {
  dayColorMap: Map<string, string>;
  minDate?: Date;
  maxDate?: Date;
};

// Passes blocked-day metadata down to the custom DayButton via context to
// avoid defining the component inside another component (which would remount
// it on every render of the parent).
export const VisaDayContext = React.createContext<VisaDayContextValue>({
  dayColorMap: new Map(),
});

export function VisaDayButton({
  children,
  day,
  modifiers,
  className,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const { dayColorMap, minDate, maxDate } = React.useContext(VisaDayContext);
  const mapColor = dayColorMap.get(day.date.toDateString()) ?? null;
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
        !indicatorColor &&
          !modifiers.disabled &&
          'hover:bg-accent hover:text-accent-foreground',
        isSelected && !indicatorColor && 'bg-primary text-white font-semibold',
        modifiers.today &&
          !isSelected &&
          !indicatorColor &&
          'bg-accent text-accent-foreground',
        indicatorColor && 'text-disabled cursor-default',
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
