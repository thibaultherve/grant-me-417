import type { IndustryTypeValue } from './industries.js';

export const VISA_TYPES = ['first_whv', 'second_whv', 'third_whv'] as const;

export const VISA_DAYS_REQUIRED: Record<(typeof VISA_TYPES)[number], number> = {
  first_whv: 88,
  second_whv: 179,
  third_whv: 0,
};

export const visaHasGoal = (visaType: (typeof VISA_TYPES)[number]): boolean =>
  VISA_DAYS_REQUIRED[visaType] > 0;

/**
 * WHV 417 hour→day thresholds (evaluated in descending order).
 * Weekly hours worked determine how many eligible days are counted.
 */
export const HOUR_TO_DAY_THRESHOLDS = [
  { minHours: 30, eligibleDays: 7 },
  { minHours: 24, eligibleDays: 4 },
  { minHours: 18, eligibleDays: 3 },
  { minHours: 12, eligibleDays: 2 },
  { minHours: 6, eligibleDays: 1 },
] as const;

export const ELIGIBLE_DAYS_VALUES = [0, 1, 2, 3, 4, 7] as const;

/**
 * If the projected goal date is within this many weeks of visa expiry,
 * the prediction status is "tight" instead of "on-track".
 */
export const GOAL_TIGHT_THRESHOLD_WEEKS = 4;

export const MAX_HOURS_PER_DAY = 24;
export const MAX_HOURS_PER_WEEK = 168; // 7 * 24

/**
 * WHV 417 eligible countries (ISO 3166-1 alpha-2).
 */
export const ELIGIBLE_COUNTRIES_417 = [
  'BE', // Belgium
  'CA', // Canada
  'CY', // Cyprus
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'HK', // Hong Kong SAR
  'IE', // Ireland
  'IT', // Italy
  'JP', // Japan
  'KR', // Republic of Korea
  'MT', // Malta
  'NL', // Netherlands
  'NO', // Norway
  'SE', // Sweden
  'TW', // Taiwan
  'GB', // United Kingdom
] as const;

/**
 * WHV 462 eligible countries (ISO 3166-1 alpha-2).
 */
export const ELIGIBLE_COUNTRIES_462 = [
  'AR', // Argentina
  'AT', // Austria
  'CL', // Chile
  'CN', // China
  'CZ', // Czech Republic
  'EC', // Ecuador
  'GR', // Greece
  'HU', // Hungary
  'ID', // Indonesia
  'IL', // Israel
  'LU', // Luxembourg
  'MY', // Malaysia
  'PE', // Peru
  'PL', // Poland
  'PT', // Portugal
  'SM', // San Marino
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
  'TH', // Thailand
  'TR', // Turkey
  'US', // United States
  'UY', // Uruguay
  'VN', // Vietnam
] as const;

// ── Eligibility zones ────────────────────────────────────────────────────────

export const ZONE_TYPES = ['northern', 'remote', 'regional', 'bushfire', 'weather', 'anywhere'] as const;
export type ZoneType = (typeof ZONE_TYPES)[number];

/**
 * Maps each zone to the corresponding PostcodeBadgeData flag.
 * `null` means the zone is always active (e.g. "anywhere in Australia").
 */
export const ZONE_FLAG_MAP: Record<ZoneType, string | null> = {
  northern: 'isNorthernAustralia',
  remote: 'isRemoteVeryRemote',
  regional: 'isRegionalAustralia',
  bushfire: 'isBushfireDeclared',
  weather: 'isNaturalDisasterDeclared',
  anywhere: null,
};

type IndustryZoneMap = Record<IndustryTypeValue, ZoneType[]>;

/**
 * Eligible zones per industry per visa type.
 * Source: https://immi.homeaffairs.gov.au (417 + 462 specified work pages)
 */
export const ELIGIBLE_ZONES: Record<'417' | '462', IndustryZoneMap> = {
  '417': {
    hospitality_and_tourism: ['northern', 'remote'],
    plant_and_animal_cultivation: ['regional'],
    fishing_and_pearling: ['regional'],
    tree_farming_and_felling: ['regional'],
    mining: ['regional'],
    construction: ['regional'],
    bushfire_recovery_work: ['bushfire'],
    weather_recovery_work: ['weather'],
    critical_covid19_work: ['anywhere'],
    other: [],
  },
  '462': {
    hospitality_and_tourism: ['northern', 'remote'],
    plant_and_animal_cultivation: ['northern', 'regional'],
    fishing_and_pearling: ['northern'],
    tree_farming_and_felling: ['northern'],
    mining: [],
    construction: ['northern', 'regional'],
    bushfire_recovery_work: ['bushfire'],
    weather_recovery_work: ['weather'],
    critical_covid19_work: ['anywhere'],
    other: [],
  },
};

interface EligibilityFlags {
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
  visaType: '417' | '462',
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

// ── Scrape URLs ──────────────────────────────────────────────────────────────

/**
 * Source URLs for postcode eligibility scraping per visa type.
 */
export const VISA_SCRAPE_URLS = {
  '417': 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417/specified-work',
  '462': 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462/specified-462-work',
} as const;

/**
 * Determine the WHV visa number (417 or 462) from a nationality code.
 * Returns null if the country is not eligible for either visa.
 */
export function getVisaTypeForNationality(countryCode: string): '417' | '462' | null {
  if ((ELIGIBLE_COUNTRIES_417 as readonly string[]).includes(countryCode)) return '417';
  if ((ELIGIBLE_COUNTRIES_462 as readonly string[]).includes(countryCode)) return '462';
  return null;
}
