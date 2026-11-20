import React, { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../../config/theme';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../components/common/StateViews';
import NotificationCard from '../../../components/cards/NotificationCard';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  loadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../../redux/slices/notificationsSlice';
import type { RootStackParamList } from '../../../navigation/types';
import type { AppNotification } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export const NotificationsScreen = ({ navigation }: Props) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const { items, loading, error, unreadCount } = useAppSelector(
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
          unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'
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
            { backgroundColor: theme.colors.secondaryContainer },
          ]}
        >
          <MaterialCommunityIcons
            name="cloud-check-outline"
            size={18}
            color={theme.colors.onSecondaryContainer}
          />
          <Text
            variant="bodySmall"
            style={[styles.flex, { color: theme.colors.onSecondaryContainer }]}
          >
            Notifications are synced with your ByaheKo account and update as
            service advisories are published.
          </Text>
        </View>

        {loading && items.length === 0 ? (
          <LoadingState message="Loading notifications…" />
        ) : error && items.length === 0 ? (
          <ErrorState
            message={error}
            onRetry={() => dispatch(loadNotifications())}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon="bell-check-outline"
            title="No notifications"
            message="Route advisories and service updates will appear here."
          />
        ) : (
          <View style={styles.list}>
            {items.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onPress={() => openNotification(notification)}
              />
            ))}
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
  flex: {
    flex: 1,
  },
});

export default NotificationsScreen;
