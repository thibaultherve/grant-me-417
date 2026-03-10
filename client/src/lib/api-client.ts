import Axios, { type InternalAxiosRequestConfig } from 'axios';

import { paths } from '@/config/paths';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('Missing VITE_API_URL environment variable');
}

// --- Token storage ---
// Refresh token is stored as an HttpOnly cookie (set by the server, inaccessible to JS).
// Only the access token is kept in memory.

const IS_LOGGED_IN_KEY = 'auth_logged_in';

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const isLoggedIn = (): boolean =>
  localStorage.getItem(IS_LOGGED_IN_KEY) === 'true';

export const setLoggedIn = (value: boolean) => {
  if (value) {
    localStorage.setItem(IS_LOGGED_IN_KEY, 'true');
  } else {
    localStorage.removeItem(IS_LOGGED_IN_KEY);
  }
};

export const clearAuthStorage = () => {
  localStorage.removeItem(IS_LOGGED_IN_KEY);
  accessToken = null;
};

// --- Axios instance ---

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
  }
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}

export const api = Axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required to send/receive HttpOnly cookies
});

api.interceptors.request.use(authRequestInterceptor);

// --- Token refresh queue ---

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalConfig = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalConfig._retry) {
      if (!isLoggedIn()) {
        clearAuthStorage();
        const redirectTo = window.location.pathname;
        window.location.href = paths.auth.login.getHref(redirectTo);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalConfig.headers.Authorization = `Bearer ${token}`;
          return api(originalConfig);
        });
      }

      originalConfig._retry = true;
      isRefreshing = true;

      try {
        // Refresh token is sent automatically via HttpOnly cookie (withCredentials)
        const { data } = await Axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = data.tokens.accessToken as string;

        setAccessToken(newAccessToken);

        originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        return api(originalConfig);
      } catch (refreshError) {
        clearAuthStorage();
        processQueue(refreshError, null);
        const redirectTo = window.location.pathname;
        window.location.href = paths.auth.login.getHref(redirectTo);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  },
);
