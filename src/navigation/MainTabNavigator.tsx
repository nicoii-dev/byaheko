import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAppSelector } from "../redux/hooks";
import { lightTheme, darkTheme } from "../config/theme";
import { useAppDispatch } from "../redux/hooks";
import { checkAuthStatus } from "../redux/slices/authSlice";
import { loadFavorites } from "../redux/slices/favoritesSlice";
import { loadNotifications } from "../redux/slices/notificationsSlice";
import { loadTransportationData } from "../redux/slices/transportationSlice";
import { loadRoutes } from "../redux/slices/routesSlice";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.theme.mode);
  const theme = themeMode === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    dispatch(checkAuthStatus());
    dispatch(loadFavorites());
    dispatch(loadNotifications());
    dispatch(loadTransportationData());
    dispatch(loadRoutes());
  }, [dispatch]);

  const HomeScreen = React.lazy(() => import("../screens/home/HomeScreen"));
  const ExploreScreen = React.lazy(() => import("../screens/explore/ExploreScreen"));
  const TripPlannerScreen = React.lazy(() => import("../screens/trip-planner/TripPlannerScreen"));
  const FavoritesScreen = React.lazy(() => import("../screens/favorites/FavoritesScreen"));
  const ProfileScreen = React.lazy(() => import("../screens/profile/ProfileScreen"));

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: "#fff",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          headerTitle: "ByaheKo",
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ tabBarLabel: "Explore" }}
      />
      <Tab.Screen
        name="PlanTrip"
        component={TripPlannerScreen}
        options={{ tabBarLabel: "Plan Trip" }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ tabBarLabel: "Favorites" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;