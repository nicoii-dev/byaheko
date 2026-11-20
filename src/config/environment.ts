/**
 * Runtime configuration.
 *
 * Metro inlines `process.env.NODE_ENV`. Additional values can be supplied by a
 * build pipeline (for example with react-native-config or a Babel plugin).
 * Keep the fallbacks so a fresh checkout always boots.
 */
import { API_URL } from './apiUrl';

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
export interface EnvironmentConfig {
  apiBaseUrl: string;
  appVersion: string;
  enableMockServices: boolean;
  requestTimeoutMs: number;
  /** MapLibre style URL. Defaults to CARTO's OSM-based production basemaps. */
  mapStyleUrl: string;
  /** Dark variant used when the app theme switches to dark. */
  mapStyleDarkUrl: string;
  /** Geocoding endpoint used for destination search. */
  geocoderUrl: string;
}

/**
 * CARTO Basemaps are OSM-based and served from a production CDN. The public
 * `tile.openstreetmap.org` server is intentionally not used here; override
 * these URLs with your own provider (and API key, if required) before release.
 */
const DEFAULT_MAP_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const DEFAULT_MAP_STYLE_DARK_URL =
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const DEFAULT_GEOCODER_URL = 'https://photon.komoot.io/api';

export const environment: EnvironmentConfig = {
  apiBaseUrl: API_URL.API_URL,
  appVersion: '1.0.0',
  // The mobile app is wired to the byaheko-api backend by default. Set
  // BYAHEKO_USE_MOCKS=true to boot without a running API.
  enableMockServices: readEnv('BYAHEKO_USE_MOCKS') === 'true',
  requestTimeoutMs: 12000,
  mapStyleUrl: readEnv('BYAHEKO_MAP_STYLE_URL') ?? DEFAULT_MAP_STYLE_URL,
  mapStyleDarkUrl:
    readEnv('BYAHEKO_MAP_STYLE_DARK_URL') ?? DEFAULT_MAP_STYLE_DARK_URL,
  geocoderUrl: readEnv('BYAHEKO_GEOCODER_URL') ?? DEFAULT_GEOCODER_URL,
};
