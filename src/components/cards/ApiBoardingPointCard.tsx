import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';
import type { ApiBoardingPoint } from '../../services/api/types';

interface ApiBoardingPointCardProps {
  boardingPoint: ApiBoardingPoint;
  onPress?: () => void;
}

const formatType = (type: string): string =>
  type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, character => character.toUpperCase());

export const ApiBoardingPointCard = ({
  boardingPoint,
  onPress,
}: ApiBoardingPointCardProps) => {
  const theme = useAppTheme();

  const coordinates =
    boardingPoint.latitude !== null && boardingPoint.longitude !== null
      ? `${boardingPoint.latitude.toFixed(
          4,
        )}, ${boardingPoint.longitude.toFixed(4)}`
      : 'Coordinates unavailable';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.85}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${boardingPoint.name}, ${formatType(
        boardingPoint.type,
      )}`}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: theme.colors.primaryContainer },
        ]}
      >
        <MaterialCommunityIcons
          name="map-marker-radius-outline"
          size={20}
          color={theme.colors.primary}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text
            variant="titleSmall"
            style={[styles.flex, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {boardingPoint.name}
          </Text>
          {boardingPoint.sequence !== null ? (
            <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
              Stop {boardingPoint.sequence}
            </Text>
          ) : null}
        </View>

        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
          numberOfLines={2}
        >
          {boardingPoint.address ??
            boardingPoint.landmark ??
            'Address not provided'}
        </Text>

        {boardingPoint.landmark ? (
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
            numberOfLines={1}
          >
            Landmark: {boardingPoint.landmark}
          </Text>
        ) : null}

        <View style={styles.badges}>
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
              {formatType(boardingPoint.type)}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: boardingPoint.isActive
                  ? `${theme.colors.success}1A`
                  : theme.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              variant="labelSmall"
              style={{
                color: boardingPoint.isActive
                  ? theme.colors.success
                  : theme.colors.onSurfaceVariant,
              }}
            >
              {boardingPoint.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: boardingPoint.isVerified
                  ? `${theme.colors.info}1A`
                  : theme.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              variant="labelSmall"
              style={{
                color: boardingPoint.isVerified
                  ? theme.colors.info
                  : theme.colors.onSurfaceVariant,
              }}
            >
              {boardingPoint.isVerified ? 'Verified' : 'Unverified'}
            </Text>
          </View>
        </View>

        <Text variant="labelSmall" style={{ color: theme.colors.muted }}>
          Route {boardingPoint.routeId.slice(0, 8)} · {coordinates}
        </Text>
      </View>
    </TouchableOpacity>
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
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginTop: 2,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});

export default ApiBoardingPointCard;
