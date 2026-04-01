import type { VisaType } from '@regranted/shared';
import { formatDistanceToNow } from 'date-fns';

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

const MS_PER_DAY = 86400000;

export interface VisaTimeline {
  /** Days remaining (negative if expired) */
  daysRemaining: number;
  /** Days elapsed since arrival */
  daysElapsed: number;
  /** Total visa duration in days */
  totalDays: number;
  /** Progress percentage (0–100) */
  percent: number;
  /** Whether the visa is expired */
  isExpired: boolean;
  /** Display label, e.g. "123 days left" or "5 days ago" */
  label: string;
}

/**
 * Compute visa timeline data client-side from arrival/expiry dates.
 * All WHV 417 visas are exactly 365 days.
 */
export function computeVisaTimeline(
  arrivalDate: string,
  expiryDate: string,
): VisaTimeline {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const arrival = new Date(arrivalDate);
  arrival.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const totalDays = Math.round(
    (expiry.getTime() - arrival.getTime()) / MS_PER_DAY,
  );
  const daysRemaining = Math.round(
    (expiry.getTime() - now.getTime()) / MS_PER_DAY,
  );
  const isExpired = daysRemaining <= 0;
  const daysElapsed = Math.max(
    0,
    Math.round((now.getTime() - arrival.getTime()) / MS_PER_DAY),
  );
  const percent =
    totalDays > 0
      ? Math.min(Math.round((daysElapsed / totalDays) * 10000) / 100, 100)
      : 100;
  const label = isExpired
    ? `${Math.abs(daysRemaining)} days ago`
    : `${daysRemaining} days left`;

  return { daysRemaining, daysElapsed, totalDays, percent, isExpired, label };
}

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
