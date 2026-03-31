import {
  checkIndustryEligibility,
  ELIGIBLE_ZONES,
  INDUSTRY_LABELS,
  INDUSTRY_TYPES,
  ZONE_FLAG_MAP,
  type PostcodeBadgeData,
  type ZoneType,
} from '@regranted/shared';

import type { EligibilityMatrixRow } from '../types/directory';

/**
 * Compute the full eligibility matrix for a postcode given its zone flags and a visa type.
 *
 * Returns one row per industry, sorted eligible-first, each with the list of
 * zones that make it eligible in this postcode.
 */
export function computeEligibilityMatrix(
  flags: PostcodeBadgeData,
  visaType: '417' | '462',
): EligibilityMatrixRow[] {
  const rows: EligibilityMatrixRow[] = INDUSTRY_TYPES.map((industry) => {
    const isEligible = checkIndustryEligibility(industry, visaType, flags);

    // Determine which specific zones make this industry eligible in this postcode
    const eligibleZones: ZoneType[] = [];
    if (isEligible) {
      const industryZones = ELIGIBLE_ZONES[visaType]?.[industry] ?? [];
      for (const zone of industryZones) {
        const flag = ZONE_FLAG_MAP[zone];
        if (flag === null || flags[flag as keyof PostcodeBadgeData]) {
          eligibleZones.push(zone);
        }
      }
    }

    return {
      industry,
      label: INDUSTRY_LABELS[industry],
      isEligible,
      eligibleZones,
    };
  });

  // Sort: eligible industries first, then non-eligible
  return rows.sort((a, b) => {
    if (a.isEligible === b.isEligible) return 0;
    return a.isEligible ? -1 : 1;
  });
}
