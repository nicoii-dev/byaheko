import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../config/theme';

export interface SegmentOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const theme = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      {options.map(option => {
        const selected = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              selected && { backgroundColor: theme.colors.surface },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text
              variant="labelLarge"
              style={{
                color: selected
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant,
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segment: {
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});

export default SegmentedControl;
