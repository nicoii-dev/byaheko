import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';
import TransportBadge from '../common/TransportBadge';
import { formatDistance } from '../../utils/geo';
import type { BoardingPoint } from '../../types';

interface BoardingPointCardProps {
  boardingPoint: BoardingPoint;
  distanceMeters?: number;
  onPress?: () => void;
  horizontal?: boolean;
}

export const BoardingPointCard = ({
  boardingPoint,
  distanceMeters,
  onPress,
  horizontal = false,
}: BoardingPointCardProps) => {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${boardingPoint.name}${
        distanceMeters ? `, ${formatDistance(distanceMeters)} away` : ''
      }`}
      style={[
        styles.container,
        horizontal ? styles.horizontal : styles.vertical,
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
          size={22}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text
            variant="titleSmall"
            style={[styles.title, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {boardingPoint.name}
          </Text>
          {typeof distanceMeters === 'number' ? (
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.primary }}
            >
              {formatDistance(distanceMeters)}
            </Text>
          ) : null}
        </View>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
          numberOfLines={2}
        >
          {boardingPoint.address}
        </Text>
        <View style={styles.badges}>
          {boardingPoint.transportationTypes.slice(0, 3).map(category => (
            <TransportBadge key={category} category={category} compact />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  vertical: {
    width: '100%',
  },
  horizontal: {
    width: 280,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
  title: {
    flex: 1,
    fontWeight: '700',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
});

export default BoardingPointCard;
