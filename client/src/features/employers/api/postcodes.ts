import { api } from '@/lib/api-client';

import type { Postcode } from '@regranted/shared';

export const searchPostcodes = async (query: string): Promise<Postcode[]> => {
  if (!query || query.length === 0) {
    return [];
  }

  return api.get(`/postcodes/search?q=${encodeURIComponent(query)}`);
};

export const validatePostcode = async (postcode: string): Promise<boolean> => {
  try {
    const results: Postcode[] = await api.get(
      `/postcodes/search?q=${encodeURIComponent(postcode)}`,
    );
    return results.some((p) => p.postcode === postcode);
  } catch {
    return false;
  }
};

export const getPostcode = async (
  postcode: string,
): Promise<Postcode | null> => {
  try {
    const results: Postcode[] = await api.get(
      `/postcodes/search?q=${encodeURIComponent(postcode)}`,
    );
    return results.find((p) => p.postcode === postcode) ?? null;
  } catch {
    return null;
  }
};
