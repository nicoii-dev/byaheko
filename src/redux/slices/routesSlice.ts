import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  Location,
  Route,
  RouteOption,
  RoutesState,
  Trip,
} from '../../types';
import { routesApi } from '../../services/api/routesApi';
import { getErrorMessage } from '../../utils/errors';

const initialState: RoutesState = {
  routes: [],
  routeOptions: [],
  selectedRouteOption: null,
  currentTrip: null,
  loading: false,
  error: null,
};

export const loadRoutes = createAsyncThunk<
  Route[],
  void,
  { rejectValue: string }
>('routes/load', async (_, { rejectWithValue }) => {
  try {
    return await routesApi.getRoutes();
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Unable to load routes.'));
  }
});

export const planTrip = createAsyncThunk<
  Trip,
  { origin: Location; destination: Location },
  { rejectValue: string }
>('routes/planTrip', async ({ origin, destination }, { rejectWithValue }) => {
  try {
    return await routesApi.planTrip(origin, destination);
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to plan this trip.'),
    );
  }
});

const routesSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    setSelectedRouteOption: (
      state,
      action: PayloadAction<RouteOption | null>,
    ) => {
      state.selectedRouteOption = action.payload;
    },
    clearRouteOptions: state => {
      state.routeOptions = [];
      state.currentTrip = null;
      state.selectedRouteOption = null;
    },
    clearRoutesError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadRoutes.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadRoutes.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload;
      })
      .addCase(loadRoutes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unable to load routes.';
      })
      .addCase(planTrip.pending, state => {
        state.loading = true;
        state.error = null;
        state.routeOptions = [];
        state.currentTrip = null;
      })
      .addCase(planTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTrip = action.payload;
        state.routeOptions = action.payload.routeOptions;
      })
      .addCase(planTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unable to plan this trip.';
      });
  },
});

export const { setSelectedRouteOption, clearRouteOptions, clearRoutesError } =
  routesSlice.actions;
export default routesSlice.reducer;
