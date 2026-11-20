import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { environment } from '../../config/environment';
import { MESSAGES } from '../../config/messages';
import { getStatusMessage } from '../../utils/errors';
import sessionStorage from './session';
import {
  logApiError,
  logApiRequest,
  logApiResponse,
} from './log';
import type {
  ApiAuthResult,
  ApiEnvelope,
  ApiErrorBody,
  PaginationMeta,
} from './types';

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  /** Used to report request duration in the response/error logs. */
  _startTime?: number;
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

  const startedAt = Date.now();
  const refreshUrl = `${environment.apiBaseUrl}/auth/refresh`;
  logApiRequest({
    method: 'post',
    url: refreshUrl,
    data: { refreshToken },
  });

  try {
    // Use a bare axios call so this request cannot recurse through the
    // interceptors while we are already handling a 401.
    const response = await axios.post<ApiEnvelope<ApiAuthResult>>(
      refreshUrl,
      { refreshToken },
      {
        timeout: environment.requestTimeoutMs,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    logApiResponse({
      method: 'post',
      url: refreshUrl,
      status: response.status,
      durationMs: Date.now() - startedAt,
      data: response.data,
    });

    const tokens = response.data?.data?.tokens;
    if (!tokens?.accessToken || !tokens.refreshToken) {
      await sessionStorage.clearTokens();
      return null;
    }

    await sessionStorage.saveTokens(tokens);
    return tokens.accessToken;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    logApiError({
      method: 'post',
      url: refreshUrl,
      status: axiosError.response?.status,
      code: axiosError.code,
      message: axiosError.message,
      durationMs: Date.now() - startedAt,
      data: axiosError.response?.data,
    });
    await sessionStorage.clearTokens();
    return null;
  }
}

function extractErrorMessage(error: AxiosError<ApiErrorBody>): string {
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return MESSAGES.timeout;
  }

  if (error.response) {
    const { status, data: body } = error.response;

    // Server errors rarely carry copy that is safe to show to a user.
    if (status >= 500) {
      return MESSAGES.serverError;
    }

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

    return getStatusMessage(status) ?? MESSAGES.genericError;
  }

  if (error.request) {
    return MESSAGES.offline;
  }

  return MESSAGES.genericError;
}

api.interceptors.request.use(
  async requestConfig => {
    const config = requestConfig as RetriableRequestConfig;
    config._startTime = Date.now();
    logApiRequest(config);
    const token = await sessionStorage.getAccessToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  error => {
    logApiError({
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      url: error.config?.url,
      message: error.message,
      durationMs: 0,
    });
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  response => {
    const config = response.config as RetriableRequestConfig;
    // Log the raw envelope before services unwrap it.
    logApiResponse({
      method: config.method,
      baseURL: config.baseURL,
      url: config.url,
      params: config.params,
      status: response.status,
      durationMs:
        config._startTime !== undefined
          ? Date.now() - config._startTime
          : 0,
      data: response.data,
    });

    // Every byaheko-api success response is wrapped in
    // { success, message, data, meta }. Services consume the payload directly,
    // while paginated helpers read the preserved pagination metadata.
    if (isEnvelope(response.data)) {
      const meta = response.data.meta ?? null;
      response.data = response.data.data;
      (response as typeof response & { meta?: PaginationMeta | null }).meta =
        meta;
    }
    return response;
  },
  async (error: AxiosError<ApiErrorBody>) => {
    const config = error.config as RetriableRequestConfig | undefined;
    const status = error.response?.status;
    const publicRequest = isPublicAuthRequest(config?.url);

    logApiError({
      method: config?.method,
      baseURL: config?.baseURL,
      url: config?.url,
      params: config?.params,
      status,
      code: error.code,
      message: error.message,
      durationMs:
        config?._startTime !== undefined
          ? Date.now() - config._startTime
          : 0,
      data: error.response?.data ?? error.request ?? undefined,
    });

    if (status === 401 && config && !publicRequest) {
      if (config._retry) {
        await sessionStorage.clearTokens();
        return Promise.reject(new Error(MESSAGES.sessionExpired));
      }

      const refreshedToken = await refreshAccessToken();

      if (!refreshedToken) {
        return Promise.reject(new Error(MESSAGES.sessionExpired));
      }

      config._retry = true;
      config.headers.set('Authorization', `Bearer ${refreshedToken}`);
      return api.request(config);
    }

    return Promise.reject(new Error(extractErrorMessage(error)));
  },
);

export default api;
