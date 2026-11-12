import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Favorite, FavoritesState } from '../../types';
import { STORAGE_KEYS } from '../../config/constants';
import { favoritesApi } from '../../services/api/favoritesApi';
import { storage } from '../../services/storage';
import { getErrorMessage } from '../../utils/errors';
import type { RootState } from '../store';

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
    const stored = await storage.getJson<Favorite[]>(STORAGE_KEYS.FAVORITES);
    if (stored) {
      return stored;
    }
    const remote = await favoritesApi.getFavorites();
    if (remote.length > 0) {
      await storage.setJson(STORAGE_KEYS.FAVORITES, remote);
    }
    return remote;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to load your favorites.'),
    );
  }
});

export const addFavorite = createAsyncThunk<
  Favorite[],
  Omit<Favorite, 'id' | 'createdAt'>,
  { state: RootState; rejectValue: string }
>('favorites/add', async (favorite, { getState, rejectWithValue }) => {
  try {
    const newFavorite: Favorite = {
      ...favorite,
      id: `fav_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    await favoritesApi.addFavorite(newFavorite);
    const next = [...getState().favorites.items, newFavorite];
    await storage.setJson(STORAGE_KEYS.FAVORITES, next);
    return next;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to save this favorite.'),
    );
  }
});

export const removeFavorite = createAsyncThunk<
  Favorite[],
  string,
  { state: RootState; rejectValue: string }
>('favorites/remove', async (id, { getState, rejectWithValue }) => {
  try {
    await favoritesApi.removeFavorite(id);
    const next = getState().favorites.items.filter(item => item.id !== id);
    await storage.setJson(STORAGE_KEYS.FAVORITES, next);
    return next;
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
        state.items = action.payload;
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
        state.items = action.payload;
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unable to remove favorite.';
      });
  },
});

export default favoritesSlice.reducer;
