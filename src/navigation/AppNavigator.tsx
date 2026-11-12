import React from 'react';
import { StatusBar } from 'react-native';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppTheme } from '../config/theme';
import { useAppSelector } from '../redux/hooks';
import SplashScreen from '../features/onboarding/screens/SplashScreen';
import OnboardingScreen from '../features/onboarding/screens/OnboardingScreen';
import LoginScreen from '../features/auth/screens/LoginScreen';
import RegisterScreen from '../features/auth/screens/RegisterScreen';
import ForgotPasswordScreen from '../features/auth/screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../features/auth/screens/ResetPasswordScreen';
import VerifyEmailScreen from '../features/auth/screens/VerifyEmailScreen';
import LocationSearchScreen from '../features/routes/screens/LocationSearchScreen';
import RouteDetailsScreen from '../features/routes/screens/RouteDetailsScreen';
import NavigationScreen from '../features/routes/screens/NavigationScreen';
import BoardingPointDetailsScreen from '../features/routes/screens/BoardingPointDetailsScreen';
import NotificationsScreen from '../features/notifications/screens/NotificationsScreen';
import EditProfileScreen from '../features/profile/screens/EditProfileScreen';
import SettingsScreen from '../features/profile/screens/SettingsScreen';
import LegalScreen from '../features/profile/screens/LegalScreen';
import AboutScreen from '../features/profile/screens/AboutScreen';
import MainTabNavigator from './MainTabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const theme = useAppTheme();
  const themeMode = useAppSelector(state => state.theme.mode);
  const baseTheme =
    themeMode === 'dark' ? NavigationDarkTheme : NavigationDefaultTheme;

  const navigationTheme = {
    ...baseTheme,
    dark: themeMode === 'dark',
    colors: {
      ...baseTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.outline,
      notification: theme.colors.error,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
      />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
        />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen
          name="LocationSearch"
          component={LocationSearchScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="RouteDetails" component={RouteDetailsScreen} />
        <Stack.Screen name="Navigation" component={NavigationScreen} />
        <Stack.Screen
          name="BoardingPointDetails"
          component={BoardingPointDetailsScreen}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
        />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Legal" component={LegalScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
