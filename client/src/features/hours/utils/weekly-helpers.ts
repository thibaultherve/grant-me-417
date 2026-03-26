import { format, parseISO } from 'date-fns';

import type { VisaPeriod, VisaType } from '@regranted/shared';

import type { DayBarInfo } from '../types/weekly';

/** Visa type → Tailwind bg class for visa color bars */
const VISA_BAR_COLORS: Record<VisaType, string> = {
  first_whv: 'bg-visa-1st-color',
  second_whv: 'bg-visa-2nd-color',
  third_whv: 'bg-visa-3rd-color',
};

/** Visa type → Tailwind text class */
export const VISA_TEXT_COLORS: Record<VisaType, string> = {
  first_whv: 'text-visa-1st-color',
  second_whv: 'text-visa-2nd-color',
  third_whv: 'text-visa-3rd-color',
};

/** Visa type → Tailwind bg class with low opacity for badge background */
export const VISA_BADGE_BG: Record<VisaType, string> = {
  first_whv: 'bg-visa-1st-color/15',
  second_whv: 'bg-visa-2nd-color/15',
  third_whv: 'bg-visa-3rd-color/15',
};

/**
 * Get Tailwind bg class for a visa bar color.
 * first_whv → 'bg-visa-1st-color', second_whv → 'bg-visa-2nd-color', etc.
 */
export function getVisaBarColor(visaType: VisaType): string {
  return VISA_BAR_COLORS[visaType];
}

/**
 * Determine which visa is active on a specific date.
 * Returns the first matching visa whose [arrivalDate, expiryDate] range covers the date.
 */
export function getVisaForDate(
  dateKey: string,
  visas: VisaPeriod[],
): VisaPeriod | null {
  for (const visa of visas) {
    if (dateKey >= visa.arrivalDate && dateKey <= visa.expiryDate) {
      return visa;
    }
  }
  return null;
}

/**
 * Build day bar info for a week's 7 dates given visa data.
 * Each day gets a visa type + color class for rendering the colored indicator bar.
 */
export function buildDayBars(
  dates: string[],
  visas: VisaPeriod[],
): DayBarInfo[] {
  return dates.map((date) => {
    const visa = getVisaForDate(date, visas);
    let boundary: DayBarInfo['boundary'] = null;
    if (visa) {
      if (date === visa.arrivalDate) boundary = 'first';
      else if (date === visa.expiryDate) boundary = 'last';
    }
    return {
      date,
      visaType: visa?.visaType ?? null,
      color: visa ? getVisaBarColor(visa.visaType) : 'bg-muted',
      boundary,
    };
  });
}

/**
 * Format a week label from weekStart/weekEnd date strings.
 * Same month: "Mar 2-8" | Cross-month: "Feb 23 - Mar 1"
 */
export function formatWeekLabel(weekStart: string, weekEnd: string): string {
  const start = parseISO(weekStart);
  const end = parseISO(weekEnd);

  const startMonth = format(start, 'MMM');
  const endMonth = format(end, 'MMM');

  if (startMonth === endMonth) {
    return `${startMonth} ${format(start, 'd')}-${format(end, 'd')}`;
  }

  return `${startMonth} ${format(start, 'd')} - ${endMonth} ${format(end, 'd')}`;
}

/**
 * Analyse visa coverage for a week's 7 dates.
 * Returns the unique visa types present and whether per-day dots are needed
 * (i.e. the week spans multiple visas or a visa ends mid-week).
 */
export function getWeekVisaInfo(
  dates: string[],
  visas: VisaPeriod[],
): { visaTypes: VisaType[]; showPerDayDots: boolean } {
  const dayBars = buildDayBars(dates, visas);
  const uniqueTypes = [
    ...new Set(dayBars.map((d) => d.visaType).filter((t): t is VisaType => t !== null)),
  ];
  const showPerDayDots = uniqueTypes.length > 1;
  return { visaTypes: uniqueTypes, showPerDayDots };
}

/**
 * Format hours display for a day cell.
 * Returns the number as string, or "–" (en-dash) for 0/undefined.
 */
export function formatDayHours(hours: number | undefined): string {
  if (!hours) return '–';
  return String(hours);
}

/**
 * Check if a date falls within the currently displayed month.
 * Used to gray out out-of-month days in boundary weeks.
 */
export function isInMonth(dateKey: string, year: number, month: number): boolean {
  const date = parseISO(dateKey);
  return date.getFullYear() === year && date.getMonth() + 1 === month;
}
