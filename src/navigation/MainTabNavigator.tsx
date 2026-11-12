import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../config/theme';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { loadFavorites } from '../redux/slices/favoritesSlice';
import { loadNotifications } from '../redux/slices/notificationsSlice';
import { loadTransportationData } from '../redux/slices/transportationSlice';
import { loadRoutes } from '../redux/slices/routesSlice';
import { loadRecentSearches } from '../redux/slices/locationSlice';
import HomeScreen from '../features/home/screens/HomeScreen';
import ExploreScreen from '../features/explore/screens/ExploreScreen';
import TripPlannerScreen from '../features/trip-planner/screens/TripPlannerScreen';
import FavoritesScreen from '../features/favorites/screens/FavoritesScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  Home: 'home-variant-outline',
  Explore: 'map-search-outline',
  PlanTrip: 'map-marker-path',
  Favorites: 'heart-outline',
  Profile: 'account-circle-outline',
};

const TAB_ACTIVE_ICONS: Record<keyof MainTabParamList, string> = {
  Home: 'home-variant',
  Explore: 'map-search',
  PlanTrip: 'map-marker-path',
  Favorites: 'heart',
  Profile: 'account-circle',
};

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
}

const TabIcon = ({
  routeName,
  focused,
  color,
  size,
}: TabIconProps & { routeName: keyof MainTabParamList }) => (
  <MaterialCommunityIcons
    name={focused ? TAB_ACTIVE_ICONS[routeName] : TAB_ICONS[routeName]}
    size={size}
    color={color}
  />
);

const renderHomeIcon = (props: TabIconProps) => (
  <TabIcon routeName="Home" {...props} />
);
const renderExploreIcon = (props: TabIconProps) => (
  <TabIcon routeName="Explore" {...props} />
);
const renderPlanTripIcon = (props: TabIconProps) => (
  <TabIcon routeName="PlanTrip" {...props} />
);
const renderFavoritesIcon = (props: TabIconProps) => (
  <TabIcon routeName="Favorites" {...props} />
);
const renderProfileIcon = (props: TabIconProps) => (
  <TabIcon routeName="Profile" {...props} />
);

export const MainTabNavigator = () => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const unreadCount = useAppSelector(
    state => state.notifications.unreadCount,
  );
  const notificationEnabled = useAppSelector(
    state => state.settings.notificationEnabled,
  );

  useEffect(() => {
    dispatch(loadFavorites());
    dispatch(loadNotifications());
    dispatch(loadTransportationData());
    dispatch(loadRoutes());
    dispatch(loadRecentSearches());
  }, [dispatch]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarBadge:
          route.name === 'Home' && notificationEnabled && unreadCount > 0
            ? unreadCount > 9
              ? '9+'
              : unreadCount
            : undefined,
        tabBarBadgeStyle: {
          backgroundColor: theme.colors.error,
          color: theme.colors.onError,
          fontSize: 10,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: renderHomeIcon }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ tabBarLabel: 'Explore', tabBarIcon: renderExploreIcon }}
      />
      <Tab.Screen
        name="PlanTrip"
        component={TripPlannerScreen}
        options={{ tabBarLabel: 'Plan Trip', tabBarIcon: renderPlanTripIcon }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ tabBarLabel: 'Favorites', tabBarIcon: renderFavoritesIcon }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: renderProfileIcon }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
