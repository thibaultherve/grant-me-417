export type IndustryType =
  | 'plant_and_animal_cultivation'
  | 'fishing_and_pearling'
  | 'tree_farming_and_felling'
  | 'mining'
  | 'construction'
  | 'hospitality_and_tourism'
  | 'bushfire_recovery_work'
  | 'critical_covid19_work'
  | 'other';

export interface Employer {
  id: string;
  name: string;
  industry: IndustryType;
  postcode?: string | null;
  is_eligible: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployerInput {
  name: string;
  industry: IndustryType;
  postcode?: string;
  is_eligible?: boolean;
}
