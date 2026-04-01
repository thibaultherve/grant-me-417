import type { VisaSubclass } from '../types';

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
} as const satisfies Record<string, { label: string; visaType: VisaSubclass }>;

/**
 * All eligible country codes (for Zod enum validation).
 */
export const ELIGIBLE_COUNTRIES = Object.keys(ELIGIBLE_COUNTRIES_MAP) as [
  string,
  ...string[],
];

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
export function getVisaTypeForNationality(
  countryCode: string,
): VisaSubclass | null {
  return (
    (ELIGIBLE_COUNTRIES_MAP as Record<string, { visaType: VisaSubclass }>)[
      countryCode
    ]?.visaType ?? null
  );
}
