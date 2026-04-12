import type { VisaType } from '@regranted/shared';

export const VEVO_URL =
  'https://online.immi.gov.au/evo/firstParty?actionType=query';

export const VISA_INDICATOR_COLORS: Record<VisaType, string> = {
  first_whv: 'var(--visa-1st-color)',
  second_whv: 'var(--visa-2nd-color)',
  third_whv: 'var(--visa-3rd-color)',
};

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatLegendDate(start: Date, end: Date): string {
  const s = start.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  });
  const e = end.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `${s} to ${e}`;
}
