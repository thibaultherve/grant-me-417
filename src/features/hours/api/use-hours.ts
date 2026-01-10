/**
 * Hours React Query Hooks
 *
 * Hooks pour gérer le server state des heures de travail
 * Gère pagination, tri, ajout, suppression
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { useAuth } from '@/lib/auth';
import { handleError } from '@/lib/error-handler';
import { queryKeys } from '@/lib/react-query';

import type {
  WorkEntryInput,
  WeekWorkEntryInput,
  MultipleWorkEntriesFormData,
  WeekWorkEntryFormData,
} from '../schemas';
import { getSelectedWeekDates } from '../utils/date-helpers';

import {
  getHours,
  getEmployerHours,
  checkExistingEntries,
  addWorkEntries,
  addWorkEntriesWithOverwrite,
  addWeekWorkEntries,
  addWeekWorkEntriesWithOverwrite,
  deleteWorkEntry,
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
 * Hook pour ajouter des heures (mode By Day)
 *
 * Logique complexe:
 * 1. Vérifie si des entrées existent déjà
 * 2. Si oui, retourne requiresConfirmation
 * 3. Sinon, insère directement
 */
export const useAddWorkEntries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: MultipleWorkEntriesFormData) => {
      if (!user) throw new Error('User not authenticated');

      // S'assurer que les dates sont des strings au format YYYY-MM-DD
      const dates = formData.entries.map((e) => {
        const workDate = e.work_date as unknown;
        // Si c'est un Date object, le formater
        if (workDate instanceof Date) {
          return format(workDate, 'yyyy-MM-dd');
        }
        // Si c'est une string avec timezone, nettoyer
        if (typeof workDate === 'string' && workDate.includes('GMT')) {
          return format(new Date(workDate), 'yyyy-MM-dd');
        }
        // Sinon c'est déjà au bon format
        return e.work_date;
      });
      const existingEntries = await checkExistingEntries(
        formData.employer_id,
        dates,
      );

      // Si des entrées existent, demander confirmation
      if (existingEntries.length > 0) {
        const newHoursMap = new Map(
          formData.entries.map((e) => [
            e.work_date,
            parseFloat(String(e.hours_worked)),
          ]),
        );

        return {
          success: false,
          requiresConfirmation: true,
          existingDates: existingEntries.map((e) => e.work_date),
          existingEntries: existingEntries.map((e) => ({
            work_date: e.work_date,
            oldHours: e.hours,
            newHours: newHoursMap.get(e.work_date) || 0,
          })),
        };
      }

      // Pas de conflit, insérer directement
      const entries: WorkEntryInput[] = formData.entries.map((e) => ({
        work_date: e.work_date,
        hours: parseFloat(String(e.hours_worked)),
      }));

      const data = await addWorkEntries(user.id, formData.employer_id, entries);

      return {
        success: true,
        data,
      };
    },

    onSuccess: (result) => {
      if (result.success) {
        // Invalide toutes les queries hours pour refetch
        queryClient.invalidateQueries({ queryKey: queryKeys.hours.all });

        const count = result.data?.length || 0;
        toast.success(
          `Successfully added ${count} work ${count === 1 ? 'entry' : 'entries'}`,
        );
      }
    },

    onError: (error) => {
      handleError(error, {
        consolePrefix: 'Error adding work entries',
        fallbackMessage: 'Failed to add work entries',
      });
    },
  });
};

/**
 * Hook pour ajouter des heures avec overwrite forcé
 */
export const useAddWorkEntriesWithOverwrite = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: MultipleWorkEntriesFormData) => {
      if (!user) throw new Error('User not authenticated');

      const entries: WorkEntryInput[] = formData.entries.map((e) => ({
        work_date: e.work_date,
        hours: parseFloat(String(e.hours_worked)),
      }));

      const data = await addWorkEntriesWithOverwrite(
        user.id,
        formData.employer_id,
        entries,
      );

      return { success: true, data };
    },

    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeys.hours.all });
      // Toast removed - shown in form component to avoid duplicate notifications
    },

    onError: (error) => {
      handleError(error, {
        consolePrefix: 'Error updating work entries',
        fallbackMessage: 'Failed to update work entries',
      });
    },
  });
};

/**
 * Hook pour ajouter des heures (mode By Week)
 */
export const useAddWeekWorkEntries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: WeekWorkEntryFormData) => {
      if (!user) throw new Error('User not authenticated');

      // Calculer les dates de la semaine au format YYYY-MM-DD
      const weekDates = getSelectedWeekDates(
        formData.week_date,
        formData.days_included,
      );

      // Vérifier les entrées existantes
      const existingEntries = await checkExistingEntries(
        formData.employer_id,
        weekDates,
      );

      if (existingEntries.length > 0) {
        const hoursPerDay = Number(formData.total_weekly_hours) / weekDates.length;
        const roundedHoursPerDay = Math.round(hoursPerDay * 100) / 100;

        return {
          success: false,
          requiresConfirmation: true,
          existingDates: existingEntries.map((e) => e.work_date),
          existingEntries: existingEntries.map((e) => ({
            work_date: e.work_date,
            oldHours: e.hours,
            newHours: roundedHoursPerDay,
          })),
        };
      }

      // Pas de conflit, insérer
      const weekData: WeekWorkEntryInput = {
        week_date: formData.week_date,
        total_weekly_hours: Number(formData.total_weekly_hours),
        days_included: formData.days_included,
      };

      const data = await addWeekWorkEntries(
        user.id,
        formData.employer_id,
        weekData,
      );

      return { success: true, data };
    },

    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.hours.all });

        const count = result.data?.length || 0;
        toast.success(
          `Successfully added ${count} work ${count === 1 ? 'entry' : 'entries'}`,
        );
      }
    },

    onError: (error) => {
      handleError(error, {
        consolePrefix: 'Error adding week work entries',
        fallbackMessage: 'Failed to add week work entries',
      });
    },
  });
};

/**
 * Hook pour ajouter des heures (mode By Week) avec overwrite
 */
export const useAddWeekWorkEntriesWithOverwrite = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: WeekWorkEntryFormData) => {
      if (!user) throw new Error('User not authenticated');

      const weekData: WeekWorkEntryInput = {
        week_date: formData.week_date,
        total_weekly_hours: Number(formData.total_weekly_hours),
        days_included: formData.days_included,
      };

      const data = await addWeekWorkEntriesWithOverwrite(
        user.id,
        formData.employer_id,
        weekData,
      );

      return { success: true, data };
    },

    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hours.all });

      const count = result.data?.length || 0;
      toast.success(
        `Successfully updated ${count} work ${count === 1 ? 'entry' : 'entries'}`,
      );
    },

    onError: (error) => {
      handleError(error, {
        consolePrefix: 'Error updating week work entries',
        fallbackMessage: 'Failed to update week work entries',
      });
    },
  });
};

/**
 * Hook pour supprimer une entrée d'heures
 */
export const useDeleteWorkEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkEntry,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hours.all });
      toast.success('Work entry deleted successfully');
    },

    onError: (error) => {
      handleError(error, {
        consolePrefix: 'Error deleting work entry',
        fallbackMessage: 'Failed to delete work entry',
      });
    },
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
