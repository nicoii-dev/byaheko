import api from '../src/services/api/client';

describe('API interceptor logging (integration)', () => {
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

  it('logs request params and response body separately', async () => {
    (api.defaults as any).adapter = async (config: any) => ({
      data: {
        success: true,
        message: 'Routes retrieved successfully.',
        data: [{ id: 'r1', name: 'Route 1' }],
        meta: { total: 1, page: 1, limit: 100, hasNextPage: false },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });

    await api.get('/routes', { params: { status: 'ACTIVE' } });

    const requestLog = logSpy.mock.calls.find((call: any[]) =>
      String(call[0]).includes('→'),
    );
    const responseLog = logSpy.mock.calls.find((call: any[]) =>
      String(call[0]).includes('←'),
    );

    expect(requestLog?.[1]).toHaveProperty('params', { status: 'ACTIVE' });
    expect(responseLog?.[1]).toHaveProperty('params', { status: 'ACTIVE' });
    expect(responseLog?.[1]).toHaveProperty('data.data', [
      { id: 'r1', name: 'Route 1' },
    ]);
  });
});
