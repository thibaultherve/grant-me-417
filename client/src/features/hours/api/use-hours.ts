/**
 * Hours React Query Hooks
 *
 * Hooks pour gérer le server state des heures de travail
 * Gère pagination, tri, ajout, suppression
 */

import type { SaveWeekBatch, WeekEntriesResponse } from '@regranted/shared';
import type { Visa } from '@regranted/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { handleError } from '@/lib/error-handler';
import { queryKeys } from '@/lib/react-query';

import { getWeekEntries, getWeeklyHours, saveWeekBatch } from './hours';

/**
 * Hook to fetch user's visas (used by weekly calendar to display visa context).
 * Defined here to avoid cross-feature import from visas feature.
 */
export const useVisas = () => {
  return useQuery({
    queryKey: queryKeys.visas.all,
    queryFn: (): Promise<Visa[]> => api.get('/visas'),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook pour récupérer les heures avec pagination/tri
 *
 * Features:
 * - Cache par page/sort/limit (queries indépendantes)
 * - Placeholder data (garde les anciennes données pendant refetch)
 * - Refetch automatique au window focus
 */
/**
 * Hook pour récupérer les heures hebdomadaires d'un mois
 * Données groupées par semaine avec breakdown employeur et visa
 *
 * @param year - Année (ex: 2026)
 * @param month - Mois (1-12)
 */
export const useWeeklyHours = (year: number, month: number) => {
  return useQuery({
    queryKey: queryKeys.hours.weekly(year, month),
    queryFn: () => getWeeklyHours(year, month),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for fetching all employers' hours for a specific week.
 * Returns all employers (even with 0 hours) for the multi-employer dashboard.
 */
export const useWeekEntries = (weekStart: string) => {
  return useQuery({
    queryKey: queryKeys.hours.week(weekStart),
    queryFn: () => getWeekEntries(weekStart),
    enabled: !!weekStart,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (prev) => prev,
  });
};

/**
 * Hook for batch saving all employers' hours for a week.
 * Uses PUT /work-entries/week with cross-employer validation.
 *
 * NO TOAST - toast notification is shown in the page component
 * to avoid duplicate notifications.
 */
export const useSaveWeekBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveWeekBatch) => saveWeekBatch(data),

    onMutate: async (data) => {
      // Cancel outgoing week query to avoid overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.hours.week(data.weekStart),
      });

      // Snapshot for rollback
      const previousWeekEntries = queryClient.getQueryData<WeekEntriesResponse>(
        queryKeys.hours.week(data.weekStart),
      );

      return { previousWeekEntries };
    },

    onError: (error, data, context) => {
      // Rollback optimistic update
      if (context?.previousWeekEntries) {
        queryClient.setQueryData(
          queryKeys.hours.week(data.weekStart),
          context.previousWeekEntries,
        );
      }

      handleError(error, {
        consolePrefix: 'Error saving week batch',
        fallbackMessage: 'Failed to save hours',
      });
    },

    onSettled: () => {
      // Refetch all hours-related queries for consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.hours.all });
      // Also invalidate visa queries since progress was recalculated
      queryClient.invalidateQueries({ queryKey: queryKeys.visas.all });
    },
  });
};
