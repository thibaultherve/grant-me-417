import type {
  SaveWeekBatch,
  WeekEntriesResponse,
  WeeklyHoursResponse,
} from '@regranted/shared';

import { api } from '@/lib/api-client';

export const getWeeklyHours = async (
  year: number,
  month: number,
): Promise<WeeklyHoursResponse> => {
  return api.get(`/work-entries/month/${year}/${month}/weekly`);
};

export const getWeekEntries = async (
  weekStart: string,
): Promise<WeekEntriesResponse> => {
  const params = new URLSearchParams({ weekStart });
  return api.get(`/work-entries/week?${params}`);
};

export const saveWeekBatch = async (
  data: SaveWeekBatch,
): Promise<WeekEntriesResponse> => {
  return api.put('/work-entries/week', data);
};
