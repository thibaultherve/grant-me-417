import { api } from '@/lib/api-client';

import type {
  FavoritePostcodeResponse,
  GlobalChangesResponse,
  LastUpdateResponse,
  PaginatedDirectoryQuery,
  PaginatedDirectoryResponse,
  PostcodeDetailResponse,
} from '@regranted/shared';

export const getDirectory = async (
  params: PaginatedDirectoryQuery,
): Promise<PaginatedDirectoryResponse> => {
  const searchParams = new URLSearchParams();
  searchParams.set('visaType', params.visaType);
  searchParams.set('page', String(params.page ?? 1));
  searchParams.set('limit', String(params.limit ?? 15));
  searchParams.set('sort', params.sort ?? 'asc');
  if (params.search) searchParams.set('search', params.search);
  if (params.states?.length) searchParams.set('states', params.states.join(','));
  if (params.zones?.length) searchParams.set('zones', params.zones.join(','));
  if (params.favorites) searchParams.set('favorites', 'true');
  return api.get(`/postcodes/directory?${searchParams.toString()}`);
};

export const getPostcodeDetail = async (
  postcode: string,
): Promise<PostcodeDetailResponse> => {
  return api.get(`/postcodes/${postcode}`);
};

export const getGlobalChanges = async (params: {
  visaType: '417' | '462';
  page?: number;
  limit?: number;
}): Promise<GlobalChangesResponse> => {
  const searchParams = new URLSearchParams();
  searchParams.set('visaType', params.visaType);
  searchParams.set('page', String(params.page ?? 1));
  searchParams.set('limit', String(params.limit ?? 10));
  return api.get(`/postcodes/changes?${searchParams.toString()}`);
};

export const getLastUpdate = async (): Promise<LastUpdateResponse> => {
  return api.get('/postcodes/last-update');
};

export const toggleFavoritePostcode = async (
  postcode: string,
): Promise<{ action: 'added' | 'removed' }> => {
  return api.post('/user/favorites/postcodes', { postcode });
};

export const getFavoritePostcodes = async (): Promise<
  FavoritePostcodeResponse[]
> => {
  return api.get('/user/favorites/postcodes');
};
