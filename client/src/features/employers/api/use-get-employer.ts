import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/react-query';

import { getEmployer } from './employers';

export const useGetEmployer = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.employers.detail(id!),
    queryFn: () => getEmployer(id!),
    enabled: !!id,
  });
};
