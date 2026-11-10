import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Favorite, FavoritesState } from '../../types';
import { STORAGE_KEYS } from '../../config/constants';
import { storage } from '../../services/storage';
import { favoritesApi } from '../../services/api/favoritesApi';

const initialState: FavoritesState = {
  items: [],
  loading: false,
  error: null,
};

export const loadFavorites = createAsyncThunk(
  'favorites/load',
  async (_, { rejectWithValue }) => {
    try {
      const stored = await storage.getItem(STORAGE_KEYS.FAVORITES);
      if (stored) {
        return JSON.parse(stored) as Favorite[];
      }
      return await favoritesApi.getFavorites();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load favorites');
    }
  }
);

export const addFavorite = createAsyncThunk<Favorite, Omit<Favorite, 'id' | 'createdAt'>>(
  'favorites/add',
  async (favorite, { rejectWithValue }) => {
    try {
      const newFavorite: Favorite = {
        ...favorite,
        id: `fav_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      await favoritesApi.addFavorite(newFavorite);
      return newFavorite;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add favorite');
    }
  }
);

export const removeFavorite = createAsyncThunk<string, string>(
  'favorites/remove',
  async (id, { rejectWithValue }) => {
    try {
      await favoritesApi.removeFavorite(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove favorite');
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadFavorites.fulfilled, (state, action: PayloadAction<Favorite[]>) => {
        state.loading = false;
        state.items = action.payload;
        storage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(action.payload));
      })
      .addCase(loadFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addFavorite.fulfilled, (state, action: PayloadAction<Favorite>) => {
        state.items.push(action.payload);
        storage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(state.items));
      })
      .addCase(removeFavorite.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        storage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(state.items));
      });
  },
});

export default favoritesSlice.reducer;