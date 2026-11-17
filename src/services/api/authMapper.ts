import type {
  AuthResponse,
  RegistrationResult,
  User,
  VerificationChallenge,
  VerificationResult,
} from '../../types';
import type {
  ApiAuthResult,
  ApiRegistrationResult,
  ApiUser,
  ApiVerificationChallenge,
  ApiVerificationResult,
} from './types';

/**
 * Maps the API's Prisma-serialized user into the app's UI model.
 *
 * The mobile UI only needs `isEmailVerified`, but the underlying status and
 * role are preserved so later features (admin, operator tools) can use them.
 */
export function mapApiUser(user: ApiUser): User {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    mobileNumber: user.mobileNumber ?? '',
    avatar: user.avatar ?? undefined,
    isEmailVerified:
      user.emailVerifiedAt !== null || user.status === 'ACTIVE',
    status: user.status,
    role: user.role,
    emailVerifiedAt: user.emailVerifiedAt,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function mapAuthResult(result: ApiAuthResult): AuthResponse {
  return {
    user: mapApiUser(result.user),
    tokens: result.tokens,
  };
}

export function mapRegistrationResult(
  result: ApiRegistrationResult,
): RegistrationResult {
  return {
    user: mapApiUser(result.user),
    verification: mapVerificationChallenge(result.verification),
  };
}

export function mapVerificationResult(
  result: ApiVerificationResult,
): VerificationResult {
  return {
    user: mapApiUser(result.user),
    verified: result.verified,
  };
}

export function mapVerificationChallenge(
  challenge: ApiVerificationChallenge,
): VerificationChallenge {
  return {
    email: challenge.email,
    expiresAt: challenge.expiresAt,
    expiresInSeconds: challenge.expiresInSeconds,
    codeLength: challenge.codeLength,
    resendAvailableInSeconds: challenge.resendAvailableInSeconds,
  };
}
