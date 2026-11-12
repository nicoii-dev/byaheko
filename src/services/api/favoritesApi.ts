import type { Favorite } from '../../types';
import { environment } from '../../config/environment';
import api from './client';

export interface IFavoritesApi {
  getFavorites(): Promise<Favorite[]>;
  addFavorite(favorite: Favorite): Promise<void>;
  removeFavorite(id: string): Promise<void>;
}

export class FavoritesApi implements IFavoritesApi {
  async getFavorites(): Promise<Favorite[]> {
    const response = await api.get<Favorite[]>('/favorites');
    return response.data;
  }

  async addFavorite(favorite: Favorite): Promise<void> {
    await api.post('/favorites', favorite);
  }

  async removeFavorite(id: string): Promise<void> {
    await api.delete(`/favorites/${id}`);
  }
}

class MockFavoritesApi implements IFavoritesApi {
  private favorites: Favorite[] = [];

  async getFavorites(): Promise<Favorite[]> {
    return this.favorites;
  }

  async addFavorite(favorite: Favorite): Promise<void> {
    this.favorites.push(favorite);
  }

  async removeFavorite(id: string): Promise<void> {
    this.favorites = this.favorites.filter(item => item.id !== id);
  }
}

export const favoritesApi: IFavoritesApi = environment.enableMockServices
  ? new MockFavoritesApi()
  : new FavoritesApi();
