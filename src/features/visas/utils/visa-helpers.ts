import type { VisaType, VisaTypeSlug } from '../types';

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
