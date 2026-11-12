import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';
import { TRANSPORTATION_META } from '../../config/constants';
import { getCategoryColor } from '../../utils/transport';
import { formatDuration, formatFare } from '../../utils/geo';
import type { PopularRoute } from '../../types';

interface PopularRouteCardProps {
  route: PopularRoute;
  onPress: () => void;
}

export const PopularRouteCard = ({
  route,
  onPress,
}: PopularRouteCardProps) => {
  const theme = useAppTheme();
  const meta = TRANSPORTATION_META[route.transportationType];
  const color = getCategoryColor(theme, route.transportationType);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${route.label}, ${formatFare(
        route.estimatedFare,
      )}, ${formatDuration(route.estimatedDuration)}`}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${color}1A` }]}>
        <MaterialCommunityIcons name={meta.icon} size={20} color={color} />
      </View>
      <View style={styles.body}>
        <Text
          variant="titleSmall"
          style={[styles.title, { color: theme.colors.onSurface }]}
          numberOfLines={1}
        >
          {route.label}
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
          numberOfLines={1}
        >
          {meta.label} · {formatDuration(route.estimatedDuration)}
        </Text>
      </View>
      <Text
        variant="labelLarge"
        style={[styles.fare, { color: theme.colors.primary }]}
      >
        {formatFare(route.estimatedFare)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
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
    gap: 2,
  },
  title: {
    fontWeight: '700',
  },
  fare: {
    fontWeight: '700',
  },
});

export default PopularRouteCard;
