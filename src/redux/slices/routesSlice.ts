import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Route, Trip, RoutesState } from '../../types';
import { routesApi } from '../../services/api/routesApi';

const initialState: RoutesState = {
  routes: [],
  routeOptions: [],
  selectedRoute: null,
  currentTrip: null,
  loading: false,
  error: null,
};

export const loadRoutes = createAsyncThunk(
  'routes/load',
  async (_, { rejectWithValue }) => {
    try {
      return await routesApi.getRoutes();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load routes');
    }
  }
);

export const planTrip = createAsyncThunk<Trip, { origin: any; destination: any }>(
  'routes/planTrip',
  async ({ origin, destination }, { rejectWithValue }) => {
    try {
      return await routesApi.planTrip(origin, destination);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to plan trip');
    }
  }
);

export const getRouteDetails = createAsyncThunk<Route, string>(
  'routes/getDetails',
  async (routeId, { rejectWithValue }) => {
    try {
      const route = await routesApi.getRouteDetails(routeId);
      if (!route) {
        return rejectWithValue("Route not found");
      }
      return route;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load route details');
    }
  }
);

const routesSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    clearRouteOptions: (state) => {
      state.routeOptions = [];
    },
    clearCurrentTrip: (state) => {
      state.currentTrip = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadRoutes.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadRoutes.fulfilled, (state, action: PayloadAction<Route[]>) => {
        state.loading = false;
        state.routes = action.payload;
      })
      .addCase(loadRoutes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(planTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(planTrip.fulfilled, (state, action: PayloadAction<Trip>) => {
        state.loading = false;
        state.currentTrip = action.payload;
        state.routeOptions = action.payload.routeOptions;
      })
      .addCase(planTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getRouteDetails.fulfilled, (state, action: PayloadAction<Route>) => {
        state.selectedRoute = action.payload;
      });
  },
});

export const { clearRouteOptions, clearCurrentTrip } = routesSlice.actions;
export default routesSlice.reducer;
