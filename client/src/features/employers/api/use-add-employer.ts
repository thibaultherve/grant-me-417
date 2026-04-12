import type { Employer } from '@regranted/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { handleError } from '@/lib/error-handler';
import { queryKeys } from '@/lib/react-query';

import { addEmployer } from './employers';

export const useAddEmployer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addEmployer,

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

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employers.all });
    },
  });
};
