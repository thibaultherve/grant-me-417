import { supabase } from '@/lib/supabase';
import type { PostcodeBadgeData, SuburbWithPostcode } from '../types/suburb';

// Type for the raw Supabase response with joined postcode data
interface SuburbRawResponse {
  id: number;
  suburb_name: string;
  postcode: string;
  state_code: string;
  postcodes: PostcodeBadgeData | null;
}

export const searchSuburbs = async (
  query: string,
): Promise<SuburbWithPostcode[]> => {
  if (!query || query.length === 0) {
    return [];
  }

  const isNumeric = /^\d+$/.test(query);

  let queryBuilder = supabase
    .from('suburbs')
    .select(
      `
      id,
      suburb_name,
      postcode,
      state_code,
      postcodes!fk_postcode (
        is_regional_australia,
        is_remote_very_remote,
        is_northern_australia,
        is_bushfire_declared,
        is_natural_disaster_declared
      )
    `,
    )
    .limit(10);

  if (isNumeric) {
    queryBuilder = queryBuilder.ilike('postcode', `${query}%`);
  } else {
    queryBuilder = queryBuilder.ilike('suburb_name', `%${query}%`);
  }

  const { data, error } = await queryBuilder.order('suburb_name', {
    ascending: true,
  });

  if (error) throw error;

  return ((data as unknown as SuburbRawResponse[]) || []).map((item) => ({
    id: item.id,
    suburb_name: item.suburb_name,
    postcode: item.postcode,
    state_code: item.state_code,
    postcodeData: item.postcodes || null,
  }));
};

export const getSuburb = async (
  id: number,
): Promise<SuburbWithPostcode | null> => {
  const { data, error } = await supabase
    .from('suburbs')
    .select(
      `
      id,
      suburb_name,
      postcode,
      state_code,
      postcodes!fk_postcode (
        is_regional_australia,
        is_remote_very_remote,
        is_northern_australia,
        is_bushfire_declared,
        is_natural_disaster_declared
      )
    `,
    )
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  const typedData = data as unknown as SuburbRawResponse;

  return {
    id: typedData.id,
    suburb_name: typedData.suburb_name,
    postcode: typedData.postcode,
    state_code: typedData.state_code,
    postcodeData: typedData.postcodes || null,
  };
};

export const validateSuburbId = async (suburbId: number): Promise<boolean> => {
  const { data, error } = await supabase
    .from('suburbs')
    .select('id')
    .eq('id', suburbId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return false;
    throw error;
  }
  return !!data;
};
