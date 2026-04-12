import type { Employer, UpdateEmployerInput } from '@regranted/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { handleError } from '@/lib/error-handler';
import { queryKeys } from '@/lib/react-query';

import { updateEmployer } from './employers';

export const useUpdateEmployer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEmployerInput }) =>
      updateEmployer(id, input),

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

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employers.all });
      if (
        variables.input.industry !== undefined ||
        variables.input.isEligible !== undefined
      ) {
        queryClient.invalidateQueries({ queryKey: queryKeys.visas.all });
      }
    },
  });
};
