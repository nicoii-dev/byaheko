import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Location, LocationState } from '../../types';
import { STORAGE_KEYS } from '../../config/constants';
import { locationApi } from '../../services/api/locationApi';
import { storage } from '../../services/storage';
import { getErrorMessage } from '../../utils/errors';
import {
  LocationPermissionError,
  requestLocationPermission,
} from '../../services/location/deviceLocation';
import type { PermissionStatus } from '../../services/location/types';
import type { RootState } from '../store';

const initialState: LocationState = {
  currentLocation: null,
  selectedOrigin: null,
  selectedDestination: null,
  permissionStatus: 'undetermined',
  accessAllowed: false,
  restoring: false,
  recentSearches: [],
  loading: false,
  error: null,
};

interface LocationError {
  message: string;
  status?: PermissionStatus;
}

interface RestoreLocationResult {
  allowed: boolean;
  location: Location | null;
  status: PermissionStatus;
}

export const getCurrentLocation = createAsyncThunk<
  Location,
  void,
  { rejectValue: LocationError }
>('location/getCurrentLocation', async (_, { rejectWithValue }) => {
  try {
    const permission = await requestLocationPermission();
    if (permission !== 'granted') {
      return rejectWithValue({
        message:
          permission === 'blocked'
            ? 'Location access is blocked. Enable it in Settings or pick a location manually.'
            : 'Location permission is needed to show nearby transport. You can also pick a location manually.',
        status: permission,
      });
    }

    const location = await locationApi.getCurrentLocation();
    // Any successful grant counts as approval, including "Locate" / "Use my
    // location" taps outside the first-run prompt.
    await storage.setItem(STORAGE_KEYS.LOCATION_ACCESS_ALLOWED, 'true');
    try {
      const address = await locationApi.reverseGeocode(
        location.latitude,
        location.longitude,
      );
      return { ...location, address, name: address };
    } catch {
      return location;
    }
  } catch (error) {
    if (error instanceof LocationPermissionError) {
      return rejectWithValue({ message: error.message, status: error.status });
    }
    return rejectWithValue({ message: getErrorMessage(error) });
  }
});

/**
 * Re-establishes nearby access on launch after the user approved location in
 * the first-run prompt. It reads the device directly instead of calling
 * requestLocationPermission(), so the OS dialog is never shown a second time.
 * Failures stay silent: they only downgrade permissionStatus, never set an
 * error banner that would interrupt the user on Home or Explore.
 */
export const restoreLocationAccess = createAsyncThunk<RestoreLocationResult>(
  'location/restoreLocationAccess',
  async () => {
    const allowed = await storage.getItem(STORAGE_KEYS.LOCATION_ACCESS_ALLOWED);
    if (allowed !== 'true') {
      return { allowed: false, location: null, status: 'undetermined' };
    }

    try {
      const location = await locationApi.getCurrentLocation();
      return { allowed: true, location, status: 'granted' };
    } catch (error) {
      return {
        allowed: true,
        location: null,
        status:
          error instanceof LocationPermissionError
            ? error.status
            : 'undetermined',
      };
    }
  },
);

export const searchPlaces = createAsyncThunk<
  Location[],
  string,
  { rejectValue: string }
>('location/searchPlaces', async (query, { rejectWithValue }) => {
  try {
    return await locationApi.searchPlaces(query);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Place search failed.'));
  }
});

export const loadRecentSearches = createAsyncThunk<Location[], void>(
  'location/loadRecentSearches',
  async () =>
    (await storage.getJson<Location[]>(STORAGE_KEYS.RECENT_SEARCHES)) ?? [],
);

export const addRecentSearch = createAsyncThunk<
  Location[],
  Location,
  { state: RootState }
>('location/addRecentSearch', async (location, { getState }) => {
  const existing = getState().location.recentSearches;
  const key = location.id ?? `${location.latitude},${location.longitude}`;
  const next = [
    location,
    ...existing.filter(item => {
      const itemKey = item.id ?? `${item.latitude},${item.longitude}`;
      return itemKey !== key;
    }),
  ].slice(0, 8);
  await storage.setJson(STORAGE_KEYS.RECENT_SEARCHES, next);
  return next;
});

export const clearRecentSearches = createAsyncThunk<void, void>(
  'location/clearRecentSearches',
  async () => {
    await storage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
  },
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setSelectedOrigin: (state, action: PayloadAction<Location | null>) => {
      state.selectedOrigin = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setSelectedDestination: (state, action: PayloadAction<Location | null>) => {
      state.selectedDestination = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setPermissionStatus: (
      state,
      action: PayloadAction<LocationState['permissionStatus']>,
    ) => {
      state.permissionStatus = action.payload;
    },
    setLocationAccessAllowed: (state, action: PayloadAction<boolean>) => {
      state.accessAllowed = action.payload;
    },
    setCurrentLocation: (state, action: PayloadAction<Location | null>) => {
      state.currentLocation = action.payload;
    },
    swapOriginDestination: state => {
      const origin = state.selectedOrigin;
      state.selectedOrigin = state.selectedDestination;
      state.selectedDestination = origin;
    },
    clearSelectedLocations: state => {
      state.selectedOrigin = null;
      state.selectedDestination = null;
    },
    clearLocationError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getCurrentLocation.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLocation = action.payload;
        state.permissionStatus = 'granted';
        state.accessAllowed = true;
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message ?? 'Unable to get your location.';
        if (action.payload?.status) {
          state.permissionStatus = action.payload.status;
        }
      })
      .addCase(restoreLocationAccess.pending, state => {
        state.restoring = true;
      })
      .addCase(restoreLocationAccess.fulfilled, (state, action) => {
        state.restoring = false;
        if (!action.payload.allowed) {
          return;
        }
        state.accessAllowed = true;
        state.permissionStatus = action.payload.status;
        if (action.payload.location) {
          state.currentLocation = action.payload.location;
        }
      })
      .addCase(searchPlaces.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPlaces.fulfilled, state => {
        state.loading = false;
      })
      .addCase(searchPlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Place search failed.';
      })
      .addCase(loadRecentSearches.fulfilled, (state, action) => {
        state.recentSearches = action.payload;
      })
      .addCase(addRecentSearch.fulfilled, (state, action) => {
        state.recentSearches = action.payload;
      })
      .addCase(clearRecentSearches.fulfilled, state => {
        state.recentSearches = [];
      });
  },
});

export const {
  setSelectedOrigin,
  setSelectedDestination,
  setPermissionStatus,
  setLocationAccessAllowed,
  setCurrentLocation,
  swapOriginDestination,
  clearSelectedLocations,
  clearLocationError,
} = locationSlice.actions;

export default locationSlice.reducer;
