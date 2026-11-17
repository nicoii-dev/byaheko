/**
 * Runtime configuration.
 *
 * Metro inlines `process.env.NODE_ENV`. Additional values can be supplied by a
 * build pipeline (for example with react-native-config or a Babel plugin).
 * Keep the fallbacks so a fresh checkout always boots.
 */
import { Platform } from 'react-native';

const runtimeEnv = (
  globalThis as {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env;

const readEnv = (key: string): string | undefined => runtimeEnv?.[key];

/**
 * Android emulators reach the host machine through 10.0.2.2, while the iOS
 * simulator shares the host's localhost. Use `BYAHEKO_API_URL` for a physical
 * device or a deployed backend.
 */
const defaultApiBaseUrl =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5050/api/v1'
    : 'http://localhost:5050/api/v1';

export interface EnvironmentConfig {
  apiBaseUrl: string;
  appVersion: string;
  enableMockServices: boolean;
  requestTimeoutMs: number;
}

export const environment: EnvironmentConfig = {
  apiBaseUrl: readEnv('BYAHEKO_API_URL') ?? defaultApiBaseUrl,
  appVersion: readEnv('BYAHEKO_APP_VERSION') ?? '1.0.0',
  // The mobile app is wired to the byaheko-api backend by default. Set
  // BYAHEKO_USE_MOCKS=true to boot without a running API.
  enableMockServices: readEnv('BYAHEKO_USE_MOCKS') === 'true',
  requestTimeoutMs: 12000,
};
