/**
 * Postcodes API Layer
 *
 * Functions for searching and validating Australian postcodes
 * Follows bulletproof-react api-layer pattern
 */

import { supabase } from '@/lib/supabase';

import type { Postcode } from '../types/postcode';

/**
 * Search postcodes by prefix
 * Returns max 5 results ordered by postcode
 */
export const searchPostcodes = async (query: string): Promise<Postcode[]> => {
  if (!query || query.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('postcodes')
    .select('*')
    .ilike('postcode', `${query}%`)
    .order('postcode', { ascending: true })
    .limit(5);

  if (error) throw error;
  return data || [];
};

/**
 * Validate if a postcode exists in the database
 * Used for form validation
 */
export const validatePostcode = async (postcode: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('postcodes')
    .select('postcode')
    .eq('postcode', postcode)
    .single();

  if (error) {
    // If error is 'PGRST116' (not found), postcode doesn't exist
    if (error.code === 'PGRST116') {
      return false;
    }
    throw error;
  }

  return !!data;
};

/**
 * Get a specific postcode with all its flags
 */
export const getPostcode = async (
  postcode: string,
): Promise<Postcode | null> => {
  const { data, error } = await supabase
    .from('postcodes')
    .select('*')
    .eq('postcode', postcode)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
};
