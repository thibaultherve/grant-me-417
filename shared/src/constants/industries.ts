export const INDUSTRY_TYPES = [
  'plant_and_animal_cultivation',
  'fishing_and_pearling',
  'tree_farming_and_felling',
  'mining',
  'construction',
  'hospitality_and_tourism',
  'bushfire_recovery_work',
  'weather_recovery_work',
  'critical_covid19_work',
  'other',
] as const;

export type IndustryTypeValue = (typeof INDUSTRY_TYPES)[number];

export const INDUSTRY_LABELS: Record<IndustryTypeValue, string> = {
  plant_and_animal_cultivation: 'Plant & Animal Cultivation',
  fishing_and_pearling: 'Fishing & Pearling',
  tree_farming_and_felling: 'Tree Farming & Felling',
  mining: 'Mining',
  construction: 'Construction',
  hospitality_and_tourism: 'Hospitality & Tourism',
  bushfire_recovery_work: 'Bushfire Recovery Work',
  weather_recovery_work: 'Weather Recovery Work',
  critical_covid19_work: 'Critical COVID-19 Work',
  other: 'Other',
};

export const INDUSTRY_SHORT_LABELS: Record<IndustryTypeValue, string> = {
  plant_and_animal_cultivation: 'Cultivation',
  fishing_and_pearling: 'Fishing',
  tree_farming_and_felling: 'Tree Farming',
  mining: 'Mining',
  construction: 'Construction',
  hospitality_and_tourism: 'Hospitality',
  bushfire_recovery_work: 'Bushfire',
  weather_recovery_work: 'Weather',
  critical_covid19_work: 'COVID-19',
  other: 'Other',
};
