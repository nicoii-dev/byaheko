import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ThemeState } from '../../types';
import { STORAGE_KEYS } from '../../config/constants';
import { storage } from '../../services/storage';

const initialState: ThemeState = {
  mode: 'light',
};

export const loadThemeMode = createAsyncThunk<'light' | 'dark', void>(
  'theme/load',
  async () => {
    const stored = await storage.getItem(STORAGE_KEYS.THEME);
    return stored === 'dark' ? 'dark' : 'light';
  },
);

export const setThemeMode = createAsyncThunk<
  'light' | 'dark',
  'light' | 'dark'
>('theme/setMode', async mode => {
  await storage.setItem(STORAGE_KEYS.THEME, mode);
  return mode;
});

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadThemeMode.fulfilled, (state, action) => {
        state.mode = action.payload;
      })
      .addCase(setThemeMode.fulfilled, (state, action) => {
        state.mode = action.payload;
      });
  },
});

export default themeSlice.reducer;
