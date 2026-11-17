import { STORAGE_KEYS } from '../../config/constants';
import type { AuthTokens } from '../../types';
import { storage } from '../storage';

/**
 * Persists the access/refresh token pair used by the API client.
 *
 * Tokens live in AsyncStorage so they survive app restarts. They are written
 * together so a rotated pair is never half-updated.
 */
export const sessionStorage = {
  getAccessToken: (): Promise<string | null> =>
    storage.getItem(STORAGE_KEYS.AUTH_TOKEN),

  getRefreshToken: (): Promise<string | null> =>
    storage.getItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN),

  saveTokens: async (tokens: AuthTokens): Promise<void> => {
    await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
    await storage.setItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN, tokens.refreshToken);
  },

  clearTokens: async (): Promise<void> => {
    await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await storage.removeItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
  },
};

export default sessionStorage;
