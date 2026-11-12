import { Platform } from 'react-native';
import {
  MD3DarkTheme,
  MD3LightTheme,
  MD3Theme,
  configureFonts,
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';

/**
 * ByaheKo design tokens.
 *
 * The custom colours are layered on top of Material Design 3 so that Paper
 * components keep their expected colour roles while the app can also use
 * transport-specific and semantic colours.
 */
export interface AppColors {
  accent: string;
  success: string;
  warning: string;
  info: string;
  jeepney: string;
  modernJeepney: string;
  multicab: string;
  tricycle: string;
  bus: string;
  uvExpress: string;
  van: string;
  ferry: string;
  train: string;
  border: string;
  muted: string;
  overlay: string;
}

export interface AppSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface AppRadius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  pill: number;
}

export type AppTheme = Omit<MD3Theme, 'colors'> & {
  colors: MD3Theme['colors'] & AppColors;
  spacing: AppSpacing;
  radius: AppRadius;
};

/**
 * iOS resolves custom fonts by their PostScript name, while Android uses the
 * family name declared in the font. Both refer to the same bundled Nunito
 * file (see react-native.config.js).
 */
const fontConfig = {
  fontFamily: Platform.select({
    ios: 'Nunito-Regular',
    default: 'Nunito',
  }),
};

const fonts = configureFonts({
  config: {
    displayLarge: { ...fontConfig, fontWeight: '700' },
    displayMedium: { ...fontConfig, fontWeight: '700' },
    displaySmall: { ...fontConfig, fontWeight: '700' },
    headlineLarge: { ...fontConfig, fontWeight: '700' },
    headlineMedium: { ...fontConfig, fontWeight: '700' },
    headlineSmall: { ...fontConfig, fontWeight: '600' },
    titleLarge: { ...fontConfig, fontWeight: '700' },
    titleMedium: { ...fontConfig, fontWeight: '600' },
    titleSmall: { ...fontConfig, fontWeight: '600' },
    bodyLarge: { ...fontConfig, fontWeight: '400' },
    bodyMedium: { ...fontConfig, fontWeight: '400' },
    bodySmall: { ...fontConfig, fontWeight: '400' },
    labelLarge: { ...fontConfig, fontWeight: '600' },
    labelMedium: { ...fontConfig, fontWeight: '600' },
    labelSmall: { ...fontConfig, fontWeight: '500' },
  },
});

const sharedSpacing: AppSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

const sharedRadius: AppRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const lightTheme: AppTheme = {
  ...MD3LightTheme,
  roundness: 3,
  fonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#163D32',
    primaryContainer: '#D7E8DF',
    secondary: '#B8E65A',
    secondaryContainer: '#EAF7C9',
    tertiary: '#F5B942',
    tertiaryContainer: '#FCEBC4',
    background: '#F5F5F0',
    surface: '#FFFFFF',
    surfaceVariant: '#ECEDE7',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#163D32',
    onSecondary: '#163D32',
    onSecondaryContainer: '#163D32',
    onTertiary: '#3A2A00',
    onTertiaryContainer: '#3A2A00',
    onBackground: '#1F2937',
    onSurface: '#1F2937',
    onSurfaceVariant: '#667085',
    outline: '#D9DAD3',
    outlineVariant: '#E7E8E1',
    error: '#D92D20',
    errorContainer: '#FEE4E2',
    onError: '#FFFFFF',
    onErrorContainer: '#7A271A',
    inverseSurface: '#1F2937',
    inverseOnSurface: '#F5F5F0',
    inversePrimary: '#B8E65A',
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(15, 23, 42, 0.45)',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F7F8F4',
      level3: '#F2F4EE',
      level4: '#EFF1EA',
      level5: '#ECEEE7',
    },
    accent: '#F5B942',
    success: '#2E7D52',
    warning: '#B54708',
    info: '#175CD3',
    jeepney: '#F5B942',
    modernJeepney: '#2E7D52',
    multicab: '#3498DB',
    tricycle: '#E67E22',
    bus: '#4A90D9',
    uvExpress: '#9B59B6',
    van: '#667085',
    ferry: '#16A085',
    train: '#34495E',
    border: '#D9DAD3',
    muted: '#98A2B3',
    overlay: 'rgba(22, 61, 50, 0.08)',
  },
  spacing: sharedSpacing,
  radius: sharedRadius,
};

export const darkTheme: AppTheme = {
  ...MD3DarkTheme,
  roundness: 3,
  fonts,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#B8E65A',
    primaryContainer: '#244D3F',
    secondary: '#163D32',
    secondaryContainer: '#2C4A3D',
    tertiary: '#F5B942',
    tertiaryContainer: '#4A3A12',
    background: '#101713',
    surface: '#18221D',
    surfaceVariant: '#243029',
    onPrimary: '#10251E',
    onPrimaryContainer: '#D7E8DF',
    onSecondary: '#D7E8DF',
    onSecondaryContainer: '#D7E8DF',
    onTertiary: '#3A2A00',
    onTertiaryContainer: '#FCEBC4',
    onBackground: '#F2F4EE',
    onSurface: '#F2F4EE',
    onSurfaceVariant: '#A6B3AA',
    outline: '#3B4A41',
    outlineVariant: '#2A352E',
    error: '#F97066',
    errorContainer: '#55160C',
    onError: '#2A0A05',
    onErrorContainer: '#FEE4E2',
    inverseSurface: '#F2F4EE',
    inverseOnSurface: '#1F2937',
    inversePrimary: '#163D32',
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0, 0, 0, 0.6)',
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level0: 'transparent',
      level1: '#18221D',
      level2: '#1C2721',
      level3: '#202C25',
      level4: '#223028',
      level5: '#24332B',
    },
    accent: '#F5B942',
    success: '#66BB6A',
    warning: '#FDB022',
    info: '#84CAFF',
    jeepney: '#F5B942',
    modernJeepney: '#81C784',
    multicab: '#64B5F6',
    tricycle: '#FFB74D',
    bus: '#64B5F6',
    uvExpress: '#BA68C8',
    van: '#98A2B3',
    ferry: '#80CBC4',
    train: '#B0BEC5',
    border: '#3B4A41',
    muted: '#667085',
    overlay: 'rgba(184, 230, 90, 0.12)',
  },
  spacing: sharedSpacing,
  radius: sharedRadius,
};

/** Typed access to ByaheKo's extended theme. */
export const useAppTheme = (): AppTheme => useTheme() as AppTheme;
