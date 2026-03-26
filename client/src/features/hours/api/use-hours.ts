/**
 * Hours React Query Hooks
 *
 * Hooks pour gérer le server state des heures de travail
 * Gère pagination, tri, ajout, suppression
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { WorkEntryWithEmployer } from '@get-granted/shared';

import { handleError } from '@/lib/error-handler';
import { queryKeys } from '@/lib/react-query';

import {
  getEmployerHours,
  getHours,
  getWeeklyHours,
  saveWeekHours,
  type GetHoursOptions,
} from './hours';

/**
 * Hook pour récupérer les heures avec pagination/tri
 *
 * Features:
 * - Cache par page/sort/limit (queries indépendantes)
 * - Placeholder data (garde les anciennes données pendant refetch)
 * - Refetch automatique au window focus
 */
export const useHours = (options: GetHoursOptions = {}) => {
  return useQuery({
    queryKey: queryKeys.hours.list(options),
    queryFn: () => getHours(options),
    placeholderData: (prev) => prev, // Garde les données précédentes pendant le fetch
  });
};

/**
 * Hook pour récupérer toutes les heures d'un employeur
 * Utilisé pour les badges du calendrier
 */
export const useEmployerHours = (employerId: string) => {
  return useQuery({
    queryKey: queryKeys.hours.byEmployer(employerId),
    queryFn: () => getEmployerHours(employerId),
    enabled: !!employerId,
    staleTime: 2 * 60 * 1000, // 2 minutes (données plus volatiles)
  });
};

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
 * Hook for saving week hours with deletion support
 * Handles both upsert (hours > 0) and delete (hours === 0) operations
 *
 * NO TOAST - toast notification is shown in the form component
 * to avoid duplicate notifications
 */
export const useSaveWeekHours = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      employerId: string;
      weekEntries: Array<{ workDate: string; hours: number }>;
    }) => saveWeekHours(params.employerId, params.weekEntries),

    onMutate: async (params) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.hours.byEmployer(params.employerId),
      });

      // Snapshot previous value for rollback
      const previousEmployerHours = queryClient.getQueryData<
        WorkEntryWithEmployer[]
      >(queryKeys.hours.byEmployer(params.employerId));

      // Optimistic update: merge new entries into employer hours cache
      if (previousEmployerHours) {
        const updatedHours = [...previousEmployerHours];

        for (const entry of params.weekEntries) {
          const existingIndex = updatedHours.findIndex(
            (h) =>
              h.workDate === entry.workDate &&
              h.employerId === params.employerId,
          );

          if (entry.hours > 0) {
            if (existingIndex >= 0) {
              // Update existing entry
              updatedHours[existingIndex] = {
                ...updatedHours[existingIndex],
                hours: entry.hours,
              };
            }
            // Don't add new entries optimistically (we don't have full data like id, timestamps)
          } else if (existingIndex >= 0) {
            // Remove entry with 0 hours
            updatedHours.splice(existingIndex, 1);
          }
        }

        queryClient.setQueryData(
          queryKeys.hours.byEmployer(params.employerId),
          updatedHours,
        );
      }

      return { previousEmployerHours };
    },

    onError: (error, params, context) => {
      // Rollback optimistic update
      if (context?.previousEmployerHours) {
        queryClient.setQueryData(
          queryKeys.hours.byEmployer(params.employerId),
          context.previousEmployerHours,
        );
      }

      handleError(error, {
        consolePrefix: 'Error saving week hours',
        fallbackMessage: 'Failed to save week hours',
      });
    },

    onSettled: () => {
      // Always refetch to ensure consistency with server
      queryClient.invalidateQueries({ queryKey: queryKeys.hours.all });
      // Also invalidate visa queries since progress was recalculated
      queryClient.invalidateQueries({ queryKey: queryKeys.visas.all });
    },
  });
};
