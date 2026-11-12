import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TRANSPORTATION_META } from '../../config/constants';
import { useAppTheme } from '../../config/theme';
import { getCategoryColor } from '../../utils/transport';
import type { TransportationCategory } from '../../types';

interface TransportBadgeProps {
  category: TransportationCategory;
  compact?: boolean;
}

export const TransportBadge = ({
  category,
  compact = false,
}: TransportBadgeProps) => {
  const theme = useAppTheme();
  const meta = TRANSPORTATION_META[category];
  const color = getCategoryColor(theme, category);

  return (
    <View
      style={[
        styles.container,
        compact ? styles.compact : styles.regular,
        { backgroundColor: `${color}1A` },
      ]}
    >
      <MaterialCommunityIcons
        name={meta.icon}
        size={compact ? 12 : 14}
        color={color}
      />
      <Text
        variant="labelSmall"
        style={[styles.label, { color }]}
        numberOfLines={1}
      >
        {meta.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
  },
  compact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  regular: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    fontWeight: '600',
  },
});

export default TransportBadge;
