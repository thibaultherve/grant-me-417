import type { IndustryTypeValue } from '@get-granted/shared';

export const INDUSTRY_OPTIONS = [
  {
    value: 'plant_and_animal_cultivation',
    label: 'Plant and Animal Cultivation',
  },
  { value: 'fishing_and_pearling', label: 'Fishing and Pearling' },
  { value: 'tree_farming_and_felling', label: 'Tree Farming and Felling' },
  { value: 'mining', label: 'Mining' },
  { value: 'construction', label: 'Construction' },
  { value: 'hospitality_and_tourism', label: 'Hospitality and Tourism' },
  { value: 'bushfire_recovery_work', label: 'Bushfire Recovery Work' },
  { value: 'weather_recovery_work', label: 'Weather Recovery Work' },
  { value: 'critical_covid19_work', label: 'Critical COVID-19 Work' },
  { value: 'other', label: 'Other' },
] as const;

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
