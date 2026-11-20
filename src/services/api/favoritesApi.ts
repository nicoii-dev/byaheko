import type { Favorite, FavoriteType } from '../../types';
import { environment } from '../../config/environment';
import api from './client';
import { requireData } from '../../utils/apiData';
import { fetchAllPages } from './pagination';
import type {
  ApiFavorite,
  ApiFavoriteType,
  CreateFavoriteInput,
  ListParams,
} from './types';

export interface FavoriteInput {
  type: FavoriteType;
  targetId: string;
  label?: string;
}

export interface IFavoritesApi {
  getFavorites(params?: ListParams): Promise<Favorite[]>;
  getFavorite(id: string): Promise<Favorite>;
  addFavorite(input: FavoriteInput): Promise<Favorite>;
  updateFavorite(id: string, label: string): Promise<Favorite>;
  removeFavorite(id: string): Promise<void>;
}

const toUiType = (type: ApiFavoriteType): FavoriteType =>
  type.toLowerCase() as FavoriteType;

const toApiType = (type: FavoriteType): ApiFavoriteType =>
  type.toUpperCase() as ApiFavoriteType;

const mapFavorite = (row: ApiFavorite): Favorite => ({
  id: row.id,
  type: toUiType(row.type),
  targetId: row.targetId,
  label: row.label ?? undefined,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export class FavoritesApi implements IFavoritesApi {
  async getFavorites(params: ListParams = {}): Promise<Favorite[]> {
    const rows = await fetchAllPages<ApiFavorite>('/favorites', params);
    return rows.map(mapFavorite);
  }

  async getFavorite(id: string): Promise<Favorite> {
    const response = await api.get<ApiFavorite>(`/favorites/${id}`);
    return mapFavorite(requireData(response.data));
  }

  async addFavorite(input: FavoriteInput): Promise<Favorite> {
    const payload: CreateFavoriteInput = {
      type: toApiType(input.type),
      targetId: input.targetId,
      label: input.label,
    };
    const response = await api.post<ApiFavorite>('/favorites', payload);
    return mapFavorite(requireData(response.data));
  }

  async updateFavorite(id: string, label: string): Promise<Favorite> {
    const response = await api.patch<ApiFavorite>(`/favorites/${id}`, {
      label,
    });
    return mapFavorite(requireData(response.data));
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

  async getFavorite(id: string): Promise<Favorite> {
    const favorite = this.favorites.find(item => item.id === id);
    if (!favorite) {
      throw new Error('Favorite not found.');
    }
    return favorite;
  }

  async addFavorite(input: FavoriteInput): Promise<Favorite> {
    const now = new Date().toISOString();
    const favorite: Favorite = {
      id: `fav_${Date.now()}`,
      type: input.type,
      targetId: input.targetId,
      label: input.label,
      createdAt: now,
      updatedAt: now,
    };
    this.favorites.push(favorite);
    return favorite;
  }

  async updateFavorite(id: string, label: string): Promise<Favorite> {
    const favorite = await this.getFavorite(id);
    const updated = { ...favorite, label, updatedAt: new Date().toISOString() };
    this.favorites = this.favorites.map(item =>
      item.id === id ? updated : item,
    );
    return updated;
  }

  async removeFavorite(id: string): Promise<void> {
    this.favorites = this.favorites.filter(item => item.id !== id);
  }
}

export const favoritesApi: IFavoritesApi = environment.enableMockServices
  ? new MockFavoritesApi()
  : new FavoritesApi();
