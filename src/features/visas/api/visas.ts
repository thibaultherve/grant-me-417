/**
 * Visas API Layer
 *
 * Fonctions pures pour gérer les visas WHV
 * Pas de state management, pas de side effects
 */

import { supabase } from '@/lib/supabase';

import type { UserVisa, CreateVisaInput } from '../types';

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
 * Récupère un visa par son ID
 */
export const getVisa = async (id: string): Promise<UserVisa> => {
  const { data, error } = await supabase
    .from('user_visas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
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
 * Met à jour un visa existant
 */
export const updateVisa = async (
  id: string,
  input: Partial<CreateVisaInput>,
): Promise<UserVisa> => {
  const { data, error } = await supabase
    .from('user_visas')
    .update({
      visa_type: input.visa_type,
      arrival_date: input.arrival_date,
      days_required: input.days_required,
    })
    .eq('id', id)
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
 * Récupère les progrès hebdomadaires d'un visa
 */
export const getVisaWeeklyProgress = async (visaId: string) => {
  const { data, error } = await supabase
    .from('visa_weekly_progress')
    .select('*')
    .eq('visa_id', visaId)
    .order('week_starting', { ascending: false })
    .limit(12); // 12 dernières semaines

  if (error) throw error;
  return data || [];
};
