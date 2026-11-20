import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';
import { formatRelativeTime } from '../../utils/geo';
import type { AppNotification, NotificationType } from '../../types';

interface NotificationCardProps {
  notification: AppNotification;
  onPress?: () => void;
}

const iconForType = (type: NotificationType): string => {
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

export const NotificationCard = ({
  notification,
  onPress,
}: NotificationCardProps) => {
  const theme = useAppTheme();
  const color =
    notification.type === 'advisory' ? theme.colors.warning : theme.colors.info;

  return (
    <TouchableOpacity
      onPress={onPress}
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
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${notification.title}. ${
        notification.read ? 'Read' : 'Unread'
      }`}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${color}1A` }]}>
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
        <Text variant="labelSmall" style={{ color: theme.colors.muted }}>
          {formatRelativeTime(notification.timestamp)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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

export default NotificationCard;
