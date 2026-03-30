import { VISA_SCRAPE_URLS } from '@regranted/shared';

export const VISA_CONFIGS = {
  '417': {
    url: VISA_SCRAPE_URLS['417'],
    name: 'Working Holiday (417)',
  },
  '462': {
    url: VISA_SCRAPE_URLS['462'],
    name: 'Work and Holiday (462)',
  },
} as const;

export type VisaType = keyof typeof VISA_CONFIGS;

export const CATEGORIES = [
  'is_remote_very_remote',
  'is_northern_australia',
  'is_regional_australia',
  'is_bushfire_declared',
  'is_natural_disaster_declared',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  is_remote_very_remote: 'Remote and Very Remote Australia',
  is_northern_australia: 'Northern Australia',
  is_regional_australia: 'Regional Australia',
  is_bushfire_declared: 'Bushfire Declared Areas',
  is_natural_disaster_declared: 'Natural Disaster Declared Areas',
};

const RAW_STATE_CODE_MAP: Record<string, string> = {
  'new south wales': 'NSW',
  'victoria': 'VIC',
  'queensland': 'QLD',
  'south australia': 'SA',
  'western australia': 'WA',
  'tasmania': 'TAS',
  'northern territory': 'NT',
  'australian capital territory': 'ACT',
  'norfolk island': 'NI',
};

/**
 * Resolve a state name (potentially with zero-width spaces, parenthetical notes, etc.)
 * to its state code. Returns undefined if not matched.
 */
export function resolveStateCode(rawName: string): string | undefined {
  // Strip zero-width spaces and other invisible Unicode chars, then trim
  const cleaned = rawName.replace(/[\u200B-\u200D\uFEFF]/g, '').trim().toLowerCase();

  // Direct match
  if (RAW_STATE_CODE_MAP[cleaned]) return RAW_STATE_CODE_MAP[cleaned];

  // Match with parenthetical suffix removed: "Australian Capital Territory (ACT)" -> "australian capital territory"
  const withoutParens = cleaned.replace(/\s*\(.*\)$/, '');
  if (RAW_STATE_CODE_MAP[withoutParens]) return RAW_STATE_CODE_MAP[withoutParens];

  // Partial match: "Queensland (all areas north of ...)" -> "queensland"
  for (const [name, code] of Object.entries(RAW_STATE_CODE_MAP)) {
    if (cleaned.startsWith(name)) return code;
  }

  return undefined;
}

export interface EligibilityFlags {
  is_remote_very_remote: boolean;
  is_northern_australia: boolean;
  is_regional_australia: boolean;
  is_bushfire_declared: boolean;
  is_natural_disaster_declared: boolean;
}

export function emptyFlags(): EligibilityFlags {
  return {
    is_remote_very_remote: false,
    is_northern_australia: false,
    is_regional_australia: false,
    is_bushfire_declared: false,
    is_natural_disaster_declared: false,
  };
}
