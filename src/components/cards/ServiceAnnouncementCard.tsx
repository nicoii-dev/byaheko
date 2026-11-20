import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';
import { formatRelativeTime } from '../../utils/geo';
import type { ApiAnnouncement } from '../../services/api/types';

interface ServiceAnnouncementCardProps {
  announcement: ApiAnnouncement;
}

export const ServiceAnnouncementCard = ({
  announcement,
}: ServiceAnnouncementCardProps) => {
  const theme = useAppTheme();
  const publishedAt = announcement.publishedAt ?? announcement.createdAt;

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
      <View
        style={[styles.iconWrap, { backgroundColor: `${theme.colors.info}1A` }]}
      >
        <MaterialCommunityIcons
          name="bullhorn-outline"
          size={20}
          color={theme.colors.info}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text
            variant="titleSmall"
            style={[styles.flex, { color: theme.colors.onSurface }]}
            numberOfLines={2}
          >
            {announcement.title}
          </Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: announcement.isPublished
                  ? `${theme.colors.success}1A`
                  : theme.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              variant="labelSmall"
              style={{
                color: announcement.isPublished
                  ? theme.colors.success
                  : theme.colors.onSurfaceVariant,
              }}
            >
              {announcement.isPublished ? 'Published' : 'Draft'}
            </Text>
          </View>
        </View>

        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
          numberOfLines={5}
        >
          {announcement.body}
        </Text>

        <Text variant="labelSmall" style={{ color: theme.colors.muted }}>
          {formatRelativeTime(publishedAt)}
          {announcement.authorId
            ? ` · Author ${announcement.authorId.slice(0, 8)}`
            : ''}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
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
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  flex: {
    flex: 1,
    fontWeight: '700',
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});

export default ServiceAnnouncementCard;
