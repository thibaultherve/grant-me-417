import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { handleError } from '@/lib/error-handler';
import { queryKeys } from '@/lib/react-query';

import type {
  PaginatedDirectoryItem,
  PaginatedDirectoryResponse,
} from '@regranted/shared';

import type { DirectoryFiltersState } from '../types/directory';

import {
  getDirectory,
  getFavoritePostcodes,
  getGlobalChanges,
  getLastUpdate,
  getPostcodeDetail,
  toggleFavoritePostcode,
} from './directory';

export const useDirectory = (filters: DirectoryFiltersState) => {
  const params = {
    visaType: filters.visaType,
    page: filters.page,
    limit: 15,
    search: filters.search || undefined,
    states: filters.states.length > 0 ? filters.states : undefined,
    zones: filters.zones.length > 0 ? filters.zones : undefined,
    favorites: filters.favorites || undefined,
    sort: filters.sort,
  };

  return useQuery({
    queryKey: queryKeys.directory.list(params as Record<string, unknown>),
    queryFn: () => getDirectory(params),
    placeholderData: keepPreviousData,
  });
};

export const usePostcodeDetail = (postcode: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.directory.detail(postcode!),
    queryFn: () => getPostcodeDetail(postcode!),
    enabled: !!postcode,
  });
};

export const useGlobalChanges = (params: {
  visaType: '417' | '462';
  page: number;
}) => {
  return useQuery({
    queryKey: queryKeys.directory.changes(params as Record<string, unknown>),
    queryFn: () => getGlobalChanges(params),
    placeholderData: keepPreviousData,
  });
};

export const useLastUpdate = () => {
  return useQuery({
    queryKey: queryKeys.directory.lastUpdate,
    queryFn: getLastUpdate,
    staleTime: 10 * 60 * 1000,
  });
};

export const useFavoritePostcodes = () => {
  return useQuery({
    queryKey: queryKeys.directory.favorites,
    queryFn: getFavoritePostcodes,
    staleTime: 1 * 60 * 1000,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFavoritePostcode,

    onMutate: async (postcode) => {
      // Cancel in-flight directory queries to avoid overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.directory.listPrefix,
      });

      // Snapshot all directory list caches for rollback
      const previousQueries = queryClient.getQueriesData<PaginatedDirectoryResponse>({
        queryKey: queryKeys.directory.listPrefix,
      });

      // Optimistic toggle on all directory list caches
      queryClient.setQueriesData<PaginatedDirectoryResponse>(
        { queryKey: queryKeys.directory.listPrefix },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item: PaginatedDirectoryItem) =>
              item.postcode === postcode
                ? { ...item, isFavorite: !item.isFavorite }
                : item,
            ),
          };
        },
      );

      return { previousQueries };
    },

    onSuccess: (data) => {
      const message =
        data.action === 'added'
          ? 'Postcode added to favorites'
          : 'Postcode removed from favorites';
      toast.success(message);
    },

    onError: (error, _postcode, context) => {
      // Rollback optimistic update
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
      handleError(error, {
        consolePrefix: 'Error toggling favorite',
        fallbackMessage: 'Failed to update favorite',
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.directory.listPrefix });
      queryClient.invalidateQueries({ queryKey: queryKeys.directory.favorites });
    },
  });
};
