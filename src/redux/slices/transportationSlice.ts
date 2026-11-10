import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Transportation, BoardingPoint, TransportationState } from '../types';
import { transportationApi } from '../services/api/transportationApi';

const initialState: TransportationState = {
  categories: [],
  boardingPoints: [],
  selectedCategory: null,
  nearbyBoardingPoints: [],
  loading: false,
  error: null,
};

export const loadTransportationData = createAsyncThunk(
  'transportation/load',
  async (_, { rejectWithValue }) => {
    try {
      const [categories, boardingPoints] = await Promise.all([
        transportationApi.getCategories(),
        transportationApi.getBoardingPoints(),
      ]);
      return { categories, boardingPoints };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load transportation data');
    }
  }
);

export const loadNearbyBoardingPoints = createAsyncThunk(
  'transportation/nearby',
  async (
    { latitude, longitude, radiusKm = 2 }: { latitude: number; longitude: number; radiusKm?: number },
    { rejectWithValue }
  ) => {
    try {
      return await transportationApi.getNearbyBoardingPoints(
        latitude,
        longitude,
        radiusKm
      );
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load nearby boarding points');
    }
  }
);

const transportationSlice = createSlice({
  name: 'transportation',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    filterByCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
      if (action.payload) {
        state.nearbyBoardingPoints = state.nearbyBoardingPoints.filter((bp) =>
          bp.transportationTypes.includes(action.payload)
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTransportationData.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        loadTransportationData.fulfilled,
        (state, action: PayloadAction<{ categories: Transportation[]; boardingPoints: BoardingPoint[] }>) => {
          state.loading = false;
          state.categories = action.payload.categories;
          state.boardingPoints = action.payload.boardingPoints;
        }
      )
      .addCase(loadTransportationData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loadNearbyBoardingPoints.fulfilled, (state, action) => {
        state.nearbyBoardingPoints = action.payload;
      });
  },
});

export const { setSelectedCategory, filterByCategory } = transportationSlice.actions;
export default transportationSlice.reducer;