import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';
import TransportBadge from '../common/TransportBadge';
import { formatDuration, formatFare } from '../../utils/geo';
import type { Route } from '../../types';

interface RouteListCardProps {
  route: Route;
  onPress: () => void;
}

export const RouteListCard = ({ route, onPress }: RouteListCardProps) => {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`View ${route.routeName}, ${formatFare(
        route.fare,
      )}, ${formatDuration(route.estimatedDuration)}`}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <View style={styles.body}>
        <View style={styles.codeRow}>
          <Text
            variant="labelSmall"
            style={[styles.code, { color: theme.colors.primary }]}
          >
            {route.routeCode}
          </Text>
          {route.status !== 'active' ? (
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {route.status}
            </Text>
          ) : null}
        </View>
        <Text
          variant="titleSmall"
          style={[styles.title, { color: theme.colors.onSurface }]}
          numberOfLines={2}
        >
          {route.routeName}
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
          numberOfLines={1}
        >
          {route.origin} → {route.destination}
        </Text>
        <View style={styles.metaRow}>
          <TransportBadge category={route.transportationType} compact />
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {formatDuration(route.estimatedDuration)} · {formatFare(route.fare)}
          </Text>
        </View>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={theme.colors.onSurfaceVariant}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  code: {
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  title: {
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
});

export default RouteListCard;
