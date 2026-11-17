import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';

interface StatTileProps {
  icon: string;
  label: string;
  value: string;
}

export const StatTile = ({ icon, label, value }: StatTileProps) => {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={theme.colors.primary}
      />
      <Text
        variant="titleSmall"
        style={[styles.value, { color: theme.colors.onSurface }]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text
        variant="labelSmall"
        style={{ color: theme.colors.onSurfaceVariant }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 90,
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    gap: 2,
  },
  value: {
    fontWeight: '700',
  },
});

export default StatTile;
