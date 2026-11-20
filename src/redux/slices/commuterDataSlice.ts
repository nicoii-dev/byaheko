import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { advisoriesApi } from '../../services/api/advisoriesApi';
import { announcementsApi } from '../../services/api/announcementsApi';
import { boardingPointsApi } from '../../services/api/boardingPointsApi';
import { faresApi } from '../../services/api/faresApi';
import { getErrorMessage } from '../../utils/errors';
import type {
  ApiAdvisory,
  ApiAnnouncement,
  ApiBoardingPoint,
  ApiFare,
} from '../../services/api/types';

interface ResourceState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
}

export interface CommuterDataState {
  fares: ResourceState<ApiFare>;
  announcements: ResourceState<ApiAnnouncement>;
  advisories: ResourceState<ApiAdvisory>;
  boardingPoints: ResourceState<ApiBoardingPoint>;
}

const emptyResource = <T>(): ResourceState<T> => ({
  items: [],
  loading: false,
  error: null,
});

const initialState: CommuterDataState = {
  fares: emptyResource<ApiFare>(),
  announcements: emptyResource<ApiAnnouncement>(),
  advisories: emptyResource<ApiAdvisory>(),
  boardingPoints: emptyResource<ApiBoardingPoint>(),
};

export const loadFares = createAsyncThunk<
  ApiFare[],
  void,
  { rejectValue: string }
>('commuterData/fares', async (_, { rejectWithValue }) => {
  try {
    return await faresApi.getFares();
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to load fares right now.'),
    );
  }
});

export const loadAnnouncements = createAsyncThunk<
  ApiAnnouncement[],
  void,
  { rejectValue: string }
>('commuterData/announcements', async (_, { rejectWithValue }) => {
  try {
    return await announcementsApi.getAnnouncements();
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to load announcements right now.'),
    );
  }
});

export const loadAdvisories = createAsyncThunk<
  ApiAdvisory[],
  void,
  { rejectValue: string }
>('commuterData/advisories', async (_, { rejectWithValue }) => {
  try {
    return await advisoriesApi.getAdvisories();
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to load service advisories right now.'),
    );
  }
});

export const loadBoardingPoints = createAsyncThunk<
  ApiBoardingPoint[],
  void,
  { rejectValue: string }
>('commuterData/boardingPoints', async (_, { rejectWithValue }) => {
  try {
    return await boardingPointsApi.getBoardingPoints();
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to load boarding points right now.'),
    );
  }
});

const commuterDataSlice = createSlice({
  name: 'commuterData',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadFares.pending, state => {
        state.fares.loading = true;
        state.fares.error = null;
      })
      .addCase(loadFares.fulfilled, (state, action) => {
        state.fares.loading = false;
        state.fares.items = action.payload;
      })
      .addCase(loadFares.rejected, (state, action) => {
        state.fares.loading = false;
        state.fares.error = action.payload ?? 'Unable to load fares.';
      })
      .addCase(loadAnnouncements.pending, state => {
        state.announcements.loading = true;
        state.announcements.error = null;
      })
      .addCase(loadAnnouncements.fulfilled, (state, action) => {
        state.announcements.loading = false;
        state.announcements.items = action.payload;
      })
      .addCase(loadAnnouncements.rejected, (state, action) => {
        state.announcements.loading = false;
        state.announcements.error =
          action.payload ?? 'Unable to load announcements.';
      })
      .addCase(loadAdvisories.pending, state => {
        state.advisories.loading = true;
        state.advisories.error = null;
      })
      .addCase(loadAdvisories.fulfilled, (state, action) => {
        state.advisories.loading = false;
        state.advisories.items = action.payload;
      })
      .addCase(loadAdvisories.rejected, (state, action) => {
        state.advisories.loading = false;
        state.advisories.error = action.payload ?? 'Unable to load advisories.';
      })
      .addCase(loadBoardingPoints.pending, state => {
        state.boardingPoints.loading = true;
        state.boardingPoints.error = null;
      })
      .addCase(loadBoardingPoints.fulfilled, (state, action) => {
        state.boardingPoints.loading = false;
        state.boardingPoints.items = action.payload;
      })
      .addCase(loadBoardingPoints.rejected, (state, action) => {
        state.boardingPoints.loading = false;
        state.boardingPoints.error =
          action.payload ?? 'Unable to load boarding points.';
      });
  },
});

export default commuterDataSlice.reducer;
