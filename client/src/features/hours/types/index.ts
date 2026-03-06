export type SortOrder = 'asc' | 'desc';

export type SortField =
  | 'workDate'
  | 'employerName'
  | 'industry'
  | 'hours'
  | 'isEligible';

export type SortOptions = {
  field: SortField;
  order: SortOrder;
};
