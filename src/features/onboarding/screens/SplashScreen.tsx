import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../../config/theme';
import { APP_TAGLINE } from '../../../config/constants';
import AppLogo from '../../../components/common/AppLogo';
import Screen from '../../../components/common/Screen';
import { useAppDispatch } from '../../../redux/hooks';
import { restoreSession } from '../../../redux/slices/authSlice';
import { loadFavorites } from '../../../redux/slices/favoritesSlice';
import { loadSettings } from '../../../redux/slices/settingsSlice';
import { loadThemeMode } from '../../../redux/slices/themeSlice';
import { STORAGE_KEYS } from '../../../config/constants';
import { storage } from '../../../services/storage';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

/**
 * Boot screen. Restores the persisted session and decides whether the user
 * should see onboarding, sign in, verify their email, or the main app.
 */
export const SplashScreen = ({ navigation }: Props) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const [sessionResult, onboardingSeen] = await Promise.all([
        dispatch(restoreSession()),
        storage.getItem(STORAGE_KEYS.ONBOARDING_SEEN),
        dispatch(loadThemeMode()),
        dispatch(loadSettings()),
        dispatch(loadFavorites()),
      ]);

      // Keep the brand visible briefly so the transition does not flash.
      await new Promise<void>(resolve => setTimeout(resolve, 700));
      if (!active) {
        return;
      }

      const session = restoreSession.fulfilled.match(sessionResult)
        ? sessionResult.payload
        : null;

      if (session?.user) {
        if (session.user.isEmailVerified) {
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'VerifyEmail', params: { email: session.user.email } }],
          });
        }
        return;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: onboardingSeen === 'true' ? 'Login' : 'Onboarding' }],
      });
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [dispatch, navigation]);

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.content}>
        <AppLogo size="large" showTagline />
        <Text
          variant="bodyMedium"
          style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}
        >
          {APP_TAGLINE}
        </Text>
      </View>
      <View style={styles.footer}>
        <ActivityIndicator color={theme.colors.primary} />
        <Text
          variant="labelMedium"
          style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}
        >
          Preparing your journey…
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  tagline: {
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    gap: 10,
    paddingBottom: 48,
  },
  loadingText: {
    letterSpacing: 0.2,
  },
});

export default SplashScreen;
