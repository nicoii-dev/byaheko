import axios, { AxiosError, AxiosInstance } from 'axios';
import { environment } from '../../config/environment';
import { STORAGE_KEYS } from '../../config/constants';
import { storage } from '../storage';

const api: AxiosInstance = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: environment.requestTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  async config => {
    const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

api.interceptors.response.use(
  response => response,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(
        new Error('The request timed out. Please try again.'),
      );
    }

    if (error.response) {
      if (error.response.status === 401) {
        await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        await storage.removeItem(STORAGE_KEYS.USER_DATA);
      }
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        `Request failed (${error.response.status}).`;
      return Promise.reject(new Error(message));
    }

    if (error.request) {
      return Promise.reject(
        new Error(
          'Network error. Check your internet connection and try again.',
        ),
      );
    }

    return Promise.reject(error);
  },
);

export default api;
