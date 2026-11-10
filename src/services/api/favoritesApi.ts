import { Favorite } from "../../types";

export interface IFavoritesApi {
  getFavorites(): Promise<Favorite[]>;
  addFavorite(favorite: Favorite): Promise<void>;
  removeFavorite(id: string): Promise<void>;
}

export class FavoritesApi implements IFavoritesApi {
  async getFavorites(): Promise<Favorite[]> {
    const response = await api.get("/favorites");
    return response.data;
  }

  async addFavorite(favorite: Favorite): Promise<void> {
    await api.post("/favorites", favorite);
  }

  async removeFavorite(id: string): Promise<void> {
    await api.delete(`/favorites/${id}`);
  }
}

export class MockFavoritesApi implements IFavoritesApi {
  private favorites: Favorite[] = [];

  async getFavorites(): Promise<Favorite[]> {
    await new Promise<void>((resolve) => setTimeout(resolve, 300));
    return this.favorites;
  }

  async addFavorite(favorite: Favorite): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 300));
    this.favorites.push(favorite);
  }

  async removeFavorite(id: string): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 300));
    this.favorites = this.favorites.filter((f) => f.id !== id);
  }
}

import api from "./index";
export const favoritesApi: IFavoritesApi = new MockFavoritesApi();