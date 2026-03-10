import { api } from '@/lib/api-client';

import type {
  CheckEligibilityInput,
  CheckEligibilityOutput,
  CreateEmployerInput,
  Employer,
  UpdateEmployerInput,
} from '@get-granted/shared';

export const getEmployers = async (): Promise<Employer[]> => {
  return api.get('/employers');
};

export const addEmployer = async (
  input: CreateEmployerInput,
): Promise<Employer> => {
  return api.post('/employers', input);
};

export const updateEmployer = async (
  id: string,
  input: UpdateEmployerInput,
): Promise<Employer> => {
  return api.patch(`/employers/${id}`, input);
};

export const deleteEmployer = async (id: string): Promise<void> => {
  return api.delete(`/employers/${id}`);
};

export const getEmployer = async (id: string): Promise<Employer | null> => {
  try {
    return await api.get(`/employers/${id}`);
  } catch {
    return null;
  }
};

export const checkEmployerEligibility = async (
  input: CheckEligibilityInput,
): Promise<CheckEligibilityOutput> => {
  return api.post('/employers/eligibilityCheck', input);
};
