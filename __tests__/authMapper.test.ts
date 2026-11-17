import {
  mapApiUser,
  mapAuthResult,
  mapRegistrationResult,
} from '../src/services/api/authMapper';
import type { ApiUser } from '../src/services/api/types';

const apiUser: ApiUser = {
  id: 'a1b2c3d4-0000-4000-8000-000000000001',
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  email: 'juan@example.com',
  mobileNumber: null,
  avatar: null,
  status: 'ACTIVE',
  role: 'COMMUTER',
  emailVerifiedAt: '2026-01-01T00:00:00.000Z',
  lastLoginAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

describe('auth API mapper', () => {
  it('maps API users into the UI model', () => {
    expect(mapApiUser(apiUser)).toMatchObject({
      id: apiUser.id,
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      email: 'juan@example.com',
      mobileNumber: '',
      avatar: undefined,
      isEmailVerified: true,
      status: 'ACTIVE',
      role: 'COMMUTER',
    });
  });

  it('treats an active account as verified even without a timestamp', () => {
    expect(
      mapApiUser({
        ...apiUser,
        status: 'ACTIVE',
        emailVerifiedAt: null,
      }).isEmailVerified,
    ).toBe(true);
  });

  it('treats a pending account without a timestamp as unverified', () => {
    expect(
      mapApiUser({
        ...apiUser,
        status: 'PENDING_VERIFICATION',
        emailVerifiedAt: null,
      }).isEmailVerified,
    ).toBe(false);
  });

  it('maps a login result with both tokens', () => {
    const result = mapAuthResult({
      user: apiUser,
      tokens: { accessToken: 'access', refreshToken: 'refresh' },
    });

    expect(result.tokens).toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    expect(result.user.email).toBe('juan@example.com');
  });

  it('maps the registration verification challenge', () => {
    const result = mapRegistrationResult({
      user: { ...apiUser, status: 'PENDING_VERIFICATION', emailVerifiedAt: null },
      verification: {
        email: 'juan@example.com',
        expiresAt: '2026-01-01T00:05:00.000Z',
        expiresInSeconds: 300,
        codeLength: 6,
        resendAvailableInSeconds: 60,
      },
    });

    expect(result.user.isEmailVerified).toBe(false);
    expect(result.verification).toEqual({
      email: 'juan@example.com',
      expiresAt: '2026-01-01T00:05:00.000Z',
      expiresInSeconds: 300,
      codeLength: 6,
      resendAvailableInSeconds: 60,
    });
  });
});
