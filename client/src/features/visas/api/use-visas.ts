import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  computeExpiryDate,
  getDaysRequired,
} from '@regranted/shared';

import { handleError } from '@/lib/error-handler';
import { queryKeys } from '@/lib/react-query';

import type { CreateVisaInput, UpdateVisaInput, Visa, VisaType } from '@regranted/shared';

import {
  addVisa,
  deleteVisa,
  getVisaByType,
  getVisas,
  getVisaWeeklyProgress,
  updateVisa,
} from './visas';

export const useVisas = () => {
  return useQuery({
    queryKey: queryKeys.visas.all,
    queryFn: getVisas,
    staleTime: 10 * 60 * 1000,
  });
};

export const useAddVisa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVisaInput) => addVisa(input),

    onMutate: async (newVisa) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.visas.all });

      const previousVisas = queryClient.getQueryData<Visa[]>(
        queryKeys.visas.all,
      );

      const daysRequired = getDaysRequired(newVisa.visaType);

      queryClient.setQueryData<Visa[]>(queryKeys.visas.all, (old = []) => [
        ...old,
        {
          ...newVisa,
          id: 'temp-id',
          userId: 'temp-user-id',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          eligibleDays: 0,
          daysWorked: 0,
          daysRequired,
          daysRemaining: daysRequired,
          progressPercentage: 0,
          isEligible: false,
          expiryDate: computeExpiryDate(newVisa.arrivalDate).toISOString(),
        } as Visa,
      ]);

      return { previousVisas };
    },

    onSuccess: (data) => {
      queryClient.setQueryData<Visa[]>(queryKeys.visas.all, (old = []) =>
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

export const useDeleteVisa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVisa,

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.visas.all });

      const previousVisas = queryClient.getQueryData<Visa[]>(
        queryKeys.visas.all,
      );

      queryClient.setQueryData<Visa[]>(queryKeys.visas.all, (old = []) =>
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

export const useGetVisaByType = (type: VisaType | null) => {
  return useQuery({
    queryKey: queryKeys.visas.byType(type || ''),
    queryFn: () => getVisaByType(type!),
    enabled: !!type,
    staleTime: 10 * 60 * 1000,
  });
};

export const useUpdateVisa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVisaInput }) =>
      updateVisa(id, input),

    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.visas.all });

      const previousVisas = queryClient.getQueryData<Visa[]>(
        queryKeys.visas.all,
      );

      queryClient.setQueryData<Visa[]>(queryKeys.visas.all, (old = []) =>
        old.map((visa) =>
          visa.id === id
            ? {
                ...visa,
                arrivalDate: input.arrivalDate,
                expiryDate: computeExpiryDate(input.arrivalDate).toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : visa,
        ),
      );

      return { previousVisas };
    },

    onSuccess: () => {
      toast.success('Visa updated successfully');
    },

    onError: (error, _, context) => {
      if (context?.previousVisas) {
        queryClient.setQueryData(queryKeys.visas.all, context.previousVisas);
      }
      handleError(error, {
        consolePrefix: 'Error updating visa',
        fallbackMessage: 'Failed to update visa',
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visas.all });
    },
  });
};

export const useVisaWeeklyProgress = (visaId: string) => {
  return useQuery({
    queryKey: queryKeys.visas.weeklyProgress(visaId),
    queryFn: () => getVisaWeeklyProgress(visaId),
    enabled: !!visaId,
    staleTime: 5 * 60 * 1000,
  });
};
