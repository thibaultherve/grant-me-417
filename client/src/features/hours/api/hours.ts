import { api } from '@/lib/api-client';

import type { SortOptions } from '../types';
import type {
  WorkEntryWithEmployer,
  HoursList,
  WeeklyHoursResponse,
} from '@get-granted/shared';

export type GetHoursOptions = {
  page?: number;
  limit?: number;
  sort?: SortOptions;
};

export const getHours = async ({
  page = 1,
  limit = 10,
  sort = { field: 'workDate', order: 'desc' },
}: GetHoursOptions = {}): Promise<HoursList> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortField: sort.field,
    sortOrder: sort.order,
  });

  return api.get(`/work-entries?${params}`);
};

export const getEmployerHours = async (
  employerId: string,
): Promise<WorkEntryWithEmployer[]> => {
  const params = new URLSearchParams({
    limit: '1000',
    sortField: 'workDate',
    sortOrder: 'desc',
  });

  const response: HoursList = await api.get(`/work-entries?${params}`);
  return response.data.filter((entry) => entry.employerId === employerId);
};

export const saveWeekHours = async (
  employerId: string,
  weekEntries: Array<{ workDate: string; hours: number }>,
) => {
  return api.post('/work-entries/week', {
    employerId,
    entries: weekEntries,
  });
};

export const getWeeklyHours = async (
  year: number,
  month: number,
): Promise<WeeklyHoursResponse> => {
  return api.get(`/work-entries/month/${year}/${month}/weekly`);
};
