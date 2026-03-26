export type {
  WeekData,
  WeeklyEmployer,
  WeekVisaBreakdown,
  VisaPeriod,
  WeeklyHoursResponse,
} from '@regranted/shared';

import type { VisaType } from '@regranted/shared';

export interface DayBarInfo {
  date: string; // YYYY-MM-DD
  visaType: VisaType | null;
  color: string; // Tailwind class (bg-visa-1st-color, bg-visa-2nd-color, bg-visa-3rd-color)
  /** 'first' if arrivalDate, 'last' if expiryDate, null otherwise */
  boundary: 'first' | 'last' | null;
}
