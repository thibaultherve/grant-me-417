export type VisaType = 'first_whv' | 'second_whv' | 'third_whv';

export type VisaTypeSlug = 'first-whv' | 'second-whv' | 'third-whv';

export interface UserVisa {
  id: string;
  user_id: string;
  visa_type: VisaType;
  arrival_date: string;
  expiry_date: string;
  days_required: number;
  eligible_days: number;
  days_worked: number;
  progress_percentage: number;
  is_eligible: boolean;
  days_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface CreateVisaInput {
  visa_type: VisaType;
  arrival_date: string;
  days_required?: number;
}

export interface UpdateVisaInput {
  arrival_date: string;
}

export interface WeeklyProgressData {
  id: string;
  user_visa_id: string;
  week_start_date: string;
  week_end_date: string;
  hours: number;
  eligible_hours: number;
  eligible_days: number;
  days_worked: number;
  created_at: string;
  updated_at: string;
}
