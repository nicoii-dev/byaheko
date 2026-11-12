import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../../config/theme';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  loadSettings,
  saveSettings,
} from '../../../redux/slices/settingsSlice';
import { openAppSettings } from '../../../services/location/deviceLocation';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

interface SettingRowProps {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const SettingRow = ({
  icon,
  title,
  description,
  value,
  onValueChange,
}: SettingRowProps) => {
  const theme = useAppTheme();
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: theme.colors.primaryContainer },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.rowBody}>
        <Text
          variant="titleSmall"
          style={{ color: theme.colors.onSurface }}
        >
          {title}
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        color={theme.colors.primary}
        accessibilityLabel={title}
      />
    </View>
  );
};

export const SettingsScreen = ({ navigation }: Props) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(state => state.settings);
  const permissionStatus = useAppSelector(
    state => state.location.permissionStatus,
  );

  useEffect(() => {
    if (!settings.isLoaded) {
      dispatch(loadSettings());
    }
  }, [dispatch, settings.isLoaded]);

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title="Settings"
        subtitle="App behaviour and privacy"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text
          variant="labelLarge"
          style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}
        >
          NOTIFICATIONS
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <SettingRow
            icon="bell-outline"
            title="Service notifications"
            description="Advisories and route updates (demonstration only)."
            value={settings.notificationEnabled}
            onValueChange={value =>
              dispatch(saveSettings({ notificationEnabled: value }))
            }
          />
        </View>

        <Text
          variant="labelLarge"
          style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}
        >
          LOCATION
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <SettingRow
            icon="crosshairs-gps"
            title="Location sharing"
            description="Remember that you prefer using your current location."
            value={settings.locationSharing}
            onValueChange={value =>
              dispatch(saveSettings({ locationSharing: value }))
            }
          />
          <View
            style={[styles.divider, { backgroundColor: theme.colors.outline }]}
          />
          <TouchableOpacity
            onPress={openAppSettings}
            style={styles.row}
            accessibilityRole="button"
            accessibilityLabel="Open device settings"
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
            >
              <MaterialCommunityIcons
                name="cog-outline"
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.rowBody}>
              <Text
                variant="titleSmall"
                style={{ color: theme.colors.onSurface }}
              >
                Device location permission
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Current status: {permissionStatus}. Open device settings to
                change it.
              </Text>
            </View>
            <MaterialCommunityIcons
              name="open-in-new"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>

        <Text
          variant="labelLarge"
          style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}
        >
          NAVIGATION
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <SettingRow
            icon="navigation-variant-outline"
            title="Auto-start guidance"
            description="Open trip guidance as soon as you choose a route option."
            value={settings.autoStartNavigation}
            onValueChange={value =>
              dispatch(saveSettings({ autoStartNavigation: value }))
            }
          />
        </View>

        <View
          style={[
            styles.note,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <MaterialCommunityIcons
            name="shield-lock-outline"
            size={18}
            color={theme.colors.primary}
          />
          <Text
            variant="bodySmall"
            style={[styles.flex, { color: theme.colors.onSurfaceVariant }]}
          >
            Preferences are stored on this device with AsyncStorage. No account
            data is sent to a server in this demonstration build.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionLabel: {
    letterSpacing: 0.6,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 64,
  },
  note: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 14,
    padding: 12,
    marginTop: 20,
    alignItems: 'flex-start',
  },
  flex: {
    flex: 1,
  },
});

export default SettingsScreen;
