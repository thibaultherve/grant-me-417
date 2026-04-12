import type { Employer } from '@regranted/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { handleError } from '@/lib/error-handler';
import { queryKeys } from '@/lib/react-query';

import { deleteEmployer } from './employers';

export const useDeleteEmployer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmployer,

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employers.all });

      const previousEmployers = queryClient.getQueryData<Employer[]>(
        queryKeys.employers.all,
      );

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
      queryClient.invalidateQueries({ queryKey: queryKeys.visas.all });
    },
  });
};
