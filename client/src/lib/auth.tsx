import type {
  AuthUser,
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
  UserProfile,
} from '@regranted/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { paths } from '@/config/paths';

import {
  api,
  clearAuthStorage,
  isLoggedIn,
  setAccessToken,
  setLoggedIn,
} from './api-client';

// --- Auth API functions ---

const authApi = {
  getMe: (): Promise<UserProfile> => api.get('/users/me'),
  login: (data: LoginInput): Promise<LoginResponse> =>
    api.post('/auth/login', data),
  register: (data: RegisterInput): Promise<RegisterResponse> =>
    api.post('/auth/register', data),
  logout: (): Promise<void> => api.post('/auth/logout', {}),
};

// --- Query key ---

const userQueryKey = ['authenticated-user'];

// --- Auth hooks ---

function handleAuthResponse(data: {
  user: AuthUser;
  tokens: { accessToken: string };
}) {
  setAccessToken(data.tokens.accessToken);
  setLoggedIn(true);
  return data.user;
}

export const useUser = () => {
  return useQuery({
    queryKey: userQueryKey,
    queryFn: () => authApi.getMe(),
    enabled: isLoggedIn(),
    staleTime: Infinity,
    retry: false,
  });
};

export const useLogin = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      const user = handleAuthResponse(data);
      queryClient.setQueryData(userQueryKey, user);
      onSuccess?.();
    },
  });
};

export const useRegister = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      const user = handleAuthResponse(data);
      queryClient.setQueryData(userQueryKey, user);
      onSuccess?.();
    },
  });
};

export const useLogout = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuthStorage();
      queryClient.clear();
      onSuccess?.();
    },
  });
};

// --- Protected Route ---

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { data: user, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate to={paths.auth.login.getHref(location.pathname)} replace />
    );
  }

  return children;
};
