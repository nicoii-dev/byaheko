import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LocationState, Location } from '../types';
import { locationApi } from '../services/api/locationApi';

const initialState: LocationState = {
  currentLocation: null,
  selectedOrigin: null,
  selectedDestination: null,
  permissionStatus: 'undetermined',
};

export const getCurrentLocation = createAsyncThunk(
  'location/getCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const location = await locationApi.getCurrentLocation();
      return location;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get location');
    }
  }
);

export const searchPlaces = createAsyncThunk(
  'location/search',
  async (query: string, { rejectWithValue }) => {
    try {
      return await locationApi.searchPlaces(query);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Search failed');
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setSelectedOrigin: (state, action: PayloadAction<Location | null>) => {
      state.selectedOrigin = action.payload;
    },
    setSelectedDestination: (state, action: PayloadAction<Location | null>) => {
      state.selectedDestination = action.payload;
    },
    setPermissionStatus: (
      state,
      action: PayloadAction<LocationState['permissionStatus']>
    ) => {
      state.permissionStatus = action.payload;
    },
    setCurrentLocation: (state, action: PayloadAction<Location | null>) => {
      state.currentLocation = action.payload;
    },
    swapOriginDestination: (state) => {
      const temp = state.selectedOrigin;
      state.selectedOrigin = state.selectedDestination;
      state.selectedDestination = temp;
    },
    clearSelectedLocations: (state) => {
      state.selectedOrigin = null;
      state.selectedDestination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentLocation.fulfilled, (state, action: PayloadAction<Location>) => {
        state.currentLocation = action.payload;
      });
  },
});

export const {
  setSelectedOrigin,
  setSelectedDestination,
  setPermissionStatus,
  setCurrentLocation,
  swapOriginDestination,
  clearSelectedLocations,
} = locationSlice.actions;
export default locationSlice.reducer;