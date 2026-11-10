import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState, AuthCredentials, AuthRegistration, AuthResponse } from '../types';
import { STORAGE_KEYS } from '../config/constants';
import { storage } from '../services/storage';
import { authApi, mockAuth } from '../services/api/authApi';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk<AuthResponse, AuthCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk<AuthResponse, AuthRegistration>(
  'auth/register',
  async (registration, { rejectWithValue }) => {
    try {
      const response = await authApi.register(registration);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authApi.logout();
    storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    storage.removeItem(STORAGE_KEYS.USER_DATA);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Logout failed');
  }
});

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        return null;
      }
      const userJson = storage.getItem(STORAGE_KEYS.USER_DATA);
      if (userJson) {
        const user = JSON.parse(userJson) as User;
        return { user, token };
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Auth check failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        storage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.token);
        storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        storage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.token);
        storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(action.payload.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      });
  },
});

export const { clearAuthError, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;