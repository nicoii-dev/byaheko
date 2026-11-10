import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SettingsState } from '../../types';

const initialState: SettingsState = {
  notificationEnabled: true,
  locationSharing: false,
  autoStartNavigation: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setNotificationEnabled: (state, action: PayloadAction<boolean>) => {
      state.notificationEnabled = action.payload;
    },
    setLocationSharing: (state, action: PayloadAction<boolean>) => {
      state.locationSharing = action.payload;
    },
    setAutoStartNavigation: (state, action: PayloadAction<boolean>) => {
      state.autoStartNavigation = action.payload;
    },
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const {
  setNotificationEnabled,
  setLocationSharing,
  setAutoStartNavigation,
  updateSettings,
} = settingsSlice.actions;
export default settingsSlice.reducer;