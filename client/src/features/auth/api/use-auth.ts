import type { AuthUser } from '@regranted/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  clearAuthStorage,
  setAccessToken,
  setLoggedIn,
} from '@/lib/api-client';
import { queryKeys } from '@/lib/react-query';

import { loginUser, logoutUser, registerUser } from './auth';

function handleAuthResponse(data: {
  user: AuthUser;
  tokens: { accessToken: string };
}) {
  setAccessToken(data.tokens.accessToken);
  setLoggedIn(true);
  return data.user;
}

export const useLogin = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const user = handleAuthResponse(data);
      queryClient.setQueryData(queryKeys.auth.user, user);
      onSuccess?.();
    },
  });
};

export const useRegister = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      const user = handleAuthResponse(data);
      queryClient.setQueryData(queryKeys.auth.user, user);
      onSuccess?.();
    },
  });
};

export const useLogout = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      clearAuthStorage();
      queryClient.clear();
      onSuccess?.();
    },
  });
};
