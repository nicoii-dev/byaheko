import type {
  AuthCredentials,
  AuthRegistration,
  AuthResponse,
  AuthTokens,
  RegistrationResult,
  UpdateProfileInput,
  User,
  VerificationChallenge,
  VerificationResult,
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
  status: 'ACTIVE',
  role: 'COMMUTER',
  emailVerifiedAt: new Date('2025-01-15T08:00:00.000Z').toISOString(),
  password: 'Password123!',
  createdAt: new Date('2025-01-15T08:00:00.000Z').toISOString(),
};

const wait = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

function challenge(email: string): VerificationChallenge {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  return {
    email: email.trim().toLowerCase(),
    expiresAt,
    expiresInSeconds: 300,
    codeLength: 6,
    resendAvailableInSeconds: 60,
  };
}

function tokensFor(userId: string): AuthTokens {
  return {
    accessToken: `mock_access_token_${userId}_${Date.now()}`,
    refreshToken: `mock_refresh_token_${userId}_${Date.now()}`,
  };
}

/**
 * In-memory mock auth service used when `BYAHEKO_USE_MOCKS=true`.
 *
 * It mirrors the production `AuthApi` contract (registration does not sign the
 * user in, verification does not return tokens) so screens behave identically
 * against either implementation.
 */
export class MockAuthApi {
  private users: MockUser[] = [{ ...DEMO_USER }];
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
    if (!user.isEmailVerified) {
      throw new Error(
        'Please verify your email address before signing in.',
      );
    }
    return { user: this.toPublicUser(user), tokens: tokensFor(user.id) };
  }

  async register(data: AuthRegistration): Promise<RegistrationResult> {
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
      status: 'PENDING_VERIFICATION',
      role: 'COMMUTER',
      emailVerifiedAt: null,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    this.resetCodes.set(user.email, DEMO_VERIFICATION_CODE);

    return {
      user: this.toPublicUser(user),
      verification: challenge(user.email),
    };
  }

  async verifyEmail(
    email: string,
    code: string,
  ): Promise<VerificationResult> {
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
        const verified: User = {
          ...storedUser,
          isEmailVerified: true,
          status: 'ACTIVE',
          emailVerifiedAt: new Date().toISOString(),
        };
        await storage.setJson(STORAGE_KEYS.USER_DATA, verified);
        return { user: verified, verified: true };
      }
      throw new Error('Account not found. Please register again.');
    }

    user.isEmailVerified = true;
    user.status = 'ACTIVE';
    user.emailVerifiedAt = new Date().toISOString();
    return { user: this.toPublicUser(user), verified: true };
  }

  async resendVerification(email: string): Promise<VerificationChallenge> {
    await wait(500);
    this.resetCodes.set(email.toLowerCase(), DEMO_VERIFICATION_CODE);
    return challenge(email);
  }

  async requestPasswordReset(
    email: string,
  ): Promise<VerificationChallenge> {
    await wait(600);
    const user = this.users.find(
      candidate => candidate.email.toLowerCase() === email.toLowerCase(),
    );
    if (user) {
      this.resetCodes.set(user.email, DEMO_VERIFICATION_CODE);
    }
    // Do not reveal whether an email is registered.
    return challenge(email);
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
      throw new Error('Account not found. Please request a new reset code.');
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
      status: baseUser.status,
      role: baseUser.role,
      emailVerifiedAt: baseUser.emailVerifiedAt,
      lastLoginAt: baseUser.lastLoginAt,
      createdAt: baseUser.createdAt,
      updatedAt: new Date().toISOString(),
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

  async refreshSession(refreshToken: string): Promise<AuthResponse> {
    await wait(300);
    if (!refreshToken.startsWith('mock_refresh_token_')) {
      throw new Error('Invalid or expired refresh token.');
    }
    const storedUser = await storage.getJson<User>(STORAGE_KEYS.USER_DATA);
    if (!storedUser) {
      throw new Error('No signed-in user found.');
    }
    return { user: storedUser, tokens: tokensFor(storedUser.id) };
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
      status: user.status,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
