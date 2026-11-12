import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  Announcement,
  BoardingPoint,
  BoardingPointWithDistance,
  Location,
  PopularRoute,
  Transportation,
  TransportationCategory,
  TransportationState,
} from '../../types';
import { transportationApi } from '../../services/api/transportationApi';
import { NEARBY_RADIUS_KM } from '../../config/constants';
import { getErrorMessage } from '../../utils/errors';

const initialState: TransportationState = {
  categories: [],
  boardingPoints: [],
  selectedCategory: null,
  nearbyBoardingPoints: [],
  announcements: [],
  popularRoutes: [],
  loading: false,
  error: null,
};

interface TransportationPayload {
  categories: Transportation[];
  boardingPoints: BoardingPoint[];
  announcements: Announcement[];
  popularRoutes: PopularRoute[];
}

export const loadTransportationData = createAsyncThunk<
  TransportationPayload,
  void,
  { rejectValue: string }
>('transportation/load', async (_, { rejectWithValue }) => {
  try {
    const [categories, boardingPoints, announcements, popularRoutes] =
      await Promise.all([
        transportationApi.getCategories(),
        transportationApi.getBoardingPoints(),
        transportationApi.getAnnouncements(),
        transportationApi.getPopularRoutes(),
      ]);
    return { categories, boardingPoints, announcements, popularRoutes };
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to load transportation data.'),
    );
  }
});

export const loadNearbyBoardingPoints = createAsyncThunk<
  BoardingPointWithDistance[],
  { location: Location; radiusKm?: number },
  { rejectValue: string }
>(
  'transportation/loadNearby',
  async ({ location, radiusKm = NEARBY_RADIUS_KM }, { rejectWithValue }) => {
    try {
      return await transportationApi.getNearbyBoardingPoints(
        location,
        radiusKm,
      );
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Unable to load nearby boarding points.'),
      );
    }
  },
);

const transportationSlice = createSlice({
  name: 'transportation',
  initialState,
  reducers: {
    setSelectedCategory: (
      state,
      action: PayloadAction<TransportationCategory | null>,
    ) => {
      state.selectedCategory = action.payload;
    },
    clearTransportationError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadTransportationData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTransportationData.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.boardingPoints = action.payload.boardingPoints;
        state.announcements = action.payload.announcements;
        state.popularRoutes = action.payload.popularRoutes;
      })
      .addCase(loadTransportationData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? 'Unable to load transportation data.';
      })
      .addCase(loadNearbyBoardingPoints.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadNearbyBoardingPoints.fulfilled, (state, action) => {
        state.loading = false;
        state.nearbyBoardingPoints = action.payload;
      })
      .addCase(loadNearbyBoardingPoints.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? 'Unable to load nearby boarding points.';
      });
  },
});

export const { setSelectedCategory, clearTransportationError } =
  transportationSlice.actions;
export default transportationSlice.reducer;
