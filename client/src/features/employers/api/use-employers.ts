/**
 * Employers React Query Hooks
 *
 * Hooks pour gérer le server state des employeurs
 * Utilise TanStack Query pour cache, refetch, mutations
 * Suit le pattern bulletproof-react state-management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { handleError } from '@/lib/error-handler';
import { queryKeys } from '@/lib/react-query';

import type { Employer, UpdateEmployerInput } from '@get-granted/shared';

import {
  addEmployer,
  deleteEmployer,
  getEmployer,
  getEmployers,
  updateEmployer,
} from './employers';

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
 * Hook pour récupérer un employeur par son ID
 *
 * Features:
 * - Enabled seulement si l'ID est défini
 * - Cache 5 min (staleTime config globale)
 *
 * @example
 * ```tsx
 * function EmployerEditPage({ id }: { id: string }) {
 *   const { data: employer, isLoading, error } = useGetEmployer(id)
 *
 *   if (isLoading) return <Skeleton />
 *   if (error || !employer) return <NotFound />
 *
 *   return <EmployerForm employer={employer} />
 * }
 * ```
 */
export const useGetEmployer = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.employers.detail(id!),
    queryFn: () => getEmployer(id!),
    enabled: !!id,
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

    // Succès: ajoute le nouvel employeur au cache et invalide pour refetch
    onSuccess: (data) => {
      queryClient.setQueryData<Employer[]>(
        queryKeys.employers.all,
        (old = []) => [data, ...old],
      );
      toast.success('Employer added successfully');
    },

    onError: (error) => {
      handleError(error, {
        consolePrefix: 'Error adding employer',
        fallbackMessage: 'Failed to add employer',
      });
    },

    // Toujours invalidate à la fin pour resync avec le serveur
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
    mutationFn: ({ id, input }: { id: string; input: UpdateEmployerInput }) =>
      updateEmployer(id, input),

    // Succès: remplace l'employeur mis à jour dans le cache
    onSuccess: (data) => {
      queryClient.setQueryData<Employer[]>(
        queryKeys.employers.all,
        (old = []) => old.map((emp) => (emp.id === data.id ? data : emp)),
      );
      toast.success('Employer updated successfully');
    },

    onError: (error) => {
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

      const previousEmployers = queryClient.getQueryData<Employer[]>(
        queryKeys.employers.all,
      );

      // Optimistic delete: retire immédiatement de l'UI
      queryClient.setQueryData<Employer[]>(
        queryKeys.employers.all,
        (old = []) => old.filter((emp) => emp.id !== id),
      );

      return { previousEmployers };
    },

    onSuccess: () => {
      toast.success('Employer deleted successfully');
    },

    onError: (error, _, context) => {
      if (context?.previousEmployers) {
        queryClient.setQueryData(
          queryKeys.employers.all,
          context.previousEmployers,
        );
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
