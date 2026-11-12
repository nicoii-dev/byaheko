import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';
import { formatRelativeTime } from '../../utils/geo';
import type { Announcement } from '../../types';

interface AnnouncementCardProps {
  announcement: Announcement;
}

export const AnnouncementCard = ({
  announcement,
}: AnnouncementCardProps) => {
  const theme = useAppTheme();
  const isAdvisory = announcement.type === 'advisory';
  const color = isAdvisory ? theme.colors.warning : theme.colors.info;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${color}1A` }]}>
        <MaterialCommunityIcons
          name={isAdvisory ? 'alert-outline' : 'bullhorn-outline'}
          size={18}
          color={color}
        />
      </View>
      <View style={styles.body}>
        <Text
          variant="titleSmall"
          style={{ color: theme.colors.onSurface }}
          numberOfLines={2}
        >
          {announcement.title}
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
          numberOfLines={3}
        >
          {announcement.message}
        </Text>
        <Text
          variant="labelSmall"
          style={[styles.timestamp, { color: theme.colors.muted }]}
        >
          {formatRelativeTime(announcement.publishedAt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 3,
  },
  timestamp: {
    marginTop: 2,
  },
});

export default AnnouncementCard;
