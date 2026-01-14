/**
 * Visas React Query Hooks
 *
 * Hooks pour gérer le server state des visas WHV
 * Utilise TanStack Query pour cache, refetch, mutations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/lib/auth';
import { handleError } from '@/lib/error-handler';
import { queryKeys } from '@/lib/react-query';

import type { CreateVisaInput, UserVisa } from '../types';

import { addVisa, deleteVisa, getVisas, getVisaWeeklyProgress } from './visas';

/**
 * Hook pour récupérer tous les visas
 */
export const useVisas = () => {
  return useQuery({
    queryKey: queryKeys.visas.all,
    queryFn: getVisas,
    staleTime: 10 * 60 * 1000, // 10 minutes (données stables)
  });
};

/**
 * Hook pour ajouter un visa
 */
export const useAddVisa = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVisaInput) => {
      if (!user) throw new Error('User not authenticated');
      return addVisa(user.id, input);
    },

    onMutate: async (newVisa) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.visas.all });

      const previousVisas = queryClient.getQueryData<UserVisa[]>(
        queryKeys.visas.all,
      );

      // Optimistic update
      queryClient.setQueryData<UserVisa[]>(queryKeys.visas.all, (old = []) => [
        ...old,
        {
          ...newVisa,
          id: 'temp-id',
          user_id: 'temp-user-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Les champs calculés seront mis à jour par le serveur
          eligible_days: 0,
          days_worked: 0,
          days_required: newVisa.days_required || 88,
          days_remaining: newVisa.days_required || 88,
          progress_percentage: 0,
          is_eligible: false,
          expiry_date: new Date(
            new Date(newVisa.arrival_date).getFullYear() + 1,
            new Date(newVisa.arrival_date).getMonth(),
            new Date(newVisa.arrival_date).getDate() - 1,
          ).toISOString(),
        } as UserVisa,
      ]);

      return { previousVisas };
    },

    onSuccess: (data) => {
      queryClient.setQueryData<UserVisa[]>(queryKeys.visas.all, (old = []) =>
        old.map((visa) => (visa.id === 'temp-id' ? data : visa)),
      );
      toast.success('Visa added successfully');
    },

    onError: (error, _, context) => {
      if (context?.previousVisas) {
        queryClient.setQueryData(queryKeys.visas.all, context.previousVisas);
      }
      handleError(error, {
        consolePrefix: 'Error adding visa',
        fallbackMessage: 'Failed to add visa',
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visas.all });
    },
  });
};

/**
 * Hook pour supprimer un visa
 */
export const useDeleteVisa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVisa,

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.visas.all });

      const previousVisas = queryClient.getQueryData<UserVisa[]>(
        queryKeys.visas.all,
      );

      // Optimistic delete
      queryClient.setQueryData<UserVisa[]>(queryKeys.visas.all, (old = []) =>
        old.filter((visa) => visa.id !== id),
      );

      return { previousVisas };
    },

    onSuccess: () => {
      toast.success('Visa deleted successfully');
    },

    onError: (error, _, context) => {
      if (context?.previousVisas) {
        queryClient.setQueryData(queryKeys.visas.all, context.previousVisas);
      }
      handleError(error, {
        consolePrefix: 'Error deleting visa',
        fallbackMessage: 'Failed to delete visa',
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visas.all });
    },
  });
};

/**
 * Hook pour récupérer les progrès hebdomadaires d'un visa
 */
export const useVisaWeeklyProgress = (visaId: string) => {
  return useQuery({
    queryKey: queryKeys.visas.weeklyProgress(visaId),
    queryFn: () => getVisaWeeklyProgress(visaId),
    enabled: !!visaId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
