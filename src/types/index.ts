/**
 * Shared domain models for ByaheKo.
 *
 * These types are intentionally transport-agnostic so the same shapes can be
 * served by the mock services today and by a NestJS/Laravel API later.
 */

export type TransportationCategory =
  | 'jeepney'
  | 'modern_jeepney'
  | 'multicab'
  | 'tricycle'
  | 'bus'
  | 'uv_express'
  | 'van'
  | 'ferry'
  | 'train';

export type RouteStatus = 'active' | 'inactive' | 'suspended';

export type StopType = 'boarding' | 'dropoff' | 'transfer' | 'terminal';

export type FavoriteType = 'destination' | 'route' | 'boarding_point';

export type NotificationType =
  | 'advisory'
  | 'update'
  | 'saved_route'
  | 'announcement';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location extends Coordinates {
  id?: string;
  name?: string;
  address?: string;
  latitudeDelta?: number;
  longitudeDelta?: number;
}

export interface Transportation {
  id: string;
  name: string;
  category: TransportationCategory;
  icon: string;
  description: string;
}

export interface BoardingPoint extends Coordinates {
  id: string;
  name: string;
  address: string;
  transportationTypes: TransportationCategory[];
  routeIds: string[];
  description?: string;
}

export interface BoardingPointWithDistance extends BoardingPoint {
  distanceMeters: number;
}

export interface RouteStop extends Coordinates {
  id: string;
  name: string;
  sequence: number;
  stopType: StopType;
}

export interface Route {
  id: string;
  routeCode: string;
  routeName: string;
  origin: string;
  destination: string;
  transportationType: TransportationCategory;
  stops: RouteStop[];
  /** Demonstration fare in Philippine pesos. Replace with verified LTFRB data. */
  fare: number;
  /** Estimated duration in minutes. */
  estimatedDuration: number;
  status: RouteStatus;
  /** Indicates that the record is sample data, not a verified public route. */
  isDemoData?: boolean;
}

export interface TripStep {
  id: string;
  sequence: number;
  instruction: string;
  transportationType?: TransportationCategory;
  boardingPoint?: BoardingPoint;
  dropoffPoint?: BoardingPoint;
  /** Distance in metres. */
  distance?: number;
  /** Duration in minutes. */
  duration?: number;
  fare?: number;
  routeId?: string;
  routeName?: string;
}

export interface RouteOption {
  id: string;
  summary: string;
  transportationTypes: TransportationCategory[];
  boardingPoint: BoardingPoint;
  dropoffPoint: BoardingPoint;
  transferPoints: BoardingPoint[];
  /** Duration in minutes, including walking. */
  estimatedTravelTime: number;
  estimatedFare: number;
  /** Walking distance in metres. */
  walkingDistance: number;
  transfers: number;
  steps: TripStep[];
  routeIds: string[];
  isDemoData?: boolean;
  /** True when the suggestion is a walk-only option, not a transit route. */
  walkingOnly?: boolean;
}

export interface Trip {
  id: string;
  origin: Location;
  destination: Location;
  routeOptions: RouteOption[];
  estimatedFare: number;
  estimatedDuration: number;
  transfers: number;
  isDemoData?: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Favorite {
  id: string;
  type: FavoriteType;
  name: string;
  data: Location | Route | BoardingPoint;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'advisory' | 'announcement';
  publishedAt: string;
  isDemoData?: boolean;
}

export interface PopularRoute {
  id: string;
  routeId: string;
  label: string;
  origin: string;
  destination: string;
  transportationType: TransportationCategory;
  estimatedFare: number;
  estimatedDuration: number;
  isDemoData?: boolean;
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

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  mobileNumber: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
  pendingVerificationEmail: string | null;
}

export interface LocationState {
  currentLocation: Location | null;
  selectedOrigin: Location | null;
  selectedDestination: Location | null;
  permissionStatus: 'granted' | 'denied' | 'blocked' | 'undetermined';
  recentSearches: Location[];
  loading: boolean;
  error: string | null;
}

export interface ThemeState {
  mode: 'light' | 'dark';
}

export interface SettingsState {
  notificationEnabled: boolean;
  locationSharing: boolean;
  autoStartNavigation: boolean;
  isLoaded: boolean;
}

export interface FavoritesState {
  items: Favorite[];
  loading: boolean;
  error: string | null;
}

export interface NotificationsState {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export interface TransportationState {
  categories: Transportation[];
  boardingPoints: BoardingPoint[];
  selectedCategory: TransportationCategory | null;
  nearbyBoardingPoints: BoardingPointWithDistance[];
  announcements: Announcement[];
  popularRoutes: PopularRoute[];
  loading: boolean;
  error: string | null;
}

export interface RoutesState {
  routes: Route[];
  routeOptions: RouteOption[];
  selectedRouteOption: RouteOption | null;
  currentTrip: Trip | null;
  loading: boolean;
  error: string | null;
}
