import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Menu } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import { useAppTheme } from '../../config/theme';

export interface SelectOption {
  label: string;
  value: string;
}

interface AppSelectInputProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const AppSelectInput = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = 'Select an option',
  error,
  containerStyle,
}: AppSelectInputProps<TFieldValues>) => {
  const theme = useAppTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          const selected = options.find(option => option.value === value);
          return (
            <View>
              <Text
                style={[
                  styles.label,
                  {
                    color: error
                      ? theme.colors.error
                      : theme.colors.onSurfaceVariant,
                  },
                ]}
              >
                {label}
              </Text>
              <Menu
                visible={visible}
                onDismiss={() => setVisible(false)}
                anchor={
                  <TouchableOpacity
                    onPress={() => setVisible(true)}
                    style={[
                      styles.field,
                      {
                        borderColor: error
                          ? theme.colors.error
                          : theme.colors.outline,
                        backgroundColor: theme.colors.surface,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${label}: ${
                      selected?.label ?? placeholder
                    }`}
                  >
                    <Text
                      style={[
                        styles.value,
                        {
                          color: selected
                            ? theme.colors.onSurface
                            : theme.colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {selected?.label ?? placeholder}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={22}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                }
              >
                {options.map(option => (
                  <Menu.Item
                    key={option.value}
                    title={option.label}
                    onPress={() => {
                      onChange(option.value);
                      setVisible(false);
                    }}
                    leadingIcon={
                      option.value === value ? 'check' : undefined
                    }
                  />
                ))}
              </Menu>
            </View>
          );
        }}
      />
      {error ? (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    marginLeft: 4,
  },
  field: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default AppSelectInput;
