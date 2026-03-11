import { formatDistanceToNow } from 'date-fns';

import type { VisaType } from '@get-granted/shared';

type VisaTypeSlug = 'first-whv' | 'second-whv' | 'third-whv';

/** Get short ordinal badge text (1st, 2nd, 3rd) */
export const getVisaOrdinal = (type: VisaType): string => {
  const ordinals: Record<VisaType, string> = {
    first_whv: '1st',
    second_whv: '2nd',
    third_whv: '3rd',
  };
  return ordinals[type];
};

/** Get Tailwind bg color class for the ordinal badge */
export const getVisaBadgeColor = (type: VisaType): string => {
  const colors: Record<VisaType, string> = {
    first_whv: 'bg-success',
    second_whv: 'bg-info',
    third_whv: 'bg-warning',
  };
  return colors[type];
};

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
 * Format a date string as a human-readable "X ago" string
 */
export const formatCreatedAgo = (dateStr: string): string =>
  formatDistanceToNow(new Date(dateStr), { addSuffix: true });

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
