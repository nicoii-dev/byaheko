import type {
  AuthCredentials,
  AuthRegistration,
  AuthResponse,
  UpdateProfileInput,
  User,
} from '../../types';
import { DEMO_VERIFICATION_CODE, STORAGE_KEYS } from '../../config/constants';
import { storage } from '../storage';

interface MockUser extends User {
  password: string;
}

const DEMO_USER: MockUser = {
  id: 'user_demo',
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  email: 'juan@example.com',
  mobileNumber: '09171234567',
  isEmailVerified: true,
  password: 'Password123!',
  createdAt: new Date('2025-01-15T08:00:00.000Z').toISOString(),
};

const wait = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * In-memory mock auth service. It intentionally keeps passwords out of the
 * Redux store and never pretends to be a real authentication backend.
 */
export class MockAuthApi {
  private users: MockUser[] = [DEMO_USER];
  private resetCodes = new Map<string, string>();

  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    await wait(700);
    const user = this.users.find(
      candidate =>
        candidate.email.toLowerCase() === credentials.email.toLowerCase(),
    );
    if (!user || user.password !== credentials.password) {
      throw new Error('Invalid email or password.');
    }
    return { user: this.toPublicUser(user), token: `mock_token_${user.id}` };
  }

  async register(data: AuthRegistration): Promise<AuthResponse> {
    await wait(900);
    const existing = this.users.find(
      user => user.email.toLowerCase() === data.email.toLowerCase(),
    );
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const user: MockUser = {
      id: `user_${Date.now()}`,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      mobileNumber: data.mobileNumber.trim(),
      password: data.password,
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    this.resetCodes.set(user.email, DEMO_VERIFICATION_CODE);

    return { user: this.toPublicUser(user), token: `mock_token_${user.id}` };
  }

  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    await wait(600);
    if (code !== DEMO_VERIFICATION_CODE) {
      throw new Error('The verification code is invalid or expired.');
    }

    const user = this.users.find(
      candidate => candidate.email.toLowerCase() === email.toLowerCase(),
    );
    if (!user) {
      const storedUser = await storage.getJson<User>(STORAGE_KEYS.USER_DATA);
      if (
        storedUser &&
        storedUser.email.toLowerCase() === email.toLowerCase()
      ) {
        const verified = { ...storedUser, isEmailVerified: true };
        await storage.setJson(STORAGE_KEYS.USER_DATA, verified);
        return { user: verified, token: `mock_token_${verified.id}` };
      }
      throw new Error('Account not found. Please register again.');
    }

    user.isEmailVerified = true;
    return { user: this.toPublicUser(user), token: `mock_token_${user.id}` };
  }

  async resendVerification(email: string): Promise<void> {
    await wait(500);
    this.resetCodes.set(email.toLowerCase(), DEMO_VERIFICATION_CODE);
  }

  async requestPasswordReset(email: string): Promise<void> {
    await wait(600);
    const user = this.users.find(
      candidate => candidate.email.toLowerCase() === email.toLowerCase(),
    );
    if (user) {
      this.resetCodes.set(user.email, DEMO_VERIFICATION_CODE);
    }
    // Do not reveal whether an email is registered.
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    await wait(700);
    if (code !== DEMO_VERIFICATION_CODE) {
      throw new Error('The reset code is invalid or expired.');
    }
    const user = this.users.find(
      candidate => candidate.email.toLowerCase() === email.toLowerCase(),
    );
    if (!user) {
      throw new Error('Account not found. Please request a new reset link.');
    }
    user.password = newPassword;
  }

  async updateProfile(input: UpdateProfileInput): Promise<User> {
    await wait(600);
    const storedUser = await storage.getJson<User>(STORAGE_KEYS.USER_DATA);
    const user = this.users.find(
      candidate => candidate.email === storedUser?.email,
    );
    const baseUser = user ?? storedUser ?? DEMO_USER;
    const updated: User = {
      id: baseUser.id,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: baseUser.email,
      mobileNumber: input.mobileNumber.trim(),
      avatar: baseUser.avatar,
      isEmailVerified: baseUser.isEmailVerified,
      createdAt: baseUser.createdAt,
    };
    if (user) {
      user.firstName = updated.firstName;
      user.lastName = updated.lastName;
      user.mobileNumber = updated.mobileNumber;
    }
    await storage.setJson(STORAGE_KEYS.USER_DATA, updated);
    return updated;
  }

  async logout(): Promise<void> {
    await wait(200);
  }

  async getCurrentUser(): Promise<User> {
    await wait(300);
    const storedUser = await storage.getJson<User>(STORAGE_KEYS.USER_DATA);
    if (!storedUser) {
      throw new Error('No signed-in user found.');
    }
    return storedUser;
  }

  private toPublicUser(user: MockUser): User {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };
  }
}
