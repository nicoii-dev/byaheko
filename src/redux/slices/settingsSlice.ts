import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { SettingsState } from '../../types';
import { STORAGE_KEYS } from '../../config/constants';
import { storage } from '../../services/storage';
import type { RootState } from '../store';

const initialState: SettingsState = {
  notificationEnabled: true,
  locationSharing: false,
  autoStartNavigation: false,
  isLoaded: false,
};

type PersistedSettings = Omit<SettingsState, 'isLoaded'>;

export const loadSettings = createAsyncThunk<SettingsState, void>(
  'settings/load',
  async () => {
    const stored = await storage.getJson<Partial<PersistedSettings>>(
      STORAGE_KEYS.SETTINGS,
    );
    return {
      notificationEnabled: stored?.notificationEnabled ?? true,
      locationSharing: stored?.locationSharing ?? false,
      autoStartNavigation: stored?.autoStartNavigation ?? false,
      isLoaded: true,
    };
  },
);

export const saveSettings = createAsyncThunk<
  SettingsState,
  Partial<PersistedSettings>,
  { state: RootState }
>('settings/save', async (changes, { getState }) => {
  const current = getState().settings;
  const next: SettingsState = {
    notificationEnabled:
      changes.notificationEnabled ?? current.notificationEnabled,
    locationSharing: changes.locationSharing ?? current.locationSharing,
    autoStartNavigation:
      changes.autoStartNavigation ?? current.autoStartNavigation,
    isLoaded: true,
  };
  await storage.setJson(STORAGE_KEYS.SETTINGS, {
    notificationEnabled: next.notificationEnabled,
    locationSharing: next.locationSharing,
    autoStartNavigation: next.autoStartNavigation,
  });
  return next;
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadSettings.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      });
  },
});

export default settingsSlice.reducer;
