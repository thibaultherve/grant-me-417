/**
 * Employers React Query Hooks
 *
 * Hooks pour gérer le server state des employeurs
 * Utilise TanStack Query pour cache, refetch, mutations
 * Suit le pattern bulletproof-react state-management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/react-query';
import { handleError } from '@/lib/error-handler';
import {
  getEmployers,
  getEmployer,
  addEmployer,
  updateEmployer,
  deleteEmployer,
} from './employers';
import type { Employer, CreateEmployerInput } from '../types';

/**
 * Hook pour récupérer tous les employeurs
 *
 * Features:
 * - Cache automatique 5 min (staleTime config globale)
 * - Refetch au window focus
 * - Refetch après reconnexion
 *
 * @example
 * ```tsx
 * function EmployersList() {
 *   const { data: employers, isLoading, error } = useEmployers()
 *
 *   if (isLoading) return <Spinner />
 *   if (error) return <ErrorMessage />
 *
 *   return <div>{employers.map(...)}</div>
 * }
 * ```
 */
export const useEmployers = () => {
  return useQuery({
    queryKey: queryKeys.employers.all,
    queryFn: getEmployers,
  });
};

/**
 * Hook pour récupérer un employeur par ID
 */
export const useEmployer = (id: string) => {
  return useQuery({
    queryKey: queryKeys.employers.detail(id),
    queryFn: () => getEmployer(id),
    enabled: !!id, // Ne fetch que si ID existe
  });
};

/**
 * Hook pour ajouter un employeur
 *
 * Features:
 * - Optimistic update (UI instantané)
 * - Rollback automatique en cas d'erreur
 * - Invalidation du cache après succès
 * - Toast notifications
 *
 * @example
 * ```tsx
 * function AddEmployerForm() {
 *   const addMutation = useAddEmployer()
 *
 *   const handleSubmit = (data: CreateEmployerInput) => {
 *     addMutation.mutate(data)
 *   }
 *
 *   return <form onSubmit={handleSubmit}>...</form>
 * }
 * ```
 */
export const useAddEmployer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addEmployer,

    // Optimistic update: met à jour l'UI avant la réponse serveur
    onMutate: async (newEmployer) => {
      // Annule les refetch en cours pour éviter l'écrasement
      await queryClient.cancelQueries({ queryKey: queryKeys.employers.all });

      // Snapshot de l'état actuel (pour rollback si erreur)
      const previousEmployers = queryClient.getQueryData<Employer[]>(queryKeys.employers.all);

      // Optimistic update: ajoute temporairement le nouvel employeur
      queryClient.setQueryData<Employer[]>(queryKeys.employers.all, (old = []) => [
        { ...newEmployer, id: 'temp-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), user_id: 'temp-user-id' } as Employer,
        ...old,
      ]);

      return { previousEmployers };
    },

    // Succès: remplace l'employeur temporaire par le vrai (avec ID du serveur)
    onSuccess: (data) => {
      queryClient.setQueryData<Employer[]>(queryKeys.employers.all, (old = []) =>
        old.map((emp) => (emp.id === 'temp-id' ? data : emp))
      );
      toast.success('Employer added successfully');
    },

    // Erreur: rollback vers l'état précédent
    onError: (error, _, context) => {
      if (context?.previousEmployers) {
        queryClient.setQueryData(queryKeys.employers.all, context.previousEmployers);
      }
      handleError(error, {
        consolePrefix: 'Error adding employer',
        fallbackMessage: 'Failed to add employer',
      });
    },

    // Toujours invalidate à la fin (succès ou erreur) pour resync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employers.all });
    },
  });
};

/**
 * Hook pour mettre à jour un employeur
 */
export const useUpdateEmployer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateEmployerInput }) =>
      updateEmployer(id, input),

    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employers.all });

      const previousEmployers = queryClient.getQueryData<Employer[]>(queryKeys.employers.all);

      // Optimistic update
      queryClient.setQueryData<Employer[]>(queryKeys.employers.all, (old = []) =>
        old.map((emp) =>
          emp.id === id
            ? { ...emp, ...input, updated_at: new Date().toISOString() }
            : emp
        )
      );

      return { previousEmployers };
    },

    onSuccess: (data) => {
      queryClient.setQueryData<Employer[]>(queryKeys.employers.all, (old = []) =>
        old.map((emp) => (emp.id === data.id ? data : emp))
      );
      toast.success('Employer updated successfully');
    },

    onError: (error, _, context) => {
      if (context?.previousEmployers) {
        queryClient.setQueryData(queryKeys.employers.all, context.previousEmployers);
      }
      handleError(error, {
        consolePrefix: 'Error updating employer',
        fallbackMessage: 'Failed to update employer',
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employers.all });
    },
  });
};

/**
 * Hook pour supprimer un employeur
 */
export const useDeleteEmployer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmployer,

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employers.all });

      const previousEmployers = queryClient.getQueryData<Employer[]>(queryKeys.employers.all);

      // Optimistic delete: retire immédiatement de l'UI
      queryClient.setQueryData<Employer[]>(queryKeys.employers.all, (old = []) =>
        old.filter((emp) => emp.id !== id)
      );

      return { previousEmployers };
    },

    onSuccess: () => {
      toast.success('Employer deleted successfully');
    },

    onError: (error, _, context) => {
      if (context?.previousEmployers) {
        queryClient.setQueryData(queryKeys.employers.all, context.previousEmployers);
      }
      handleError(error, {
        consolePrefix: 'Error deleting employer',
        fallbackMessage: 'Failed to delete employer',
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employers.all });
    },
  });
};
