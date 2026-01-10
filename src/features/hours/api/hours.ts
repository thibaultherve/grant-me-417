/**
 * Hours API Layer
 *
 * Fonctions pures pour gérer les heures de travail
 * Pas de state management, pas de side effects
 */

import { supabase } from '@/lib/supabase';

import type {
  HourEntryWithEmployer,
  HoursResponse,
  SortOptions,
  WorkEntryInput,
} from '../types';

export type GetHoursOptions = {
  page?: number;
  limit?: number;
  sort?: SortOptions;
};

/**
 * Récupère les heures avec pagination et tri
 */
export const getHours = async ({
  page = 1,
  limit = 10,
  sort = { field: 'work_date', order: 'desc' },
}: GetHoursOptions = {}): Promise<HoursResponse> => {
  const offset = (page - 1) * limit;

  // Get total count
  const { count, error: countError } = await supabase
    .from('work_entries_with_employers')
    .select('*', { count: 'exact', head: true });

  if (countError) throw countError;

  // Build query with sorting
  let query = supabase.from('work_entries_with_employers').select('*');

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

  if (error) throw error;

  // Transform data
  const transformedData: HourEntryWithEmployer[] = (data || []).map(
    (entry) => ({
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
    }),
  );

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

/**
 * Récupère toutes les heures d'un employeur (pour calendar badges)
 */
export const getEmployerHours = async (employerId: string) => {
  const { data, error } = await supabase
    .from('work_entries')
    .select('*')
    .eq('employer_id', employerId)
    .order('work_date', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Ajoute des heures de travail (mode By Day)
 */
const addWorkEntries = async (
  userId: string,
  employerId: string,
  entries: WorkEntryInput[],
) => {
  const preparedEntries = entries.map((entry) => ({
    user_id: userId,
    employer_id: employerId,
    work_date: entry.work_date,
    hours: entry.hours,
  }));

  const { data, error } = await supabase
    .from('work_entries')
    .insert(preparedEntries)
    .select();

  if (error) throw error;
  return data;
};

/**
 * Supprime une entrée d'heures
 */
export const deleteWorkEntry = async (id: string) => {
  const { error } = await supabase.from('work_entries').delete().eq('id', id);

  if (error) throw error;
};

/**
 * Saves week hours with smart upsert/delete logic
 * - Hours > 0: Upsert (create or update)
 * - Hours === 0 AND exists in DB: Delete
 * - Hours === 0 AND not in DB: Skip (optimization)
 *
 * @param userId - User ID
 * @param employerId - Employer ID
 * @param weekEntries - Array of work entries with dates and hours
 * @param existingDates - Dates that currently exist in the database
 * @returns Object with count of deleted and saved entries
 */
export const saveWeekHours = async (
  userId: string,
  employerId: string,
  weekEntries: Array<{ work_date: string; hours: number }>,
  existingDates: string[],
) => {
  // Separate entries into upsert and delete operations
  const toUpsert = weekEntries.filter((e) => e.hours > 0);
  const toDelete = weekEntries
    .filter((e) => e.hours === 0)
    .filter((e) => existingDates.includes(e.work_date));

  // Delete entries with 0 hours (only if they exist in DB)
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from('work_entries')
      .delete()
      .eq('employer_id', employerId)
      .in(
        'work_date',
        toDelete.map((e) => e.work_date),
      );

    if (deleteError) throw deleteError;
  }

  // Upsert entries with hours > 0
  if (toUpsert.length > 0) {
    const entries = toUpsert.map((e) => ({
      user_id: userId,
      employer_id: employerId,
      work_date: e.work_date,
      hours: e.hours,
    }));

    const { error: upsertError } = await supabase
      .from('work_entries')
      .upsert(entries, { onConflict: 'user_id,employer_id,work_date' });

    if (upsertError) throw upsertError;
  }

  return { deleted: toDelete.length, saved: toUpsert.length };
};
