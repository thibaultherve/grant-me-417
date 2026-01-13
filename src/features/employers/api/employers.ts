/**
 * Employers API Layer
 *
 * Fonctions pures pour communiquer avec Supabase
 * Pas de state management, pas de side effects
 * Suivent le pattern bulletproof-react api-layer
 */

import { supabase } from '@/lib/supabase';

import type { CreateEmployerInput, Employer } from '../types';

/**
 * Récupère tous les employeurs de l'utilisateur connecté
 * Triés par date de création (plus récent en premier)
 * Inclut les données du suburb avec les badges postcode
 */
export const getEmployers = async (): Promise<Employer[]> => {
  const { data, error } = await supabase
    .from('employers')
    .select(
      `
      *,
      suburb:suburbs (
        id,
        suburb_name,
        postcode,
        state_code,
        postcodes:postcodes!fk_postcode (
          is_regional_australia,
          is_remote_very_remote,
          is_northern_australia,
          is_bushfire_declared,
          is_natural_disaster_declared
        )
      )
    `,
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Ajoute un nouvel employeur
 */
export const addEmployer = async (
  input: CreateEmployerInput,
): Promise<Employer> => {
  const { data, error } = await supabase
    .from('employers')
    .insert([
      {
        name: input.name,
        industry: input.industry,
        suburb_id: input.suburb_id,
        is_eligible: input.is_eligible ?? true,
      },
    ])
    .select(
      `
      *,
      suburb:suburbs (
        id,
        suburb_name,
        postcode,
        state_code,
        postcodes:postcodes!fk_postcode (
          is_regional_australia,
          is_remote_very_remote,
          is_northern_australia,
          is_bushfire_declared,
          is_natural_disaster_declared
        )
      )
    `,
    )
    .single();

  if (error) throw error;
  return data;
};

/**
 * Met à jour un employeur existant
 */
export const updateEmployer = async (
  id: string,
  input: CreateEmployerInput,
): Promise<Employer> => {
  const { data, error } = await supabase
    .from('employers')
    .update({
      name: input.name,
      industry: input.industry,
      suburb_id: input.suburb_id,
      is_eligible: input.is_eligible ?? true,
    })
    .eq('id', id)
    .select(
      `
      *,
      suburb:suburbs (
        id,
        suburb_name,
        postcode,
        state_code,
        postcodes:postcodes!fk_postcode (
          is_regional_australia,
          is_remote_very_remote,
          is_northern_australia,
          is_bushfire_declared,
          is_natural_disaster_declared
        )
      )
    `,
    )
    .single();

  if (error) throw error;
  return data;
};

/**
 * Supprime un employeur
 */
export const deleteEmployer = async (id: string): Promise<void> => {
  const { error } = await supabase.from('employers').delete().eq('id', id);

  if (error) throw error;
};

/**
 * Récupère un employeur par son ID
 * Retourne null si non trouvé ou accès refusé (RLS)
 */
export const getEmployer = async (id: string): Promise<Employer | null> => {
  const { data, error } = await supabase
    .from('employers')
    .select(
      `
      *,
      suburb:suburbs (
        id,
        suburb_name,
        postcode,
        state_code,
        postcodes:postcodes!fk_postcode (
          is_regional_australia,
          is_remote_very_remote,
          is_northern_australia,
          is_bushfire_declared,
          is_natural_disaster_declared
        )
      )
    `,
    )
    .eq('id', id)
    .single();

  if (error) {
    // PGRST116: Not found
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
};
