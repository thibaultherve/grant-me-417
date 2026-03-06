import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/react-query';

import { getVisaOverview } from './dashboard';

export const useVisaOverview = (visaId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.visas.overview(visaId ?? ''),
    queryFn: () => getVisaOverview(visaId!),
    enabled: !!visaId,
    staleTime: 5 * 60 * 1000,
  });
};
