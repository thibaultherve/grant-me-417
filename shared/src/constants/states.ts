export const AUSTRALIAN_STATES = [
  'NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT',
] as const;

export const AUSTRALIAN_STATE_NAMES: Record<(typeof AUSTRALIAN_STATES)[number], string> = {
  ACT: 'Australian Capital Territory',
  NSW: 'New South Wales',
  NT: 'Northern Territory',
  QLD: 'Queensland',
  SA: 'South Australia',
  TAS: 'Tasmania',
  VIC: 'Victoria',
  WA: 'Western Australia',
};
