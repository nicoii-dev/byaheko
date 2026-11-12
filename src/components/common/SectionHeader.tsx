import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../config/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader = ({
  title,
  subtitle,
  actionLabel,
  onAction,
}: SectionHeaderProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text
          variant="titleMedium"
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          accessibilityRole="button"
          hitSlop={8}
        >
          <Text
            variant="labelLarge"
            style={{ color: theme.colors.primary }}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontWeight: '700',
  },
});

export default SectionHeader;
