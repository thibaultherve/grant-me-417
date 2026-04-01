import type { VisaOverview } from '@regranted/shared';

import { api } from '@/lib/api-client';

export const getVisaOverview = async (
  visaId: string,
): Promise<VisaOverview> => {
  return api.get(`/visas/${visaId}/overview`);
};
