// Import et ré-export depuis schemas (source unique de vérité)
import type { IndustryType } from '../schemas';

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
