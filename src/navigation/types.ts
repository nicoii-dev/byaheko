import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  PlanTrip: undefined;
  Favorites: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  VerifyEmail: { email: string };
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  LocationSearch: {
    field: 'origin' | 'destination';
    title?: string;
    returnTo?: 'planner' | 'back';
  };
  RouteDetails: { optionId?: string; routeId?: string } | undefined;
  Navigation: { optionId?: string } | undefined;
  BoardingPointDetails: { boardingPointId: string };
  Notifications: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Legal: { type: 'privacy' | 'terms' };
  About: undefined;
};

export type RootStackNavigation = NativeStackNavigationProp<RootStackParamList>;
export type MainTabNavigation = BottomTabNavigationProp<MainTabParamList>;
