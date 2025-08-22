export type VisaType = 'first_whv' | 'second_whv' | 'third_whv'

export interface UserVisa {
  id: string
  user_id: string
  visa_type: VisaType
  arrival_date: string
  end_date: string
  days_required: number
  eligible_days: number
  days_worked: number
  progress_percentage: number
  is_eligible: boolean
  days_remaining: number
  created_at: string
  updated_at: string
}

export interface CreateVisaInput {
  visa_type: VisaType
  arrival_date: string
  days_required?: number
}