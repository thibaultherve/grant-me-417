import type { VisaType } from '@get-granted/shared';

type VisaTypeSlug = 'first-whv' | 'second-whv' | 'third-whv';

/**
 * Get human-readable label for a visa type
 */
export const getVisaLabel = (type: VisaType): string => {
  const labels: Record<VisaType, string> = {
    first_whv: '1st WHV (417)',
    second_whv: '2nd WHV (417)',
    third_whv: '3rd WHV (417)',
  };
  return labels[type];
};

/**
 * Convert DB visa type to URL slug
 */
export const visaTypeToSlug = (type: VisaType): VisaTypeSlug => {
  const map: Record<VisaType, VisaTypeSlug> = {
    first_whv: 'first-whv',
    second_whv: 'second-whv',
    third_whv: 'third-whv',
  };
  return map[type];
};

/**
 * Convert URL slug to DB visa type
 */
export const slugToVisaType = (slug: string): VisaType | null => {
  const map: Record<string, VisaType> = {
    'first-whv': 'first_whv',
    'second-whv': 'second_whv',
    'third-whv': 'third_whv',
  };
  return map[slug] || null;
};
