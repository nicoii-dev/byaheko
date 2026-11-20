/**
 * Lightweight API request logging for debugging.
 *
 * All calls made through the shared `api` axios instance are logged by its
 * interceptors. Calls that bypass the instance (token refresh, Photon
 * geocoding) log through these helpers explicitly.
 *
 * Sensitive fields (passwords, tokens, authorization headers) are redacted so
 * logs are safe to share. Set `BYAHEKO_DISABLE_API_LOGS=true` to silence them.
 */

const PREFIX = '[ByaheKo API]';
const REDACTED = '[REDACTED]';
const SENSITIVE_KEY = /password|token|secret|authorization|credential/i;

const runtimeEnv = (
  globalThis as {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env;

export const apiLogsEnabled =
  runtimeEnv?.BYAHEKO_DISABLE_API_LOGS !== 'true';

/** Recursively redacts sensitive keys from request/response payloads. */
export const sanitizeForLog = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sanitizeForLog);
  }
  if (value && typeof value === 'object') {
    if (value instanceof Date) {
      return value.toISOString();
    }
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = SENSITIVE_KEY.test(key) ? REDACTED : sanitizeForLog(item);
    }
    return result;
  }
  return value;
};

const resolveUrl = (baseURL: string | undefined, url: string): string => {
  if (!url.startsWith('http')) {
    return `${baseURL ?? ''}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return url;
};

export interface ApiLogRequest {
  method?: string;
  baseURL?: string;
  url?: string;
  params?: unknown;
  data?: unknown;
}

export const logApiRequest = (config: ApiLogRequest): void => {
  if (!apiLogsEnabled) {
    return;
  }
  const method = (config.method ?? 'get').toUpperCase();
  const url = resolveUrl(config.baseURL, config.url ?? '');
  const details = {
    ...(config.params !== undefined ? { params: config.params } : {}),
    ...(config.data !== undefined ? { body: config.data } : {}),
  };
  console.log(
    `${PREFIX} → ${method} ${url}`,
    sanitizeForLog(details),
  );
};

export interface ApiLogResponse extends ApiLogRequest {
  status: number;
  durationMs: number;
  data?: unknown;
}

export const logApiResponse = (config: ApiLogResponse): void => {
  if (!apiLogsEnabled) {
    return;
  }
  const method = (config.method ?? 'get').toUpperCase();
  const url = resolveUrl(config.baseURL, config.url ?? '');
  // Include the request params AND the response body with explicit keys so a
  // log line can never be misread as "only params" — the envelope is always
  // shown under `data`.
  console.log(
    `${PREFIX} ← ${method} ${url} ${config.status} (${config.durationMs}ms)`,
    sanitizeForLog({
      ...(config.params !== undefined ? { params: config.params } : {}),
      data: config.data ?? null,
    }),
  );
};

export interface ApiLogError extends ApiLogRequest {
  status?: number;
  code?: string;
  message?: string;
  durationMs: number;
  data?: unknown;
}

export const logApiError = (config: ApiLogError): void => {
  if (!apiLogsEnabled) {
    return;
  }
  const method = (config.method ?? 'get').toUpperCase();
  const url = resolveUrl(config.baseURL, config.url ?? '');
  console.warn(
    `${PREFIX} ✖ ${method} ${url} ${config.status ?? 'NETWORK'} (${config.durationMs}ms)`,
    sanitizeForLog({
      ...(config.code ? { code: config.code } : {}),
      ...(config.message ? { message: config.message } : {}),
      ...(config.data !== undefined ? { data: config.data } : {}),
    }),
  );
};
