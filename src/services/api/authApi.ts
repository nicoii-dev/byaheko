import type {
  AuthCredentials,
  AuthRegistration,
  AuthResponse,
  UpdateProfileInput,
  User,
} from '../../types';
import { environment } from '../../config/environment';
import api from './client';
import { MockAuthApi } from '../mock/authApi';

export interface IAuthApi {
  login(credentials: AuthCredentials): Promise<AuthResponse>;
  register(data: AuthRegistration): Promise<AuthResponse>;
  verifyEmail(email: string, code: string): Promise<AuthResponse>;
  resendVerification(email: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void>;
  updateProfile(input: UpdateProfileInput): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
}

export class AuthApi implements IAuthApi {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(data: AuthRegistration): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobileNumber: data.mobileNumber,
      password: data.password,
    });
    return response.data;
  }

  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/verify-email', {
      email,
      code,
    });
    return response.data;
  }

  async resendVerification(email: string): Promise<void> {
    await api.post('/auth/resend-verification', { email });
  }

  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    await api.post('/auth/reset-password', { email, code, newPassword });
  }

  async updateProfile(input: UpdateProfileInput): Promise<User> {
    const response = await api.patch<User>('/users/me', input);
    return response.data;
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }
}

export const authApi: IAuthApi = environment.enableMockServices
  ? new MockAuthApi()
  : new AuthApi();
