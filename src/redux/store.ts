import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import locationReducer from './slices/locationSlice';
import themeReducer from './slices/themeSlice';
import favoritesReducer from './slices/favoritesSlice';
import notificationsReducer from './slices/notificationsSlice';
import transportationReducer from './slices/transportationSlice';
import routesReducer from './slices/routesSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
    theme: themeReducer,
    favorites: favoritesReducer,
    notifications: notificationsReducer,
    transportation: transportationReducer,
    routes: routesReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;