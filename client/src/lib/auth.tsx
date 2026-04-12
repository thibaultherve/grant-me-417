import type { UserProfile } from '@regranted/shared';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { paths } from '@/config/paths';

import { api, isLoggedIn } from './api-client';
import { queryKeys } from './react-query';

// --- User query (global state, SE6 compliant) ---

const getMe = (): Promise<UserProfile> => api.get('/users/me');

export const useUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: getMe,
    enabled: isLoggedIn(),
    staleTime: Infinity,
    retry: false,
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
