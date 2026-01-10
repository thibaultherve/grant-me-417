/**
 * Hours React Query Hooks
 *
 * Hooks pour gérer le server state des heures de travail
 * Gère pagination, tri, ajout, suppression
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/lib/auth';
import { handleError } from '@/lib/error-handler';
import { queryKeys } from '@/lib/react-query';

import {
  getEmployerHours,
  getHours,
  getMonthHours,
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
 * Hook pour récupérer les heures d'un mois pour le calendrier mensuel
 * Groupées par jour avec liste des employeurs
 *
 * @param year - Année (ex: 2025)
 * @param month - Mois (1-12)
 */
export const useMonthHours = (year: number, month: number) => {
  return useQuery({
    queryKey: queryKeys.hours.month(year, month),
    queryFn: () => getMonthHours(year, month),
    staleTime: 2 * 60 * 1000, // 2 minutes (données volatiles)
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      employerId: string;
      weekEntries: Array<{ work_date: string; hours: number }>;
      existingDates: string[];
    }) => {
      if (!user) throw new Error('User not authenticated');

      const result = await saveWeekHours(
        user.id,
        params.employerId,
        params.weekEntries,
        params.existingDates,
      );

      return result;
    },

    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeys.hours.all });
      // NO TOAST HERE - handled in form component to avoid duplicates
    },

    onError: (error) => {
      handleError(error, {
        consolePrefix: 'Error saving week hours',
        fallbackMessage: 'Failed to save week hours',
      });
    },
  });
};
