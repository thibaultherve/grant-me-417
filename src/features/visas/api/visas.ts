/**
 * Visas API Layer
 *
 * Fonctions pures pour gérer les visas WHV
 * Pas de state management, pas de side effects
 */

import { supabase } from '@/lib/supabase';

import type {
  CreateVisaInput,
  UpdateVisaInput,
  UserVisa,
  VisaType,
  WeeklyProgressData,
} from '../types';

/**
 * Récupère tous les visas de l'utilisateur connecté
 */
export const getVisas = async (): Promise<UserVisa[]> => {
  const { data, error } = await supabase
    .from('user_visas')
    .select('*')
    .order('visa_type', { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * Ajoute un nouveau visa
 */
export const addVisa = async (
  userId: string,
  input: CreateVisaInput,
): Promise<UserVisa> => {
  const { data, error } = await supabase
    .from('user_visas')
    .insert([
      {
        user_id: userId,
        visa_type: input.visa_type,
        arrival_date: input.arrival_date,
        days_required: input.days_required,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Supprime un visa
 */
export const deleteVisa = async (id: string): Promise<void> => {
  const { error } = await supabase.from('user_visas').delete().eq('id', id);

  if (error) throw error;
};

/**
 * Récupère un visa par type
 */
export const getVisaByType = async (
  type: VisaType,
): Promise<UserVisa | null> => {
  const { data, error } = await supabase
    .from('user_visas')
    .select('*')
    .eq('visa_type', type)
    .single();

  if (error) {
    // PGRST116 = no rows found, return null instead of throwing
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
};

/**
 * Met à jour un visa
 */
export const updateVisa = async (
  id: string,
  input: UpdateVisaInput,
): Promise<UserVisa> => {
  const { data, error } = await supabase
    .from('user_visas')
    .update({ arrival_date: input.arrival_date })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Récupère les progrès hebdomadaires d'un visa
 */
export const getVisaWeeklyProgress = async (
  visaId: string,
): Promise<WeeklyProgressData[]> => {
  const { data, error } = await supabase
    .from('visa_weekly_progress')
    .select('*')
    .eq('user_visa_id', visaId)
    .order('week_start_date', { ascending: true });

  if (error) throw error;
  return data || [];
};
