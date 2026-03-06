import { api } from '@/lib/api-client';

import type {
  CreateVisaInput,
  UpdateVisaInput,
  Visa,
  VisaType,
  WeeklyProgress,
} from '@get-granted/shared';

export const getVisas = async (): Promise<Visa[]> => {
  return api.get('/visas');
};

export const addVisa = async (input: CreateVisaInput): Promise<Visa> => {
  return api.post('/visas', input);
};

export const deleteVisa = async (id: string): Promise<void> => {
  return api.delete(`/visas/${id}`);
};

export const getVisaByType = async (
  type: VisaType,
): Promise<Visa | null> => {
  try {
    return await api.get(`/visas/${type}`);
  } catch {
    return null;
  }
};

export const updateVisa = async (
  id: string,
  input: UpdateVisaInput,
): Promise<Visa> => {
  return api.patch(`/visas/${id}`, input);
};

export const getVisaWeeklyProgress = async (
  visaId: string,
): Promise<WeeklyProgress[]> => {
  return api.get(`/visas/${visaId}/weekly-progress`);
};
