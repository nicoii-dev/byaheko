export const APP_NAME = 'ByaheKo';
export const APP_TAGLINE = 'Your Ride. Your Route. Your Journey.';

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@ByaheKo/auth_token',
  USER_DATA: '@ByaheKo/user_data',
  THEME: '@ByaheKo/theme',
  FAVORITES: '@ByaheKo/favorites',
  ONBOARDING_SEEN: '@ByaheKo/onboarding_seen',
} as const;

export const TRANSPORTATION_CATEGORIES = {
  JEEPNEY: 'jeepney',
  MODERN_JEEPNEY: 'modern_jeepney',
  MULTICAB: 'multicab',
  TRICYCLE: 'tricycle',
  BUS: 'bus',
  UV_EXPRESS: 'uv_express',
  VAN: 'van',
  FERRY: 'ferry',
  TRAIN: 'train',
} as const;

export const TRANSPORTATION_META: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  [TRANSPORTATION_CATEGORIES.JEEPNEY]: {
    label: 'Jeepney',
    icon: 'jeepney',
    color: '#F5B942',
  },
  [TRANSPORTATION_CATEGORIES.MODERN_JEEPNEY]: {
    label: 'Modern Jeepney',
    icon: 'bus',
    color: '#2ECC71',
  },
  [TRANSPORTATION_CATEGORIES.MULTICAB]: {
    label: 'Multicab',
    icon: 'car',
    color: '#3498DB',
  },
  [TRANSPORTATION_CATEGORIES.TRICYCLE]: {
    label: 'Tricycle',
    icon: 'motorcycle',
    color: '#E67E22',
  },
  [TRANSPORTATION_CATEGORIES.BUS]: {
    label: 'Bus',
    icon: 'bus',
    color: '#4A90D9',
  },
  [TRANSPORTATION_CATEGORIES.UV_EXPRESS]: {
    label: 'UV Express',
    icon: 'car',
    color: '#9B59B6',
  },
  [TRANSPORTATION_CATEGORIES.VAN]: {
    label: 'Van',
    icon: 'car',
    color: '#95A5A6',
  },
  [TRANSPORTATION_CATEGORIES.FERRY]: {
    label: 'Ferry',
    icon: 'ship',
    color: '#16A085',
  },
  [TRANSPORTATION_CATEGORIES.TRAIN]: {
    label: 'Train',
    icon: 'train',
    color: '#34495E',
  },
};

export const APP_VERSION = '1.0.0';