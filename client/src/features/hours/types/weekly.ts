export type {
  WeekData,
  WeeklyEmployer,
  WeekVisaBreakdown,
  VisaPeriod,
  WeeklyHoursResponse,
} from '@get-granted/shared';

import type { VisaType } from '@get-granted/shared';

export interface DayBarInfo {
  date: string; // YYYY-MM-DD
  visaType: VisaType | null;
  color: string; // Tailwind class (bg-visa-1st-color, bg-visa-2nd-color, bg-visa-3rd-color)
  /** 'first' if arrivalDate, 'last' if expiryDate, null otherwise */
  boundary: 'first' | 'last' | null;
}
