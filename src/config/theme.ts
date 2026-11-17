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
    primary: '#032865',
    primaryContainer: '#D8ECFB',
    secondary: '#FCCD10',
    secondaryContainer: '#FFF3C4',
    tertiary: '#1E9EF9',
    tertiaryContainer: '#D6EEFE',
    background: '#F7FAFD',
    surface: '#FFFFFF',
    surfaceVariant: '#E6EFF8',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#032865',
    onSecondary: '#2B2100',
    onSecondaryContainer: '#4A3A00',
    onTertiary: '#032865',
    onTertiaryContainer: '#032865',
    onBackground: '#0B1F33',
    onSurface: '#0B1F33',
    onSurfaceVariant: '#506478',
    outline: '#C6D7E7',
    outlineVariant: '#DDE8F2',
    error: '#D92D20',
    errorContainer: '#FEE4E2',
    onError: '#FFFFFF',
    onErrorContainer: '#7A271A',
    inverseSurface: '#0B1F33',
    inverseOnSurface: '#F7FAFD',
    inversePrimary: '#69CCFC',
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(3, 40, 101, 0.45)',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F4F9FE',
      level3: '#EFF6FD',
      level4: '#EBF3FC',
      level5: '#E7F0FB',
    },
    accent: '#FCCD10',
    success: '#2E7D52',
    warning: '#B54708',
    info: '#1E9EF9',
    jeepney: '#FCCD10',
    modernJeepney: '#0B63B8',
    multicab: '#69CCFC',
    tricycle: '#E67E22',
    bus: '#1E9EF9',
    uvExpress: '#9B59B6',
    van: '#506478',
    ferry: '#16A085',
    train: '#032865',
    border: '#C6D7E7',
    muted: '#8FA6BA',
    overlay: 'rgba(3, 40, 101, 0.08)',
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
    primary: '#69CCFC',
    primaryContainer: '#0A3C72',
    secondary: '#FCCD10',
    secondaryContainer: '#4A3A00',
    tertiary: '#1E9EF9',
    tertiaryContainer: '#0A2E52',
    background: '#06101C',
    surface: '#0B1A2B',
    surfaceVariant: '#16283B',
    onPrimary: '#032865',
    onPrimaryContainer: '#D8ECFB',
    onSecondary: '#2B2100',
    onSecondaryContainer: '#FFF3C4',
    onTertiary: '#032865',
    onTertiaryContainer: '#D6EEFE',
    onBackground: '#E8F1FA',
    onSurface: '#E8F1FA',
    onSurfaceVariant: '#9FB4C7',
    outline: '#2C4560',
    outlineVariant: '#1C3147',
    error: '#F97066',
    errorContainer: '#55160C',
    onError: '#2A0A05',
    onErrorContainer: '#FEE4E2',
    inverseSurface: '#E8F1FA',
    inverseOnSurface: '#0B1F33',
    inversePrimary: '#032865',
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0, 0, 0, 0.6)',
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level0: 'transparent',
      level1: '#0B1A2B',
      level2: '#0F2033',
      level3: '#13263B',
      level4: '#162A41',
      level5: '#192E47',
    },
    accent: '#FCCD10',
    success: '#66BB6A',
    warning: '#FDB022',
    info: '#69CCFC',
    jeepney: '#FCCD10',
    modernJeepney: '#69CCFC',
    multicab: '#A5DDFE',
    tricycle: '#FFB74D',
    bus: '#69CCFC',
    uvExpress: '#C39BE8',
    van: '#9FB4C7',
    ferry: '#6FD6C4',
    train: '#A7C6E5',
    border: '#2C4560',
    muted: '#8FA6BA',
    overlay: 'rgba(252, 205, 16, 0.12)',
  },
  spacing: sharedSpacing,
  radius: sharedRadius,
};

/** Typed access to ByaheKo's extended theme. */
export const useAppTheme = (): AppTheme => useTheme() as AppTheme;
