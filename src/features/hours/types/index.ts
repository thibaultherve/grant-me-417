import type { IndustryType } from '@/features/employers/schemas';

type HourEntry = {
  id: string;
  user_id: string;
  employer_id: string;
  work_date: string;
  hours: number;
  created_at: string;
  updated_at: string;
};

export type HourEntryWithEmployer = HourEntry & {
  employer_name: string;
  industry: IndustryType;
  is_eligible: boolean;
};

export type SortOrder = 'asc' | 'desc';

export type SortField =
  | 'work_date'
  | 'employer_name'
  | 'industry'
  | 'hours'
  | 'is_eligible';

export type SortOptions = {
  field: SortField;
  order: SortOrder;
};

export type HoursResponse = {
  data: HourEntryWithEmployer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type WorkEntryInput = {
  work_date: string;
  hours: number;
};

// Calendar types for monthly view
export type DayHoursEntry = {
  employerName: string;
  hours: number;
};

export type MonthHoursData = {
  [dateKey: string]: DayHoursEntry[]; // dateKey format: "YYYY-MM-DD"
};
