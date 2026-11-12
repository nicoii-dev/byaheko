import { forgotPasswordSchema } from '../src/features/auth/schemas/forgotPasswordSchema';
import { loginSchema } from '../src/features/auth/schemas/loginSchema';
import { registerSchema } from '../src/features/auth/schemas/registerSchema';
import { resetPasswordSchema } from '../src/features/auth/schemas/resetPasswordSchema';
import { verifyEmailSchema } from '../src/features/auth/schemas/verifyEmailSchema';

const validRegistration = {
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  email: 'juan@example.com',
  mobileNumber: '09171234567',
  password: 'Password123!',
  confirmPassword: 'Password123!',
};

describe('auth schemas', () => {
  describe('loginSchema', () => {
    it('accepts a valid email and password', async () => {
      await expect(
        loginSchema.isValid({
          email: 'juan@example.com',
          password: 'Password123!',
        }),
      ).resolves.toBe(true);
    });

    it('rejects an invalid email and a short password', async () => {
      await expect(
        loginSchema.isValid({ email: 'not-an-email', password: '123' }),
      ).resolves.toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('accepts a complete registration', async () => {
      await expect(registerSchema.isValid(validRegistration)).resolves.toBe(
        true,
      );
    });

    it('rejects mismatched passwords', async () => {
      await expect(
        registerSchema.isValid({
          ...validRegistration,
          confirmPassword: 'Different123!',
        }),
      ).resolves.toBe(false);
    });

    it('rejects a mobile number that does not start with 09', async () => {
      await expect(
        registerSchema.isValid({
          ...validRegistration,
          mobileNumber: '12345678901',
        }),
      ).resolves.toBe(false);
    });

    it('rejects a password without a special character', async () => {
      await expect(
        registerSchema.isValid({
          ...validRegistration,
          password: 'Password123',
          confirmPassword: 'Password123',
        }),
      ).resolves.toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('requires a valid email', async () => {
      await expect(
        forgotPasswordSchema.isValid({ email: 'juan@example.com' }),
      ).resolves.toBe(true);
      await expect(
        forgotPasswordSchema.isValid({ email: '' }),
      ).resolves.toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('accepts a six-digit code and matching strong passwords', async () => {
      await expect(
        resetPasswordSchema.isValid({
          code: '123456',
          newPassword: 'NewPassword1!',
          confirmPassword: 'NewPassword1!',
        }),
      ).resolves.toBe(true);
    });

    it('rejects a code that is not six digits', async () => {
      await expect(
        resetPasswordSchema.isValid({
          code: '12ab',
          newPassword: 'NewPassword1!',
          confirmPassword: 'NewPassword1!',
        }),
      ).resolves.toBe(false);
    });

    it('rejects mismatched new passwords', async () => {
      await expect(
        resetPasswordSchema.isValid({
          code: '123456',
          newPassword: 'NewPassword1!',
          confirmPassword: 'Another1!',
        }),
      ).resolves.toBe(false);
    });
  });

  describe('verifyEmailSchema', () => {
    it('accepts a six-digit verification code', async () => {
      await expect(verifyEmailSchema.isValid({ code: '123456' })).resolves.toBe(
        true,
      );
    });

    it('rejects letters and codes of the wrong length', async () => {
      await expect(verifyEmailSchema.isValid({ code: '12ab56' })).resolves.toBe(
        false,
      );
      await expect(verifyEmailSchema.isValid({ code: '123' })).resolves.toBe(
        false,
      );
    });
  });
});
