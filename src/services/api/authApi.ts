import type {
  AuthCredentials,
  AuthRegistration,
  AuthResponse,
  RegistrationResult,
  UpdateProfileInput,
  User,
  VerificationChallenge,
  VerificationResult,
} from '../../types';
import { environment } from '../../config/environment';
import api from './client';
import {
  mapApiUser,
  mapAuthResult,
  mapRegistrationResult,
  mapVerificationChallenge,
  mapVerificationResult,
} from './authMapper';
import type {
  ApiAuthResult,
  ApiRegistrationResult,
  ApiUser,
  ApiVerificationChallenge,
  ApiVerificationResult,
} from './types';
import { MockAuthApi } from '../mock/authApi';

export interface IAuthApi {
  login(credentials: AuthCredentials): Promise<AuthResponse>;
  register(data: AuthRegistration): Promise<RegistrationResult>;
  verifyEmail(email: string, code: string): Promise<VerificationResult>;
  resendVerification(email: string): Promise<VerificationChallenge>;
  requestPasswordReset(email: string): Promise<VerificationChallenge>;
  resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void>;
  updateProfile(input: UpdateProfileInput): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
  refreshSession(refreshToken: string): Promise<AuthResponse>;
}

/**
 * Production authentication client for the byaheko-api repository.
 *
 * Endpoint reference (API prefix `/api/v1` is part of `environment.apiBaseUrl`):
 *   POST /auth/register          → { user, verification }
 *   POST /auth/register/verify   → { user, verified }
 *   POST /auth/register/resend   → verification challenge
 *   POST /auth/forgot-password   → verification challenge
 *   POST /auth/reset-password    → null
 *   POST /auth/login             → { user, tokens }
 *   POST /auth/refresh           → { user, tokens }
 *   POST /auth/logout            → { revokedSessions }
 *   GET  /auth/me                → user
 *   PATCH /users/me              → user
 */
export class AuthApi implements IAuthApi {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiAuthResult>('/auth/login', credentials);
    return mapAuthResult(response.data);
  }

  async register(data: AuthRegistration): Promise<RegistrationResult> {
    const response = await api.post<ApiRegistrationResult>('/auth/register', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobileNumber: data.mobileNumber,
      password: data.password,
    });
    return mapRegistrationResult(response.data);
  }

  async verifyEmail(
    email: string,
    code: string,
  ): Promise<VerificationResult> {
    const response = await api.post<ApiVerificationResult>(
      '/auth/register/verify',
      { email, code },
    );
    return mapVerificationResult(response.data);
  }

  async resendVerification(email: string): Promise<VerificationChallenge> {
    const response = await api.post<ApiVerificationChallenge>(
      '/auth/register/resend',
      { email },
    );
    return mapVerificationChallenge(response.data);
  }

  async requestPasswordReset(
    email: string,
  ): Promise<VerificationChallenge> {
    const response = await api.post<ApiVerificationChallenge>(
      '/auth/forgot-password',
      { email },
    );
    return mapVerificationChallenge(response.data);
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    await api.post('/auth/reset-password', { email, code, newPassword });
  }

  async updateProfile(input: UpdateProfileInput): Promise<User> {
    const response = await api.patch<ApiUser>('/users/me', input);
    return mapApiUser(response.data);
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiUser>('/auth/me');
    return mapApiUser(response.data);
  }

  async refreshSession(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<ApiAuthResult>('/auth/refresh', {
      refreshToken,
    });
    return mapAuthResult(response.data);
  }
}

export const authApi: IAuthApi = environment.enableMockServices
  ? new MockAuthApi()
  : new AuthApi();
