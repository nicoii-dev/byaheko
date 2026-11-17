import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { environment } from '../../config/environment';
import sessionStorage from './session';
import type { ApiAuthResult, ApiEnvelope, ApiErrorBody } from './types';

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api: AxiosInstance = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: environment.requestTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

function isEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'data' in value
  );
}

/**
 * Public auth endpoints must never trigger the refresh-token flow: a 401 from
 * `/auth/login` means "wrong password", not "expired access token".
 */
const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
];

function isPublicAuthRequest(url?: string): boolean {
  return PUBLIC_AUTH_PATHS.some(path => url?.includes(path));
}

let refreshInFlight: Promise<string | null> | null = null;

/**
 * Rotates the token pair once. Concurrent 401s share the same promise so the
 * API does not revoke a refresh token that was already rotated by another
 * request.
 */
function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = rotateTokens().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function rotateTokens(): Promise<string | null> {
  const refreshToken = await sessionStorage.getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    // Use a bare axios call so this request cannot recurse through the
    // interceptors while we are already handling a 401.
    const response = await axios.post<ApiEnvelope<ApiAuthResult>>(
      `${environment.apiBaseUrl}/auth/refresh`,
      { refreshToken },
      {
        timeout: environment.requestTimeoutMs,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    const tokens = response.data?.data?.tokens;
    if (!tokens?.accessToken || !tokens.refreshToken) {
      await sessionStorage.clearTokens();
      return null;
    }

    await sessionStorage.saveTokens(tokens);
    return tokens.accessToken;
  } catch {
    await sessionStorage.clearTokens();
    return null;
  }
}

function extractErrorMessage(error: AxiosError<ApiErrorBody>): string {
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'The request timed out. Please try again.';
  }

  if (error.response) {
    const body = error.response.data;

    if (body) {
      const fieldErrors = body.errors
        ?.map(item => item.message)
        .filter((message): message is string => Boolean(message));

      if (fieldErrors && fieldErrors.length > 0) {
        return fieldErrors.join('\n');
      }

      if (Array.isArray(body.message) && body.message.length > 0) {
        return body.message.join('\n');
      }

      if (typeof body.message === 'string' && body.message.length > 0) {
        return body.message;
      }

      if (typeof body.error === 'string' && body.error.length > 0) {
        return body.error;
      }
    }

    return `Request failed (${error.response.status}).`;
  }

  if (error.request) {
    return 'Network error. Check your internet connection and try again.';
  }

  return 'Something went wrong. Please try again.';
}

api.interceptors.request.use(
  async config => {
    const token = await sessionStorage.getAccessToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  error => Promise.reject(error),
);

api.interceptors.response.use(
  response => {
    // Every byaheko-api success response is wrapped in
    // { success, message, data, meta }. Services consume the payload directly.
    if (isEnvelope(response.data)) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError<ApiErrorBody>) => {
    const config = error.config as RetriableRequestConfig | undefined;
    const status = error.response?.status;
    const publicRequest = isPublicAuthRequest(config?.url);

    if (status === 401 && config && !publicRequest) {
      if (config._retry) {
        await sessionStorage.clearTokens();
        return Promise.reject(
          new Error('Your session has expired. Please sign in again.'),
        );
      }

      const refreshedToken = await refreshAccessToken();

      if (!refreshedToken) {
        return Promise.reject(
          new Error('Your session has expired. Please sign in again.'),
        );
      }

      config._retry = true;
      config.headers.set('Authorization', `Bearer ${refreshedToken}`);
      return api.request(config);
    }

    return Promise.reject(new Error(extractErrorMessage(error)));
  },
);

export default api;
