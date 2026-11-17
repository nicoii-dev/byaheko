import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';
import {
  formatFareRange,
  getCategoryColor,
} from '../../utils/transport';
import type { CategorySummary } from '../../utils/transport';
import type { Transportation } from '../../types';

interface DirectoryCategoryCardProps {
  category: Transportation;
  summary: CategorySummary;
  onPress: () => void;
}

export const DirectoryCategoryCard = ({
  category,
  summary,
  onPress,
}: DirectoryCategoryCardProps) => {
  const theme = useAppTheme();
  const color = getCategoryColor(theme, category.category);
  const fareRange = formatFareRange(summary.minFare, summary.maxFare);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${category.name}. ${summary.routeCount} demonstration routes, ${summary.boardingPointCount} boarding points.`}
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
          name={category.icon}
          size={24}
          color={color}
        />
      </View>
      <View style={styles.body}>
        <Text
          variant="titleSmall"
          style={[styles.title, { color: theme.colors.onSurface }]}
          numberOfLines={1}
        >
          {category.name}
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
          numberOfLines={2}
        >
          {category.description}
        </Text>
        <View style={styles.metaRow}>
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {summary.routeCount} route{summary.routeCount === 1 ? '' : 's'} ·{' '}
            {summary.boardingPointCount} stop
            {summary.boardingPointCount === 1 ? '' : 's'}
          </Text>
          {fareRange ? (
            <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
              {fareRange}
            </Text>
          ) : null}
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
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 2,
  },
});

export default DirectoryCategoryCard;
