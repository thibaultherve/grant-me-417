import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import type { ZoneType } from '@regranted/shared';

import type {
  AustralianStateCode,
  DirectoryFiltersState,
  SortDirection,
  VisaTypeFilter,
} from '../types/directory';

const DEFAULTS: DirectoryFiltersState = {
  search: '',
  states: [],
  zones: [],
  visaType: '417',
  favorites: false,
  page: 1,
  sort: 'asc',
};

function parseFiltersFromParams(
  searchParams: URLSearchParams,
): DirectoryFiltersState {
  const states = searchParams.get('states');
  const zones = searchParams.get('zones');
  const visaType = searchParams.get('visaType');
  const page = searchParams.get('page');
  const sort = searchParams.get('sort');

  return {
    search: searchParams.get('search') ?? DEFAULTS.search,
    states: states ? (states.split(',').filter(Boolean) as AustralianStateCode[]) : DEFAULTS.states,
    zones: zones
      ? (zones.split(',').filter(Boolean) as ZoneType[])
      : DEFAULTS.zones,
    visaType:
      visaType === '417' || visaType === '462'
        ? visaType
        : DEFAULTS.visaType,
    favorites: searchParams.get('favorites') === 'true',
    page: page ? Math.max(1, parseInt(page, 10) || 1) : DEFAULTS.page,
    sort: sort === 'asc' || sort === 'desc' ? sort : DEFAULTS.sort,
  };
}

function filtersToParams(filters: DirectoryFiltersState): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.visaType !== DEFAULTS.visaType)
    params.set('visaType', filters.visaType);
  if (filters.search) params.set('search', filters.search);
  if (filters.states.length > 0)
    params.set('states', filters.states.join(','));
  if (filters.zones.length > 0) params.set('zones', filters.zones.join(','));
  if (filters.favorites) params.set('favorites', 'true');
  if (filters.page > 1) params.set('page', String(filters.page));
  if (filters.sort !== DEFAULTS.sort) params.set('sort', filters.sort);

  return params;
}

export function useDirectoryFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => parseFiltersFromParams(searchParams),
    [searchParams],
  );

  const setFilters = useCallback(
    (updater: Partial<DirectoryFiltersState> | ((prev: DirectoryFiltersState) => Partial<DirectoryFiltersState>)) => {
      setSearchParams((prev) => {
        const currentFilters = parseFiltersFromParams(prev);
        const updates =
          typeof updater === 'function' ? updater(currentFilters) : updater;
        const merged = { ...currentFilters, ...updates };

        // Reset page to 1 when filters change (but not when page itself changes)
        if (!('page' in updates)) {
          merged.page = 1;
        }

        return filtersToParams(merged);
      }, { replace: true });
    },
    [setSearchParams],
  );

  const setSearch = useCallback(
    (search: string) => setFilters({ search }),
    [setFilters],
  );

  const toggleState = useCallback(
    (state: AustralianStateCode) =>
      setFilters((prev) => ({
        states: prev.states.includes(state)
          ? prev.states.filter((s) => s !== state)
          : [...prev.states, state],
      })),
    [setFilters],
  );

  const toggleZone = useCallback(
    (zone: ZoneType) =>
      setFilters((prev) => ({
        zones: prev.zones.includes(zone)
          ? prev.zones.filter((z) => z !== zone)
          : [...prev.zones, zone],
      })),
    [setFilters],
  );

  const setVisaType = useCallback(
    (visaType: VisaTypeFilter) => setFilters({ visaType }),
    [setFilters],
  );

  const toggleFavorites = useCallback(
    () => setFilters((prev) => ({ favorites: !prev.favorites })),
    [setFilters],
  );

  const setPage = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters],
  );

  const toggleSort = useCallback(
    () =>
      setFilters((prev) => ({
        sort: (prev.sort === 'asc' ? 'desc' : 'asc') as SortDirection,
      })),
    [setFilters],
  );

  const resetFilters = useCallback(
    () => setSearchParams({}, { replace: true }),
    [setSearchParams],
  );

  return {
    filters,
    setSearch,
    toggleState,
    toggleZone,
    setVisaType,
    toggleFavorites,
    setPage,
    toggleSort,
    resetFilters,
  };
}
