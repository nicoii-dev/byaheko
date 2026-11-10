import { User, AuthCredentials, AuthRegistration, AuthResponse } from '../types';
import { STORAGE_KEYS } from '../config/constants';
import { storage } from '../services/storage';

export interface IAuthApi {
  login(credentials: AuthCredentials): Promise<AuthResponse>;
  register(data: AuthRegistration): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
}

export class AuthApi implements IAuthApi {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }

  async register(data: AuthRegistration): Promise<AuthResponse> {
    const response = await api.post('/auth/register', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobileNumber: data.mobileNumber,
      password: data.password,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  }
}

export class MockAuthApi implements IAuthApi {
  private users: User[] = [
    {
      id: 'user_1',
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      email: 'juan@example.com',
      mobileNumber: '09171234567',
      createdAt: new Date().toISOString(),
    },
  ];

  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const user = this.users.find((u) => u.email === credentials.email);
    if (!user || credentials.password !== 'password123') {
      throw new Error('Invalid email or password');
    }
    return {
      user,
      token: `mock_token_${user.id}`,
    };
  }

  async register(data: AuthRegistration): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (this.users.some((u) => u.email === data.email)) {
      throw new Error('Email already registered');
    }
    const newUser: User = {
      id: `user_${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobileNumber: data.mobileNumber,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return {
      user: newUser,
      token: `mock_token_${newUser.id}`,
    };
  }

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  async getCurrentUser(): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) throw new Error('Not authenticated');
    const userJson = await storage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userJson) throw new Error('User data not found');
    return JSON.parse(userJson) as User;
  }
}

import api from './index';
export const authApi: IAuthApi = new MockAuthApi();