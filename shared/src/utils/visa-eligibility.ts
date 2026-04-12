import type { IndustryTypeValue } from '../constants/industries';
import { ELIGIBLE_ZONES, ZONE_FLAG_MAP } from '../constants/visa-eligibility';
import type { VisaSubclass } from '../constants/visas';

export interface EligibilityFlags {
  isNorthernAustralia: boolean;
  isRemoteVeryRemote: boolean;
  isRegionalAustralia: boolean;
  isBushfireDeclared: boolean;
  isNaturalDisasterDeclared: boolean;
}

/**
 * Check if a given industry is eligible based on postcode zone flags and visa type.
 */
export function checkIndustryEligibility(
  industry: IndustryTypeValue,
  visaType: VisaSubclass,
  flags: EligibilityFlags,
): boolean {
  const zones = ELIGIBLE_ZONES[visaType]?.[industry];
  if (!zones || zones.length === 0) return false;

  return zones.some((zone) => {
    const flag = ZONE_FLAG_MAP[zone];
    if (flag === null) return true;
    return !!flags[flag as keyof EligibilityFlags];
  });
}
