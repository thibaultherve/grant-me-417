import { cn } from '@/lib/utils';

import type { VisaType } from '@get-granted/shared';
import { VISA_TYPES } from '@get-granted/shared';
import type { WeekVisaBreakdown } from '../../types/weekly';

/** Visa type → Tailwind bg color class for dots */
const VISA_DOT_COLORS: Record<VisaType, string> = {
  first_whv: 'bg-visa-1st-color',
  second_whv: 'bg-visa-2nd-color',
  third_whv: 'bg-visa-3rd-color',
};

/** Sort visa breakdowns in canonical order: 1st → 2nd → 3rd */
function sortBreakdown(breakdown: WeekVisaBreakdown[]): WeekVisaBreakdown[] {
  if (breakdown.length <= 1) return breakdown;
  return [...breakdown].sort(
    (a, b) => VISA_TYPES.indexOf(a.visaType) - VISA_TYPES.indexOf(b.visaType),
  );
}

interface WeekTotalsProps {
  totalHours: number;
  visaBreakdown: WeekVisaBreakdown[];
  className?: string;
}

/**
 * Desktop: renders total hours + per-visa eligible hours and days as plain colored text.
 * Design: "65h" bold | "39h-13h" green-blue text | "7d-2d" green-blue text
 */
export function WeekTotals({ totalHours, visaBreakdown, className }: WeekTotalsProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Total hours — bold black */}
      <span className="tabular-nums text-[13px] font-bold text-foreground min-w-[60px] text-right">
        {totalHours > 0 ? `${totalHours}h` : '–'}
      </span>

      {/* Eligible hours — colored text per visa */}
      <div className="flex items-center gap-0.5 min-w-[65px] justify-end">
        <VisaValues
          breakdown={visaBreakdown}
          getValue={(vb) => `${vb.eligibleHours}h`}
          getNumber={(vb) => vb.eligibleHours}
        />
      </div>

      {/* Eligible days — colored text per visa */}
      <div className="flex items-center gap-0.5 min-w-[50px] justify-end">
        <VisaValues
          breakdown={visaBreakdown}
          getValue={(vb) => `${vb.eligibleDays}d`}
          getNumber={(vb) => vb.eligibleDays}
        />
      </div>
    </div>
  );
}

interface MobileWeekStatsProps {
  totalHours: number;
  visaBreakdown: WeekVisaBreakdown[];
  className?: string;
}

/**
 * Mobile: labeled stat columns — "Total" / "Eligible" / "Days" labels above values.
 * Design: 3 columns spread evenly with label (10px) + value (14px bold / 13px colored).
 */
export function MobileWeekStats({ totalHours, visaBreakdown, className }: MobileWeekStatsProps) {
  return (
    <div className={cn('flex items-start justify-between', className)}>
      {/* Total */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-medium text-muted-foreground">Total</span>
        <span className="tabular-nums text-sm font-bold text-foreground">
          {totalHours > 0 ? `${totalHours}h` : '–'}
        </span>
      </div>

      {/* Eligible */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-medium text-muted-foreground">Eligible</span>
        <div className="flex items-center gap-0.5">
          <VisaValues
            breakdown={visaBreakdown}
            getValue={(vb) => `${vb.eligibleHours}h`}
            getNumber={(vb) => vb.eligibleHours}
            size="mobile"
          />
        </div>
      </div>

      {/* Days */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-medium text-muted-foreground">Days</span>
        <div className="flex items-center gap-0.5">
          <VisaValues
            breakdown={visaBreakdown}
            getValue={(vb) => `${vb.eligibleDays}d`}
            getNumber={(vb) => vb.eligibleDays}
            size="mobile"
          />
        </div>
      </div>
    </div>
  );
}

/** Shared visa values renderer — neutral text with colored visa dots underneath */
export function VisaValues({
  breakdown,
  getValue,
  getNumber,
  size = 'desktop',
}: {
  breakdown: WeekVisaBreakdown[];
  getValue: (vb: WeekVisaBreakdown) => string;
  getNumber?: (vb: WeekVisaBreakdown) => number;
  size?: 'desktop' | 'mobile';
}) {
  if (breakdown.length === 0) {
    return <span className="text-xs text-muted-foreground/50">–</span>;
  }

  // Show dash when all values are zero
  if (getNumber && breakdown.every((vb) => getNumber(vb) === 0)) {
    return <span className="text-xs text-muted-foreground/50">–</span>;
  }

  const sorted = sortBreakdown(breakdown);
  // Design: single-visa uses 13px, multi-visa (split) uses 12px
  const textSize = size === 'mobile'
    ? 'text-[13px]'
    : sorted.length > 1 ? 'text-xs' : 'text-[13px]';

  return (
    <>
      {sorted.map((vb, i) => (
        <span key={vb.visaId} className="flex items-center gap-0.5">
          {i > 0 && (
            <span className="text-muted-foreground text-xs font-normal">-</span>
          )}
          <span className="relative">
            <span
              className={cn(
                'tabular-nums font-semibold text-muted-foreground',
                textSize,
              )}
            >
              {getValue(vb)}
            </span>
            <span className={cn('absolute left-1/2 -translate-x-1/2 -bottom-1 h-[5px] w-[5px] rounded-full', VISA_DOT_COLORS[vb.visaType])} />
          </span>
        </span>
      ))}
    </>
  );
}
