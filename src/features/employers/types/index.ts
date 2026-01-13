// Import et ré-export depuis schemas (source unique de vérité)
import type { IndustryType } from '../schemas';
import type { PostcodeBadgeData, Suburb } from './suburb';

// Suburb data as returned by Supabase join in employer queries
export interface EmployerSuburb extends Suburb {
  postcodes: PostcodeBadgeData | null;
}

export interface Employer {
  id: string;
  name: string;
  industry: IndustryType;
  suburb_id: number;
  suburb: EmployerSuburb;
  is_eligible: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployerInput {
  name: string;
  industry: IndustryType;
  suburb_id: number;
  is_eligible?: boolean;
}
