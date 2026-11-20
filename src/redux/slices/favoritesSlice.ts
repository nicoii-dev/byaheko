import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Favorite, FavoritesState } from '../../types';
import {
  favoritesApi,
  type FavoriteInput,
} from '../../services/api/favoritesApi';
import { getErrorMessage } from '../../utils/errors';

const initialState: FavoritesState = {
  items: [],
  loading: false,
  error: null,
};

export const loadFavorites = createAsyncThunk<
  Favorite[],
  void,
  { rejectValue: string }
>('favorites/load', async (_, { rejectWithValue }) => {
  try {
    return await favoritesApi.getFavorites();
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to load your favorites.'),
    );
  }
});

export const addFavorite = createAsyncThunk<
  Favorite,
  FavoriteInput,
  { rejectValue: string }
>('favorites/add', async (favorite, { rejectWithValue }) => {
  try {
    return await favoritesApi.addFavorite(favorite);
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to save this favorite.'),
    );
  }
});

export const removeFavorite = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('favorites/remove', async (id, { rejectWithValue }) => {
  try {
    await favoritesApi.removeFavorite(id);
    return id;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to remove this favorite.'),
    );
  }
});

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadFavorites.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unable to load favorites.';
      })
      .addCase(addFavorite.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.items.some(item => item.id === action.payload.id)) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(addFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unable to save favorite.';
      })
      .addCase(removeFavorite.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unable to remove favorite.';
      });
  },
});

export default favoritesSlice.reducer;
