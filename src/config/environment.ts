/**
 * Runtime configuration.
 *
 * Metro inlines `process.env.NODE_ENV`. Additional values can be supplied by a
 * build pipeline (for example with react-native-config or a Babel plugin).
 * Keep the fallbacks so a fresh checkout always boots.
 */
const runtimeEnv = (
  globalThis as {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env;

const readEnv = (key: string): string | undefined => runtimeEnv?.[key];

export interface EnvironmentConfig {
  apiBaseUrl: string;
  appVersion: string;
  enableMockServices: boolean;
  requestTimeoutMs: number;
}

export const environment: EnvironmentConfig = {
  apiBaseUrl: readEnv('BYAHEKO_API_URL') ?? 'https://api.byaheko.app/v1',
  appVersion: readEnv('BYAHEKO_APP_VERSION') ?? '1.0.0',
  // The backend is not part of this repository yet. Flip this to false once a
  // real API is available; every service already has a production client.
  enableMockServices: readEnv('BYAHEKO_USE_MOCKS') !== 'false',
  requestTimeoutMs: 12000,
};
