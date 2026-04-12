import type { SuburbWithPostcode } from '@regranted/shared';

import { api } from '@/lib/api-client';

export const searchSuburbs = async (
  query: string,
): Promise<SuburbWithPostcode[]> => {
  if (!query || query.length === 0) {
    return [];
  }

  return api.get(`/suburbs/search?q=${encodeURIComponent(query)}`);
};

export const getSuburb = async (
  id: number,
): Promise<SuburbWithPostcode | null> => {
  try {
    return api.get(`/suburbs/${id}`);
  } catch {
    return null;
  }
};

export const validateSuburbId = async (suburbId: number): Promise<boolean> => {
  try {
    const suburb = await getSuburb(suburbId);
    return !!suburb;
  } catch {
    return false;
  }
};
