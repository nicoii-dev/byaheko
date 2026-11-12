import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';
import { TRANSPORTATION_META } from '../../config/constants';
import { getCategoryColor } from '../../utils/transport';
import type { TransportationCategory } from '../../types';

interface CategoryCardProps {
  category: TransportationCategory;
  selected?: boolean;
  onPress?: () => void;
  compact?: boolean;
}

export const CategoryCard = ({
  category,
  selected = false,
  onPress,
  compact = false,
}: CategoryCardProps) => {
  const theme = useAppTheme();
  const meta = TRANSPORTATION_META[category];
  const color = getCategoryColor(theme, category);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.container,
        compact ? styles.compact : styles.regular,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.outline,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: selected ? `${color}33` : `${color}1A` },
        ]}
      >
        <MaterialCommunityIcons name={meta.icon} size={22} color={color} />
      </View>
      <Text
        variant="labelLarge"
        style={[
          styles.label,
          {
            color: selected
              ? theme.colors.onPrimary
              : theme.colors.onSurface,
          },
        ]}
        numberOfLines={2}
      >
        {meta.label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regular: {
    width: 92,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 8,
  },
  compact: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default CategoryCard;
