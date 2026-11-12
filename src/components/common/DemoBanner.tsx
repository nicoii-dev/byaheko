import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';
import { DEMO_DATA_NOTICE } from '../../services/mock/data';

interface DemoBannerProps {
  message?: string;
}

export const DemoBanner = ({ message = DEMO_DATA_NOTICE }: DemoBannerProps) => {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.tertiaryContainer,
          borderColor: theme.colors.tertiary,
        },
      ]}
      accessibilityRole="text"
    >
      <MaterialCommunityIcons
        name="information-outline"
        size={18}
        color={theme.colors.onTertiaryContainer}
      />
      <Text
        variant="bodySmall"
        style={[styles.text, { color: theme.colors.onTertiaryContainer }]}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  text: {
    flex: 1,
    lineHeight: 18,
  },
});

export default DemoBanner;
