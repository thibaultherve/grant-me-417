import type {
  CheckEligibilityInput,
  CheckEligibilityOutput,
} from '@regranted/shared';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/react-query';

import { checkEmployerEligibility } from './employers';

export const useCheckEligibility = (
  suburbId: string | undefined,
  industry: string | undefined,
) => {
  return useQuery<CheckEligibilityOutput>({
    queryKey: queryKeys.employers.eligibility(suburbId!, industry!),
    queryFn: () =>
      checkEmployerEligibility({
        suburbId: Number(suburbId!),
        industry: industry! as CheckEligibilityInput['industry'],
      }),
    enabled: !!suburbId && !!industry,
    staleTime: Infinity,
  });
};
