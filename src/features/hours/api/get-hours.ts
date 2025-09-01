import { supabase } from '@/lib/supabase';
import type { HourEntryWithEmployer, HoursResponse, SortOptions } from '../types';

export type GetHoursOptions = {
  page?: number;
  limit?: number;
  sort?: SortOptions;
};

export const getHours = async ({ 
  page = 1, 
  limit = 10,
  sort = { field: 'work_date', order: 'desc' }
}: GetHoursOptions = {}): Promise<HoursResponse> => {
  const offset = (page - 1) * limit;
  
  // Get total count from the view
  const { count, error: countError } = await supabase
    .from('work_entries_with_employers')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    throw new Error(`Failed to count hours: ${countError.message}`);
  }

  // Build query with sorting - now we can sort by any column since they're all direct columns in the view
  let query = supabase
    .from('work_entries_with_employers')
    .select('*');

  // Apply server-side sorting for ALL fields
  const ascending = sort.order === 'asc';
  
  switch (sort.field) {
    case 'work_date':
      query = query.order('work_date', { ascending });
      break;
    case 'hours':
      query = query.order('hours', { ascending });
      break;
    case 'employer_name':
      query = query.order('employer_name', { ascending });
      break;
    case 'industry':
      query = query.order('industry', { ascending });
      break;
    case 'is_eligible':
      query = query.order('is_eligible', { ascending });
      break;
    default:
      query = query.order('work_date', { ascending: false });
  }
  
  // Apply pagination
  const { data, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch hours: ${error.message}`);
  }

  // Transform data to match our expected format
  const transformedData: HourEntryWithEmployer[] = data?.map((entry: any) => ({
    id: entry.id,
    user_id: entry.user_id,
    employer_id: entry.employer_id,
    work_date: entry.work_date,
    hours: Number(entry.hours),
    created_at: entry.created_at,
    updated_at: entry.updated_at,
    employer_name: entry.employer_name || 'Unknown Employer',
    industry: entry.industry || 'unknown',
    is_eligible: entry.is_eligible || false,
  })) || [];

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    data: transformedData,
    total,
    page,
    limit,
    totalPages,
  };
};