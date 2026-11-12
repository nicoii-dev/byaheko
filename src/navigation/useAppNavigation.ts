import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigation } from './types';

/**
 * Root-level navigation helper. Tab screens are nested inside the root stack,
 * so this type gives them access to detail screens without repeating casts.
 */
export const useAppNavigation = (): RootStackNavigation =>
  useNavigation<RootStackNavigation>();
