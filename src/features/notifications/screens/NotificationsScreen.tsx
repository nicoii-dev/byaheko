import React, { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../../config/theme';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import { EmptyState, LoadingState } from '../../../components/common/StateViews';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  loadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../../redux/slices/notificationsSlice';
import { formatRelativeTime } from '../../../utils/geo';
import type { RootStackParamList } from '../../../navigation/types';
import type { AppNotification } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

const iconForType = (type: AppNotification['type']): string => {
  switch (type) {
    case 'advisory':
      return 'alert-outline';
    case 'update':
      return 'update';
    case 'saved_route':
      return 'heart-outline';
    case 'announcement':
      return 'bullhorn-outline';
    default:
      return 'bell-outline';
  }
};

export const NotificationsScreen = ({ navigation }: Props) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const { items, loading, unreadCount } = useAppSelector(
    state => state.notifications,
  );

  useEffect(() => {
    if (items.length === 0) {
      dispatch(loadNotifications());
    }
  }, [dispatch, items.length]);

  const openNotification = useCallback(
    (notification: AppNotification) => {
      if (!notification.read) {
        dispatch(markNotificationRead(notification.id));
      }
    },
    [dispatch],
  );

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread`
            : 'You are all caught up'
        }
        onBack={() => navigation.goBack()}
        rightIcon="check-all"
        onRightPress={() => dispatch(markAllNotificationsRead())}
        rightAccessibilityLabel="Mark all notifications as read"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.demoNotice,
            { backgroundColor: theme.colors.tertiaryContainer },
          ]}
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={18}
            color={theme.colors.onTertiaryContainer}
          />
          <Text
            variant="bodySmall"
            style={[styles.flex, { color: theme.colors.onTertiaryContainer }]}
          >
            These notifications are demonstration content. Real service
            advisories will arrive from the ByaheKo API.
          </Text>
        </View>

        {loading && items.length === 0 ? (
          <LoadingState message="Loading notifications…" />
        ) : items.length === 0 ? (
          <EmptyState
            icon="bell-check-outline"
            title="No notifications"
            message="Route advisories and service updates will appear here."
          />
        ) : (
          <View style={styles.list}>
            {items.map(notification => {
              const color =
                notification.type === 'advisory'
                  ? theme.colors.warning
                  : theme.colors.info;
              return (
                <TouchableOpacity
                  key={notification.id}
                  onPress={() => openNotification(notification)}
                  activeOpacity={0.85}
                  style={[
                    styles.row,
                    {
                      backgroundColor: notification.read
                        ? theme.colors.surface
                        : theme.colors.surfaceVariant,
                      borderColor: theme.colors.outline,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${notification.title}. ${
                    notification.read ? 'Read' : 'Unread'
                  }`}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: `${color}1A` },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={iconForType(notification.type)}
                      size={20}
                      color={color}
                    />
                  </View>
                  <View style={styles.body}>
                    <View style={styles.titleRow}>
                      <Text
                        variant="titleSmall"
                        style={[styles.flex, { color: theme.colors.onSurface }]}
                        numberOfLines={1}
                      >
                        {notification.title}
                      </Text>
                      {!notification.read ? (
                        <View
                          style={[
                            styles.unreadDot,
                            { backgroundColor: theme.colors.primary },
                          ]}
                        />
                      ) : null}
                    </View>
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.onSurfaceVariant }}
                      numberOfLines={3}
                    >
                      {notification.message}
                    </Text>
                    <Text
                      variant="labelSmall"
                      style={{ color: theme.colors.muted }}
                    >
                      {formatRelativeTime(notification.timestamp)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  demoNotice: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 3,
  },
  flex: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default NotificationsScreen;
