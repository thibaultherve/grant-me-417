import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/react-query';

import { getEmployers } from './employers';

export const useEmployers = () => {
  return useQuery({
    queryKey: queryKeys.employers.all,
    queryFn: getEmployers,
  });
};
