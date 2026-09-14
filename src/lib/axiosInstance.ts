/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_CONFIG } from '@/config/api-config';
import { useAuthUIStore } from '@/stores/auth-ui.store';
import { CustomAxiosRequestConfig } from '@/types/api';
import { getClientDeviceHeaders } from '@/lib/client-device';
import { encodeHeaderValueForHttp } from '@/lib/http-header-value';
import { getLocale } from '@/utils/helper';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { APP_SCOPE_ADMIN, X_APP_SCOPE } from '@/lib/api-scope';
import { notifySessionExpired } from './session-events';
import { resetAccessTokenRefreshState, resolveFreshAccessToken } from './access-token';
import { isSessionExpired, markSessionExpired, resetSessionExpiredFlag } from './session-state';

export { isSessionExpired } from './session-state';

let isRefreshing = false;
let refreshQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

export function resetSessionExpired() {
  resetSessionExpiredFlag();
  isRefreshing = false;
  resetAccessTokenRefreshState();
}

export async function forceLogoutDueToExpiredSession() {
  if (isSessionExpired()) return;
  markSessionExpired();
  isRefreshing = false;
  refreshQueue.forEach((p) => p.reject(new Error('Session expired')));
  refreshQueue = [];
  resetAccessTokenRefreshState();
  useAuthUIStore.getState().setAccessToken(null);
  await notifySessionExpired();
}

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    if (isSessionExpired()) {
      return Promise.reject(new axios.CanceledError('Session expired - request aborted'));
    }
    const accessToken = useAuthUIStore.getState().accessToken;
    const locale = getLocale();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    config.headers['x-locale'] = locale;

    config.headers[X_APP_SCOPE] = APP_SCOPE_ADMIN;

    const device = getClientDeviceHeaders();
    config.headers['x-device-id'] = encodeHeaderValueForHttp(device['x-device-id']);
    config.headers['x-device-name'] = encodeHeaderValueForHttp(device['x-device-name']);
    config.headers['x-location'] = encodeHeaderValueForHttp(device['x-location']);

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (isSessionExpired()) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token: string) => {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await resolveFreshAccessToken();

        if (!newToken) {
          await forceLogoutDueToExpiredSession();
          return Promise.reject(error);
        }

        refreshQueue.forEach((p) => p.resolve(newToken));
        refreshQueue = [];

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest as AxiosRequestConfig);
      } catch (err) {
        await forceLogoutDueToExpiredSession();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
