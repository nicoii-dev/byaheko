export interface Location {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
  address?: string;
  name?: string;
}

export interface Transportation {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
}

export interface BoardingPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  transportationTypes: string[];
  routeIds: string[];
}

export interface RouteStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  sequence: number;
  stopType: 'boarding' | 'dropoff' | 'transfer';
}

export interface Route {
  id: string;
  routeCode: string;
  routeName: string;
  origin: string;
  destination: string;
  transportationType: string;
  stops: RouteStop[];
  fare: number;
  estimatedDuration: number;
  status: 'active' | 'inactive';
}

export interface RouteOption {
  id: string;
  summary: string;
  transportationTypes: string[];
  boardingPoint: BoardingPoint;
  dropoffPoint: BoardingPoint;
  transferPoints: BoardingPoint[];
  estimatedTravelTime: number;
  estimatedFare: number;
  walkingDistance: number;
  transfers: number;
  steps: TripStep[];
}

export interface TripStep {
  id: string;
  sequence: number;
  instruction: string;
  transportationType?: string;
  boardingPoint?: BoardingPoint;
  dropoffPoint?: BoardingPoint;
  distance?: number;
  duration?: number;
  fare?: number;
}

export interface Trip {
  id: string;
  origin: Location;
  destination: Location;
  routeOptions: RouteOption[];
  estimatedFare: number;
  estimatedDuration: number;
  transfers: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  avatar?: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  type: 'destination' | 'route' | 'boarding_point';
  name: string;
  data: Location | Route | BoardingPoint;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'advisory' | 'update' | 'saved_route' | 'announcement';
  timestamp: string;
  read: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LocationState {
  currentLocation: Location | null;
  selectedOrigin: Location | null;
  selectedDestination: Location | null;
  permissionStatus: 'granted' | 'denied' | 'blocked' | 'undetermined';
}

export interface ThemeState {
  mode: 'light' | 'dark';
}

export interface SettingsState {
  notificationEnabled: boolean;
  locationSharing: boolean;
  autoStartNavigation: boolean;
}

export interface FavoritesState {
  items: Favorite[];
  loading: boolean;
  error: string | null;
}

export interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export interface TransportationState {
  categories: Transportation[];
  boardingPoints: BoardingPoint[];
  selectedCategory: string | null;
  nearbyBoardingPoints: BoardingPoint[];
  loading: boolean;
  error: string | null;
}

export interface RoutesState {
  routes: Route[];
  routeOptions: RouteOption[];
  selectedRoute: Route | null;
  currentTrip: Trip | null;
  loading: boolean;
  error: string | null;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthRegistration {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}