/**
 * Employers API Layer
 *
 * Fonctions pures pour communiquer avec Supabase
 * Pas de state management, pas de side effects
 * Suivent le pattern bulletproof-react api-layer
 */

import { supabase } from '@/lib/supabase';
import type { Employer, CreateEmployerInput } from '../types';

/**
 * Récupère tous les employeurs de l'utilisateur connecté
 * Triés par date de création (plus récent en premier)
 */
export const getEmployers = async (): Promise<Employer[]> => {
  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Récupère un employeur par son ID
 */
export const getEmployer = async (id: string): Promise<Employer> => {
  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Ajoute un nouvel employeur
 */
export const addEmployer = async (input: CreateEmployerInput): Promise<Employer> => {
  const { data, error } = await supabase
    .from('employers')
    .insert([
      {
        name: input.name,
        industry: input.industry,
        postcode: input.postcode || null,
        is_eligible: input.is_eligible ?? true,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Met à jour un employeur existant
 */
export const updateEmployer = async (
  id: string,
  input: CreateEmployerInput
): Promise<Employer> => {
  const { data, error } = await supabase
    .from('employers')
    .update({
      name: input.name,
      industry: input.industry,
      postcode: input.postcode || null,
      is_eligible: input.is_eligible ?? true,
    })
    .eq('id', id)
    .select()
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
