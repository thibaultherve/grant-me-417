import type { IndustryTypeValue, ZoneType } from '@regranted/shared';
import { AUSTRALIAN_STATES } from '@regranted/shared';

export type AustralianStateCode = (typeof AUSTRALIAN_STATES)[number];

export type VisaTypeFilter = '417' | '462';

export type SortDirection = 'asc' | 'desc';

export interface DirectoryFiltersState {
  search: string;
  states: AustralianStateCode[];
  zones: ZoneType[];
  visaType: VisaTypeFilter;
  favorites: boolean;
  page: number;
  sort: SortDirection;
}

export interface EligibilityMatrixRow {
  industry: IndustryTypeValue;
  label: string;
  isEligible: boolean;
  eligibleZones: ZoneType[];
}
