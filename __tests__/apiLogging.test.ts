import {
  logApiError,
  logApiRequest,
  logApiResponse,
  sanitizeForLog,
} from '../src/services/api/log';

describe('API logging', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('redacts sensitive keys but keeps other values', () => {
    expect(
      sanitizeForLog({
        email: 'juan@example.com',
        password: 'secret123',
        newPassword: 'secret456',
        refreshToken: 'token-abc',
        authorization: 'Bearer token-xyz',
        nested: { accessToken: 'secret789', name: 'Juan' },
      }),
    ).toEqual({
      email: 'juan@example.com',
      password: '[REDACTED]',
      newPassword: '[REDACTED]',
      refreshToken: '[REDACTED]',
      authorization: '[REDACTED]',
      nested: { accessToken: '[REDACTED]', name: 'Juan' },
    });
  });

  it('handles arrays and dates in payloads', () => {
    expect(
      sanitizeForLog([{ token: 'abc' }, new Date('2026-01-01T00:00:00.000Z')]),
    ).toEqual([{ token: '[REDACTED]' }, '2026-01-01T00:00:00.000Z']);
  });

  it('logs a request with method, resolved URL, params, and body', () => {
    logApiRequest({
      method: 'post',
      baseURL: 'https://api.example.com/api/v1',
      url: '/routes',
      params: { page: 1 },
      data: { name: 'Test', password: 'secret' },
    });

    expect(logSpy).toHaveBeenCalledWith(
      '[ByaheKo API] → POST https://api.example.com/api/v1/routes',
      { params: { page: 1 }, body: { name: 'Test', password: '[REDACTED]' } },
    );
  });

  it('logs a response with status, duration, params, and the data envelope', () => {
    logApiResponse({
      method: 'get',
      url: 'https://api.example.com/api/v1/routes',
      params: { status: 'ACTIVE' },
      status: 200,
      durationMs: 42,
      data: { success: true, data: [{ id: 'r1' }] },
    });

    expect(logSpy).toHaveBeenCalledWith(
      '[ByaheKo API] ← GET https://api.example.com/api/v1/routes 200 (42ms)',
      {
        params: { status: 'ACTIVE' },
        data: { success: true, data: [{ id: 'r1' }] },
      },
    );
  });

  it('logs an error with status, code, and redacted data', () => {
    logApiError({
      method: 'post',
      url: 'https://api.example.com/api/v1/auth/login',
      status: 401,
      code: 'ERR_BAD_REQUEST',
      message: 'Request failed',
      durationMs: 15,
      data: { password: 'secret', message: 'Invalid credentials' },
    });

    expect(warnSpy).toHaveBeenCalledWith(
      '[ByaheKo API] ✖ POST https://api.example.com/api/v1/auth/login 401 (15ms)',
      {
        code: 'ERR_BAD_REQUEST',
        message: 'Request failed',
        data: { password: '[REDACTED]', message: 'Invalid credentials' },
      },
    );
  });
});
