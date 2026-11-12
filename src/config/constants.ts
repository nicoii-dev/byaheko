import type { TransportationCategory } from '../types';

export const APP_NAME = 'ByaheKo';
export const APP_TAGLINE = 'Your Ride. Your Route. Your Journey.';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@ByaheKo/auth_token',
  USER_DATA: '@ByaheKo/user_data',
  THEME: '@ByaheKo/theme',
  FAVORITES: '@ByaheKo/favorites',
  ONBOARDING_SEEN: '@ByaheKo/onboarding_seen',
  RECENT_SEARCHES: '@ByaheKo/recent_searches',
  SETTINGS: '@ByaheKo/settings',
} as const;

export const TRANSPORTATION_CATEGORIES: Record<
  Uppercase<TransportationCategory>,
  TransportationCategory
> = {
  JEEPNEY: 'jeepney',
  MODERN_JEEPNEY: 'modern_jeepney',
  MULTICAB: 'multicab',
  TRICYCLE: 'tricycle',
  BUS: 'bus',
  UV_EXPRESS: 'uv_express',
  VAN: 'van',
  FERRY: 'ferry',
  TRAIN: 'train',
};

export interface TransportationMeta {
  label: string;
  icon: string;
  color: string;
}

/**
 * Icon names target MaterialCommunityIcons. Category colours are resolved from
 * the active theme at render time where possible; these values are fallbacks
 * for map markers and non-themed surfaces.
 */
export const TRANSPORTATION_META: Record<
  TransportationCategory,
  TransportationMeta
> = {
  jeepney: { label: 'Jeepney', icon: 'bus-side', color: '#F5B942' },
  modern_jeepney: {
    label: 'Modern Jeepney',
    icon: 'bus-electric',
    color: '#2E7D52',
  },
  multicab: { label: 'Multicab', icon: 'car-estate', color: '#3498DB' },
  tricycle: { label: 'Tricycle', icon: 'motorbike', color: '#E67E22' },
  bus: { label: 'Bus', icon: 'bus', color: '#4A90D9' },
  uv_express: { label: 'UV Express', icon: 'van-passenger', color: '#9B59B6' },
  van: { label: 'Van', icon: 'van-utility', color: '#667085' },
  ferry: { label: 'Ferry', icon: 'ferry', color: '#16A085' },
  train: { label: 'Train', icon: 'train', color: '#34495E' },
};

export const TRANSPORTATION_CATEGORY_LIST: TransportationCategory[] = [
  'jeepney',
  'modern_jeepney',
  'multicab',
  'tricycle',
  'bus',
  'uv_express',
  'van',
  'ferry',
  'train',
];

export const DEFAULT_MAP_DELTA = {
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
} as const;

/** Average walking pace used by the trip planner, in metres per minute. */
export const WALKING_SPEED_METERS_PER_MINUTE = 80;

/** Maximum walk from a searched place to a boarding point. */
export const MAX_BOARDING_WALK_METERS = 1200;

/** Maximum walk between two routes when suggesting a transfer. */
export const MAX_TRANSFER_WALK_METERS = 500;

/** Radius used when listing nearby boarding points. */
export const NEARBY_RADIUS_KM = 3;

export const DEMO_ACCOUNT = {
  email: 'juan@example.com',
  password: 'Password123!',
} as const;

export const DEMO_VERIFICATION_CODE = '123456';

export const PAGE_SIZE = 20;
