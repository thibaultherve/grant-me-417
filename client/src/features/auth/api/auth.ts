import type {
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
} from '@regranted/shared';

import { api } from '@/lib/api-client';

export const loginUser = (data: LoginInput): Promise<LoginResponse> =>
  api.post('/auth/login', data);

export const registerUser = (data: RegisterInput): Promise<RegisterResponse> =>
  api.post('/auth/register', data);

export const logoutUser = (): Promise<void> => api.post('/auth/logout', {});
