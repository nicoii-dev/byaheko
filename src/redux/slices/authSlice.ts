import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type {
  AuthCredentials,
  AuthRegistration,
  AuthResponse,
  AuthState,
  UpdateProfileInput,
  User,
} from '../../types';
import { STORAGE_KEYS } from '../../config/constants';
import { storage } from '../../services/storage';
import { authApi } from '../../services/api/authApi';
import { getErrorMessage } from '../../utils/errors';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  loading: false,
  error: null,
  pendingVerificationEmail: null,
};

const persistSession = async (response: AuthResponse): Promise<void> => {
  await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
  await storage.setJson(STORAGE_KEYS.USER_DATA, response.user);
};

export const restoreSession = createAsyncThunk<
  AuthResponse | null,
  void,
  { rejectValue: string }
>('auth/restoreSession', async (_, { rejectWithValue }) => {
  try {
    const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const user = await storage.getJson<User>(STORAGE_KEYS.USER_DATA);
    if (!token || !user) {
      return null;
    }
    return { token, user };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Unable to restore session.'));
  }
});

export const login = createAsyncThunk<
  AuthResponse,
  AuthCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authApi.login(credentials);
    await persistSession(response);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Login failed.'));
  }
});

export const register = createAsyncThunk<
  AuthResponse,
  AuthRegistration,
  { rejectValue: string }
>('auth/register', async (registration, { rejectWithValue }) => {
  try {
    const response = await authApi.register(registration);
    await persistSession(response);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Registration failed.'));
  }
});

export const verifyEmail = createAsyncThunk<
  AuthResponse,
  { email: string; code: string },
  { rejectValue: string }
>('auth/verifyEmail', async ({ email, code }, { rejectWithValue }) => {
  try {
    const response = await authApi.verifyEmail(email, code);
    await persistSession(response);
    return response;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Email verification failed.'),
    );
  }
});

export const resendVerification = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>('auth/resendVerification', async (email, { rejectWithValue }) => {
  try {
    await authApi.resendVerification(email);
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to resend the verification code.'),
    );
  }
});

export const requestPasswordReset = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>('auth/requestPasswordReset', async (email, { rejectWithValue }) => {
  try {
    await authApi.requestPasswordReset(email);
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to send the reset code.'),
    );
  }
});

export const resetPassword = createAsyncThunk<
  void,
  { email: string; code: string; newPassword: string },
  { rejectValue: string }
>('auth/resetPassword', async (payload, { rejectWithValue }) => {
  try {
    await authApi.resetPassword(
      payload.email,
      payload.code,
      payload.newPassword,
    );
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to reset your password.'),
    );
  }
});

export const updateProfile = createAsyncThunk<
  User,
  UpdateProfileInput,
  { rejectValue: string }
>('auth/updateProfile', async (input, { rejectWithValue }) => {
  try {
    const user = await authApi.updateProfile(input);
    await storage.setJson(STORAGE_KEYS.USER_DATA, user);
    return user;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to update your profile.'),
    );
  }
});

export const logout = createAsyncThunk<void, void>(
  'auth/logout',
  async () => {
    try {
      await authApi.logout();
    } catch {
      // Local sign-out must succeed even if the network request fails.
    } finally {
      await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await storage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: state => {
      state.error = null;
    },
    clearPendingVerification: state => {
      state.pendingVerificationEmail = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(restoreSession.pending, state => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.pendingVerificationEmail = action.payload.user.isEmailVerified
            ? null
            : action.payload.user.email;
        }
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.error = action.payload ?? null;
      })
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.pendingVerificationEmail = action.payload.user.isEmailVerified
          ? null
          : action.payload.user.email;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Login failed.';
      })
      .addCase(register.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.pendingVerificationEmail = action.payload.user.isEmailVerified
          ? null
          : action.payload.user.email;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Registration failed.';
      })
      .addCase(verifyEmail.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.pendingVerificationEmail = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Email verification failed.';
      })
      .addCase(resendVerification.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, state => {
        state.loading = false;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unable to resend code.';
      })
      .addCase(requestPasswordReset.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, state => {
        state.loading = false;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unable to send reset code.';
      })
      .addCase(resetPassword.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, state => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unable to reset password.';
      })
      .addCase(updateProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unable to update profile.';
      })
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.pendingVerificationEmail = null;
        state.error = null;
        state.isInitialized = true;
      });
  },
});

export const { clearAuthError, clearPendingVerification } = authSlice.actions;
export default authSlice.reducer;
