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
 * Single source of truth for WHV-eligible countries.
 * Maps ISO 3166-1 alpha-2 codes to display label and visa type.
 */
export const ELIGIBLE_COUNTRIES_MAP = {
  // 417
  BE: { label: 'Belgium', visaType: '417' },
  CA: { label: 'Canada', visaType: '417' },
  CY: { label: 'Cyprus', visaType: '417' },
  DK: { label: 'Denmark', visaType: '417' },
  EE: { label: 'Estonia', visaType: '417' },
  FI: { label: 'Finland', visaType: '417' },
  FR: { label: 'France', visaType: '417' },
  DE: { label: 'Germany', visaType: '417' },
  HK: { label: 'Hong Kong SAR', visaType: '417' },
  IE: { label: 'Ireland', visaType: '417' },
  IT: { label: 'Italy', visaType: '417' },
  JP: { label: 'Japan', visaType: '417' },
  KR: { label: 'Republic of Korea', visaType: '417' },
  MT: { label: 'Malta', visaType: '417' },
  NL: { label: 'Netherlands', visaType: '417' },
  NO: { label: 'Norway', visaType: '417' },
  SE: { label: 'Sweden', visaType: '417' },
  TW: { label: 'Taiwan', visaType: '417' },
  GB: { label: 'United Kingdom', visaType: '417' },
  // 462
  AR: { label: 'Argentina', visaType: '462' },
  AT: { label: 'Austria', visaType: '462' },
  CL: { label: 'Chile', visaType: '462' },
  CN: { label: 'China', visaType: '462' },
  CZ: { label: 'Czech Republic', visaType: '462' },
  EC: { label: 'Ecuador', visaType: '462' },
  GR: { label: 'Greece', visaType: '462' },
  HU: { label: 'Hungary', visaType: '462' },
  ID: { label: 'Indonesia', visaType: '462' },
  IL: { label: 'Israel', visaType: '462' },
  LU: { label: 'Luxembourg', visaType: '462' },
  MY: { label: 'Malaysia', visaType: '462' },
  PE: { label: 'Peru', visaType: '462' },
  PL: { label: 'Poland', visaType: '462' },
  PT: { label: 'Portugal', visaType: '462' },
  SM: { label: 'San Marino', visaType: '462' },
  SK: { label: 'Slovakia', visaType: '462' },
  SI: { label: 'Slovenia', visaType: '462' },
  ES: { label: 'Spain', visaType: '462' },
  TH: { label: 'Thailand', visaType: '462' },
  TR: { label: 'Turkey', visaType: '462' },
  US: { label: 'United States', visaType: '462' },
  UY: { label: 'Uruguay', visaType: '462' },
  VN: { label: 'Vietnam', visaType: '462' },
} as const satisfies Record<string, { label: string; visaType: '417' | '462' }>;

/**
 * All eligible country codes (for Zod enum validation).
 */
export const ELIGIBLE_COUNTRIES = Object.keys(ELIGIBLE_COUNTRIES_MAP) as [string, ...string[]];

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
 * All eligible country codes sorted alphabetically by display label.
 */
export const ELIGIBLE_COUNTRIES_SORTED = Object.entries(ELIGIBLE_COUNTRIES_MAP)
  .sort(([, a], [, b]) => a.label.localeCompare(b.label))
  .map(([code, { label }]) => ({ code, label }));

/**
 * Determine the WHV visa number (417 or 462) from a nationality code.
 * Returns null if the country is not eligible for either visa.
 */
export function getVisaTypeForNationality(countryCode: string): '417' | '462' | null {
  return (ELIGIBLE_COUNTRIES_MAP as Record<string, { visaType: '417' | '462' }>)[countryCode]?.visaType ?? null;
}
