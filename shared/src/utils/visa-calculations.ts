import { VISA_DAYS_REQUIRED } from '../constants/visa-progress';
import type { VISA_TYPES } from '../constants/visas';

/**
 * Get the number of required days for a given visa type.
 */
export function getDaysRequired(visaType: string): number {
  return VISA_DAYS_REQUIRED[visaType as (typeof VISA_TYPES)[number]] ?? 0;
}

/**
 * Whether a visa type has a day-count goal to reach.
 */
export const visaHasGoal = (visaType: (typeof VISA_TYPES)[number]): boolean =>
  VISA_DAYS_REQUIRED[visaType] > 0;

/**
 * Compute expiry date from arrival date: arrival + 1 year - 1 day.
 * Accepts a Date or ISO date string. Returns a Date.
 */
export function computeExpiryDate(arrivalDate: Date | string): Date {
  const arrival =
    typeof arrivalDate === 'string' ? new Date(arrivalDate) : arrivalDate;
  const expiry = new Date(arrival);
  expiry.setUTCFullYear(expiry.getUTCFullYear() + 1);
  expiry.setUTCDate(expiry.getUTCDate() - 1);
  return expiry;
}
