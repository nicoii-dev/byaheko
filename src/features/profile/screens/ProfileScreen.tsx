import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../../config/theme';
import { APP_NAME, APP_VERSION } from '../../../config/constants';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { logout } from '../../../redux/slices/authSlice';
import { setThemeMode } from '../../../redux/slices/themeSlice';
import { useAppNavigation } from '../../../navigation/useAppNavigation';
import { getInitials } from '../../../utils/geo';

interface MenuRowProps {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: number;
  destructive?: boolean;
}

const MenuRow = ({ icon, label, onPress, badge, destructive }: MenuRowProps) => {
  const theme = useAppTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.menuRow}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.menuIcon,
          {
            backgroundColor: destructive
              ? theme.colors.errorContainer
              : theme.colors.primaryContainer,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={destructive ? theme.colors.error : theme.colors.primary}
        />
      </View>
      <Text
        variant="bodyLarge"
        style={[
          styles.flex,
          {
            color: destructive ? theme.colors.error : theme.colors.onSurface,
          },
        ]}
      >
        {label}
      </Text>
      {badge && badge > 0 ? (
        <View
          style={[styles.badge, { backgroundColor: theme.colors.error }]}
        >
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={theme.colors.onSurfaceVariant}
      />
    </TouchableOpacity>
  );
};

export const ProfileScreen = () => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const navigation = useAppNavigation();
  const user = useAppSelector(state => state.auth.user);
  const themeMode = useAppSelector(state => state.theme.mode);
  const unreadCount = useAppSelector(
    state => state.notifications.unreadCount,
  );
  const notificationEnabled = useAppSelector(
    state => state.settings.notificationEnabled,
  );

  const confirmLogout = () => {
    Alert.alert(
      'Sign out?',
      'Your saved favorites will stay on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await dispatch(logout());
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ],
    );
  };

  const toggleTheme = () => {
    dispatch(setThemeMode(themeMode === 'dark' ? 'light' : 'dark'));
  };

  return (
    <Screen edges={['top']}>
      <ScreenHeader title="Profile" subtitle="Account and app preferences" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text
              variant="headlineSmall"
              style={[styles.bold, { color: theme.colors.onPrimary }]}
            >
              {getInitials(user?.firstName, user?.lastName)}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text
              variant="titleLarge"
              style={[styles.bold, { color: theme.colors.onSurface }]}
            >
              {user ? `${user.firstName} ${user.lastName}` : 'ByaheKo traveller'}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {user?.email ?? 'Not signed in'}
            </Text>
            {user?.mobileNumber ? (
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {user.mobileNumber}
              </Text>
            ) : null}
            <View style={styles.verifiedRow}>
              <MaterialCommunityIcons
                name={
                  user?.isEmailVerified
                    ? 'check-decagram'
                    : 'alert-circle-outline'
                }
                size={14}
                color={
                  user?.isEmailVerified
                    ? theme.colors.success
                    : theme.colors.warning
                }
              />
              <Text
                variant="labelSmall"
                style={{
                  color: user?.isEmailVerified
                    ? theme.colors.success
                    : theme.colors.warning,
                }}
              >
                {user?.isEmailVerified ? 'Verified account' : 'Email not verified'}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <MenuRow
            icon="account-edit-outline"
            label="Edit profile"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <View
            style={[styles.divider, { backgroundColor: theme.colors.outline }]}
          />
          <MenuRow
            icon="bell-outline"
            label="Notifications"
            badge={notificationEnabled ? unreadCount : undefined}
            onPress={() => navigation.navigate('Notifications')}
          />
          <View
            style={[styles.divider, { backgroundColor: theme.colors.outline }]}
          />
          <MenuRow
            icon="cog-outline"
            label="Settings"
            onPress={() => navigation.navigate('Settings')}
          />
          <View
            style={[styles.divider, { backgroundColor: theme.colors.outline }]}
          />
          <View style={styles.menuRow}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
            >
              <MaterialCommunityIcons
                name={themeMode === 'dark' ? 'weather-night' : 'white-balance-sunny'}
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <Text
              variant="bodyLarge"
              style={[styles.flex, { color: theme.colors.onSurface }]}
            >
              Dark mode
            </Text>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
              color={theme.colors.primary}
              accessibilityLabel="Toggle dark mode"
            />
          </View>
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <MenuRow
            icon="information-outline"
            label={`About ${APP_NAME}`}
            onPress={() => navigation.navigate('About')}
          />
          <View
            style={[styles.divider, { backgroundColor: theme.colors.outline }]}
          />
          <MenuRow
            icon="shield-lock-outline"
            label="Privacy policy"
            onPress={() => navigation.navigate('Legal', { type: 'privacy' })}
          />
          <View
            style={[styles.divider, { backgroundColor: theme.colors.outline }]}
          />
          <MenuRow
            icon="file-document-outline"
            label="Terms of use"
            onPress={() => navigation.navigate('Legal', { type: 'terms' })}
          />
        </View>

        <TouchableOpacity
          onPress={confirmLogout}
          style={[
            styles.logout,
            {
              backgroundColor: theme.colors.errorContainer,
              borderColor: theme.colors.error,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <MaterialCommunityIcons
            name="logout"
            size={20}
            color={theme.colors.error}
          />
          <Text
            variant="labelLarge"
            style={[styles.bold, { color: theme.colors.error }]}
          >
            Sign out
          </Text>
        </TouchableOpacity>

        <Text
          variant="labelSmall"
          style={[styles.version, { color: theme.colors.onSurfaceVariant }]}
        >
          {APP_NAME} v{APP_VERSION} · Demonstration build
        </Text>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  flex: {
    flex: 1,
  },
  bold: {
    fontWeight: '700',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  section: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 64,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 52,
  },
  version: {
    textAlign: 'center',
  },
});

export default ProfileScreen;
