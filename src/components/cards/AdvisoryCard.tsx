import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';
import { formatRelativeTime } from '../../utils/geo';
import type {
  ApiAdvisory,
  ApiAdvisorySeverity,
} from '../../services/api/types';

interface AdvisoryCardProps {
  advisory: ApiAdvisory;
}

const severityLabel = (severity: ApiAdvisorySeverity): string => {
  switch (severity) {
    case 'INFO':
      return 'Info';
    case 'MINOR':
      return 'Minor';
    case 'MODERATE':
      return 'Moderate';
    case 'SEVERE':
      return 'Severe';
    case 'CRITICAL':
      return 'Critical';
    default:
      return 'Info';
  }
};

export const AdvisoryCard = ({ advisory }: AdvisoryCardProps) => {
  const theme = useAppTheme();

  const severityColor = (): string => {
    switch (advisory.severity) {
      case 'CRITICAL':
      case 'SEVERE':
        return theme.colors.error;
      case 'MODERATE':
      case 'MINOR':
        return theme.colors.warning;
      default:
        return theme.colors.info;
    }
  };

  const color = severityColor();

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
        <MaterialCommunityIcons name="alert-outline" size={20} color={color} />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text
            variant="titleSmall"
            style={[styles.flex, { color: theme.colors.onSurface }]}
            numberOfLines={2}
          >
            {advisory.title}
          </Text>
          <View style={[styles.badge, { backgroundColor: `${color}1A` }]}>
            <Text variant="labelSmall" style={{ color }}>
              {severityLabel(advisory.severity)}
            </Text>
          </View>
        </View>

        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
          numberOfLines={4}
        >
          {advisory.message}
        </Text>

        <View style={styles.badges}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: advisory.isActive
                  ? `${theme.colors.success}1A`
                  : theme.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              variant="labelSmall"
              style={{
                color: advisory.isActive
                  ? theme.colors.success
                  : theme.colors.onSurfaceVariant,
              }}
            >
              {advisory.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
          {advisory.routeId ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Route {advisory.routeId.slice(0, 8)}
              </Text>
            </View>
          ) : null}
        </View>

        <Text variant="labelSmall" style={{ color: theme.colors.muted }}>
          Since {formatRelativeTime(advisory.startsAt ?? advisory.createdAt)}
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
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});

export default AdvisoryCard;
