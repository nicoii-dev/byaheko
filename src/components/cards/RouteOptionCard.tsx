import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';
import TransportBadge from '../common/TransportBadge';
import { formatDistance, formatDuration, formatFare } from '../../utils/geo';
import type { RouteOption } from '../../types';

interface RouteOptionCardProps {
  option: RouteOption;
  onPress: () => void;
  recommended?: boolean;
}

export const RouteOptionCard = ({
  option,
  onPress,
  recommended = false,
}: RouteOptionCardProps) => {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${option.summary}, ${formatFare(
        option.estimatedFare,
      )}, ${formatDuration(option.estimatedTravelTime)}`}
      style={[
        styles.container,
        recommended ? styles.recommendedBorder : null,
        {
          backgroundColor: theme.colors.surface,
          borderColor: recommended ? theme.colors.primary : theme.colors.outline,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text
            variant="titleSmall"
            style={[styles.title, { color: theme.colors.onSurface }]}
            numberOfLines={2}
          >
            {option.summary}
          </Text>
          {recommended ? (
            <View
              style={[
                styles.recommended,
                { backgroundColor: theme.colors.secondaryContainer },
              ]}
            >
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSecondaryContainer }}
              >
                Best option
              </Text>
            </View>
          ) : null}
        </View>
        {option.isDemoData ? (
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Demo data
          </Text>
        ) : null}
      </View>

      <View style={styles.badges}>
        {option.transportationTypes.length > 0 ? (
          option.transportationTypes.map(category => (
            <TransportBadge key={category} category={category} compact />
          ))
        ) : (
          <View
            style={[
              styles.walkBadge,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <MaterialCommunityIcons
              name="walk"
              size={14}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Walk only
            </Text>
          </View>
        )}
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color={theme.colors.primary}
          />
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurface }}
          >
            {formatDuration(option.estimatedTravelTime)}
          </Text>
        </View>
        <View style={styles.metric}>
          <MaterialCommunityIcons
            name="cash"
            size={16}
            color={theme.colors.primary}
          />
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurface }}
          >
            {formatFare(option.estimatedFare)}
          </Text>
        </View>
        <View style={styles.metric}>
          <MaterialCommunityIcons
            name="swap-horizontal"
            size={16}
            color={theme.colors.primary}
          />
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurface }}
          >
            {option.transfers === 0
              ? 'Direct'
              : `${option.transfers} transfer${
                  option.transfers > 1 ? 's' : ''
                }`}
          </Text>
        </View>
        <View style={styles.metric}>
          <MaterialCommunityIcons
            name="walk"
            size={16}
            color={theme.colors.primary}
          />
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurface }}
          >
            {formatDistance(option.walkingDistance)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
          numberOfLines={1}
        >
          Board at {option.boardingPoint.name}
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={theme.colors.onSurfaceVariant}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    marginBottom: 12,
  },
  recommendedBorder: {
    borderWidth: 2,
  },
  header: {
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontWeight: '700',
  },
  recommended: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  walkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.25)',
    paddingTop: 10,
  },
});

export default RouteOptionCard;
