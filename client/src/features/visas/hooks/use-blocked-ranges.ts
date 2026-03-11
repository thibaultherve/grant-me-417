import { useMemo } from 'react';

import type { VisaType } from '@get-granted/shared';

import { useVisaContext } from './use-visa-context';

export type BlockedRangeReason = 'visa_period' | 'overlap_zone';

export interface BlockedRange {
  start: Date;
  end: Date;
  visaType: VisaType;
  reason: BlockedRangeReason;
}

/** Hex colors matching the ordinal badge colors */
const VISA_COLORS: Record<VisaType, string> = {
  first_whv: '#10b981',
  second_whv: '#3b82f6',
  third_whv: '#f59e0b',
};

export const OVERLAP_ZONE_COLOR = '#9ca3af';

export function getBlockedRangeColor(visaType: VisaType): string {
  return VISA_COLORS[visaType];
}

const VISA_ORDER: Record<VisaType, number> = {
  first_whv: 1,
  second_whv: 2,
  third_whv: 3,
};

export interface OrderingConstraint {
  visaType: VisaType;
  arrivalDate: Date;
  expiryDate: Date;
}

export interface UseBlockedRangesResult {
  blockedRanges: BlockedRange[];
  /** Earliest allowed date from ordering rules (dates before this are disabled) */
  minDate?: Date;
  /** Latest allowed date from ordering rules (dates after this are disabled) */
  maxDate?: Date;
  /** Info about the predecessor ordering constraint (for legend display) */
  orderingConstraint?: OrderingConstraint;
  /** Info about the successor ordering constraint (for legend display) */
  successorConstraint?: OrderingConstraint;
}

/**
 * Compute blocked date ranges from existing visas.
 *
 * Returns three types of constraints:
 * 1. **Visa periods** (colored bars) — the exact date range of each existing visa
 * 2. **Overlap zones** (grey bars) — 364 days before a successor visa where
 *    starting a new visa would cause a period overlap
 * 3. **Ordering constraint** (minDate) — when the current visa type has a
 *    predecessor, all dates up to the predecessor's expiryDate are disabled
 */
export function useBlockedRanges(
  excludeVisaId?: string,
  currentVisaType?: VisaType | null,
): UseBlockedRangesResult {
  const { visas } = useVisaContext();

  return useMemo(() => {
    const otherVisas = visas.filter((v) => v.id !== excludeVisaId);
    const ranges: BlockedRange[] = [];
    let minDate: Date | undefined;
    let maxDate: Date | undefined;
    let orderingConstraint: OrderingConstraint | undefined;
    let successorConstraint: OrderingConstraint | undefined;

    // 1. Existing visa periods (colored bars)
    for (const visa of otherVisas) {
      if (!visa.arrivalDate || !visa.expiryDate) continue;
      ranges.push({
        start: new Date(visa.arrivalDate),
        end: new Date(visa.expiryDate),
        visaType: visa.visaType,
        reason: 'visa_period',
      });
    }

    // 2. Overlap zones and ordering (only when visa type is known)
    if (currentVisaType) {
      const currentOrder = VISA_ORDER[currentVisaType];

      // Find the nearest successor (lowest order) and farthest successor (highest order)
      let nearestSuccessor: (typeof otherVisas)[number] | undefined;
      let farthestSuccessor: (typeof otherVisas)[number] | undefined;

      for (const visa of otherVisas) {
        if (!visa.arrivalDate || !visa.expiryDate) continue;
        const visaOrder = VISA_ORDER[visa.visaType];

        if (visaOrder < currentOrder) {
          // Predecessor: ordering constraint — must start after its expiryDate
          const expiryDate = new Date(visa.expiryDate);
          expiryDate.setHours(0, 0, 0, 0);
          const minCandidate = new Date(expiryDate);
          minCandidate.setDate(minCandidate.getDate() + 1);
          minCandidate.setHours(0, 0, 0, 0);

          if (!minDate || minCandidate > minDate) {
            minDate = minCandidate;
            const arrivalDate = new Date(visa.arrivalDate);
            arrivalDate.setHours(0, 0, 0, 0);
            orderingConstraint = { visaType: visa.visaType, arrivalDate, expiryDate };
          }
        } else if (visaOrder > currentOrder) {
          if (
            !nearestSuccessor ||
            visaOrder < VISA_ORDER[nearestSuccessor.visaType]
          ) {
            nearestSuccessor = visa;
          }
          if (
            !farthestSuccessor ||
            visaOrder > VISA_ORDER[farthestSuccessor.visaType]
          ) {
            farthestSuccessor = visa;
          }
        }
      }

      // Only compute overlap zone and maxDate for the nearest successor
      if (nearestSuccessor) {
        const arrivalDate = new Date(nearestSuccessor.arrivalDate);
        arrivalDate.setHours(0, 0, 0, 0);
        const expiryDate = new Date(nearestSuccessor.expiryDate);
        expiryDate.setHours(0, 0, 0, 0);

        // Overlap zone: 364 days before successor's arrival
        const overlapStart = new Date(arrivalDate);
        overlapStart.setDate(overlapStart.getDate() - 364);
        const dayBefore = new Date(arrivalDate);
        dayBefore.setDate(dayBefore.getDate() - 1);

        if (overlapStart <= dayBefore) {
          ranges.push({
            start: overlapStart,
            end: dayBefore,
            visaType: nearestSuccessor.visaType,
            reason: 'overlap_zone',
          });
        }

        // maxDate: must start before successor's arrival (ordering constraint)
        const maxCandidate = new Date(arrivalDate);
        maxCandidate.setDate(maxCandidate.getDate() - 1);
        maxCandidate.setHours(0, 0, 0, 0);

        if (!maxDate || maxCandidate < maxDate) {
          maxDate = maxCandidate;
        }

        // For the legend, show the farthest successor (e.g. "After 3rd WHV 417")
        const legendVisa = farthestSuccessor ?? nearestSuccessor;
        const legendArrival = new Date(legendVisa.arrivalDate);
        legendArrival.setHours(0, 0, 0, 0);
        const legendExpiry = new Date(legendVisa.expiryDate);
        legendExpiry.setHours(0, 0, 0, 0);
        successorConstraint = { visaType: legendVisa.visaType, arrivalDate: legendArrival, expiryDate: legendExpiry };
      }
    }

    return { blockedRanges: ranges, minDate, maxDate, orderingConstraint, successorConstraint };
  }, [visas, excludeVisaId, currentVisaType]);
}
