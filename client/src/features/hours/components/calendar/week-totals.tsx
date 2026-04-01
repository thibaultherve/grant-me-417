import type { VisaType } from '@regranted/shared';
import { VISA_TYPES } from '@regranted/shared';

import { cn } from '@/lib/utils';

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

/** Shared visa values renderer — neutral text with colored visa dots underneath */
export function VisaValues({
  breakdown,
  getValue,
  getNumber,
  size = 'desktop',
  showDots = true,
  bold = false,
}: {
  breakdown: WeekVisaBreakdown[];
  getValue: (vb: WeekVisaBreakdown) => string;
  getNumber?: (vb: WeekVisaBreakdown) => number;
  size?: 'desktop' | 'mobile';
  showDots?: boolean;
  bold?: boolean;
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
  const textSize =
    size === 'mobile'
      ? 'text-[13px]'
      : sorted.length > 1
        ? 'text-xs'
        : 'text-[13px]';

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
                'tabular-nums',
                bold
                  ? 'font-bold text-foreground'
                  : 'font-semibold text-muted-foreground',
                textSize,
              )}
            >
              {getValue(vb)}
            </span>
            {showDots && (
              <span
                className={cn(
                  'absolute left-1/2 -translate-x-1/2 -bottom-1 h-1.25 w-1.25 rounded-full',
                  VISA_DOT_COLORS[vb.visaType],
                )}
              />
            )}
          </span>
        </span>
      ))}
    </>
  );
}
