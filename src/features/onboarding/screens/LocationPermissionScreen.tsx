import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../../config/theme';
import { APP_NAME, STORAGE_KEYS } from '../../../config/constants';
import Screen from '../../../components/common/Screen';
import AppButton from '../../../components/buttons/AppButton';
import { useAppDispatch } from '../../../redux/hooks';
import {
  getCurrentLocation,
  setLocationAccessAllowed,
} from '../../../redux/slices/locationSlice';
import { openAppSettings } from '../../../services/location/deviceLocation';
import { storage } from '../../../services/storage';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'LocationPermission'>;

/**
 * First-run consent step. It explains why ByaheKo wants location before the
 * operating system asks for its own permission. The answer is stored so the
 * prompt is shown only once, on a fresh install.
 */
export const LocationPermissionScreen = ({ navigation, route }: Props) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const returnTo = route.params?.returnTo ?? 'Login';

  const continueToApp = async (allowed: boolean) => {
    await storage.setItem(STORAGE_KEYS.LOCATION_PROMPT_SEEN, 'true');
    await storage.setItem(
      STORAGE_KEYS.LOCATION_ACCESS_ALLOWED,
      allowed ? 'true' : 'false',
    );
    if (allowed) {
      dispatch(setLocationAccessAllowed(true));
    }
    navigation.reset({ index: 0, routes: [{ name: returnTo }] });
  };

  const allowLocation = async () => {
    setError(null);
    setBlocked(false);
    setRequesting(true);

    // The thunk asks for the OS permission and then reads the current fix.
    const result = await dispatch(getCurrentLocation());

    setRequesting(false);
    if (getCurrentLocation.fulfilled.match(result)) {
      await continueToApp(true);
      return;
    }

    setBlocked(result.payload?.status === 'blocked');
    setError(
      result.payload?.message ??
        'We could not access your location. You can keep going without it.',
    );
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <MaterialCommunityIcons
            name="bus-side"
            size={26}
            color={theme.colors.primary}
          />
          <Text
            variant="titleLarge"
            style={[styles.brand, { color: theme.colors.primary }]}
          >
            {APP_NAME}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={76}
            color={theme.colors.primary}
          />
        </View>
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          Use your location?
        </Text>
        <Text
          variant="bodyLarge"
          style={[
            styles.description,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          ByaheKo can use your location to show nearby boarding points and to
          plan trips from where you are. Coordinates stay on this device in this
          demonstration build.
        </Text>

        {error ? (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: theme.colors.errorContainer,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={20}
              color={theme.colors.onErrorContainer}
            />
            <Text
              variant="bodyMedium"
              style={[styles.errorText, { color: theme.colors.onErrorContainer }]}
            >
              {error}
            </Text>
            {blocked ? (
              <AppButton
                label="Open settings"
                mode="text"
                onPress={openAppSettings}
                accessibilityLabel="Open system settings"
              />
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <AppButton
          label="Allow location"
          onPress={allowLocation}
          icon="map-marker-check"
          loading={requesting}
          accessibilityLabel="Allow ByaheKo to use your location"
        />
        <AppButton
          label="Not now"
          mode="text"
          onPress={() => continueToApp(false)}
          disabled={requesting}
          accessibilityLabel="Continue without using location"
        />
        <Text
          variant="labelSmall"
          style={[styles.note, { color: theme.colors.onSurfaceVariant }]}
        >
          You can change the device permission anytime in system settings.
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 148,
    height: 148,
    borderRadius: 74,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 360,
  },
  errorBox: {
    marginTop: 24,
    padding: 14,
    gap: 4,
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 4,
  },
  note: {
    textAlign: 'center',
    marginTop: 8,
  },
});

export default LocationPermissionScreen;
