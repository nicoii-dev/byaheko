import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { FavoriteType, TransportationCategory } from '../types';

export const selectAuth = (state: RootState) => state.auth;
export const selectLocation = (state: RootState) => state.location;
export const selectTransportation = (state: RootState) => state.transportation;
export const selectRoutes = (state: RootState) => state.routes;
export const selectFavorites = (state: RootState) => state.favorites;
export const selectNotifications = (state: RootState) => state.notifications;
export const selectSettings = (state: RootState) => state.settings;
export const selectThemeMode = (state: RootState) => state.theme.mode;

export const selectNearbyBoardingPoints = createSelector(
  [
    (state: RootState) => state.transportation.nearbyBoardingPoints,
    (state: RootState) => state.transportation.selectedCategory,
  ],
  (points, category) =>
    category
      ? points.filter(point => point.transportationTypes.includes(category))
      : points,
);

export const selectFavoritesByType = (type: FavoriteType | 'all') =>
  createSelector([selectFavorites], favorites =>
    type === 'all'
      ? favorites.items
      : favorites.items.filter(item => item.type === type),
  );

export const selectFavoriteForRoute = (routeId: string) =>
  createSelector([selectFavorites], favorites =>
    favorites.items.find(
      item =>
        item.type === 'route' &&
        'id' in item.data &&
        item.data.id === routeId,
    ),
  );

export const selectRoutesByCategory = (category: TransportationCategory | null) =>
  createSelector([selectRoutes], routes =>
    category
      ? routes.routes.filter(route => route.transportationType === category)
      : routes.routes,
  );
