import { api } from '@/lib/api-client';

import type { VisaOverview } from '@regranted/shared';

export const getVisaOverview = async (visaId: string): Promise<VisaOverview> => {
  return api.get(`/visas/${visaId}/overview`);
};
