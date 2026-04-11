import { Info } from 'lucide-react';

import { getVisaOrdinal } from '@/utils/visa-helpers';

import type {
  BlockedRange,
  OrderingConstraint,
} from '../hooks/use-blocked-ranges';
import { OVERLAP_ZONE_COLOR } from '../hooks/use-blocked-ranges';

import {
  formatLegendDate,
  VISA_INDICATOR_COLORS,
} from './visa-date-picker-helpers';

interface VisaDatePickerLegendProps {
  visaPeriodRanges: BlockedRange[];
  overlapZoneRanges: BlockedRange[];
  orderingConstraint?: OrderingConstraint;
  successorConstraint?: OrderingConstraint;
}

const LONG_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

export function VisaDatePickerLegend({
  visaPeriodRanges,
  overlapZoneRanges,
  orderingConstraint,
  successorConstraint,
}: VisaDatePickerLegendProps) {
  return (
    <div
      className="flex flex-col gap-1.5 px-3 pt-3 pb-3"
      style={{ minWidth: 200, maxWidth: 220 }}
    >
      <span className="font-semibold uppercase text-[10px] tracking-[0.6px] text-muted-foreground">
        Dates Unavailable
      </span>

      {orderingConstraint && (
        <div className="flex items-center gap-2">
          <span className="shrink-0 rounded-sm block w-6 h-1 bg-border" />
          <span className="text-[11px] font-medium text-foreground">
            Before {getVisaOrdinal(orderingConstraint.visaType)} WHV 417 —{' '}
            {orderingConstraint.arrivalDate.toLocaleDateString(
              'en-AU',
              LONG_DATE_FORMAT,
            )}
          </span>
        </div>
      )}

      {overlapZoneRanges.map((range) => (
        <div
          key={`overlap-${range.visaType}-${range.start.toISOString()}`}
          className="flex items-center gap-2"
        >
          <span
            className="shrink-0 rounded-sm block"
            style={{
              width: 24,
              height: 4,
              backgroundColor: OVERLAP_ZONE_COLOR,
            }}
          />
          <span className="text-[11px] font-medium text-foreground">
            Would overlap the {getVisaOrdinal(range.visaType)} WHV 417 — after{' '}
            {range.start.toLocaleDateString('en-AU', LONG_DATE_FORMAT)}
          </span>
        </div>
      ))}

      {visaPeriodRanges.map((range) => (
        <div
          key={`period-${range.visaType}-${range.start.toISOString()}`}
          className="flex items-center gap-2"
        >
          <span
            className="shrink-0 rounded-sm block"
            style={{
              width: 24,
              height: 4,
              backgroundColor: VISA_INDICATOR_COLORS[range.visaType],
            }}
          />
          <span className="text-[11px] font-medium text-foreground">
            {getVisaOrdinal(range.visaType)} WHV 417 —{' '}
            {formatLegendDate(range.start, range.end)}
          </span>
        </div>
      ))}

      {successorConstraint && (
        <div className="flex items-center gap-2">
          <span className="shrink-0 rounded-sm block w-6 h-1 bg-border" />
          <span className="text-[11px] font-medium text-foreground">
            After {getVisaOrdinal(successorConstraint.visaType)} WHV 417 —{' '}
            {successorConstraint.expiryDate.toLocaleDateString(
              'en-AU',
              LONG_DATE_FORMAT,
            )}
          </span>
        </div>
      )}

      <div className="flex items-start gap-1.5 mt-1">
        <Info className="w-3 h-3 shrink-0 mt-0.5 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground">
          Your arrival date must be outside existing visa periods and respect
          visa ordering (1st before 2nd, 2nd before 3rd)
        </span>
      </div>
    </div>
  );
}
