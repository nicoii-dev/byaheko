import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';

interface AppSearchInputProps {
  value?: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  onPress?: () => void;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
  editable?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const AppSearchInput = ({
  value,
  onChangeText,
  placeholder = 'Search destinations or places',
  onPress,
  onSubmitEditing,
  autoFocus = false,
  editable = true,
  containerStyle,
  accessibilityLabel = 'Search',
}: AppSearchInputProps) => {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
        containerStyle,
      ]}
    >
      <MaterialCommunityIcons
        name="magnify"
        size={22}
        color={theme.colors.onSurfaceVariant}
      />
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        style={[styles.input, { color: theme.colors.onSurface }]}
        autoFocus={autoFocus}
        editable={editable}
        returnKeyType="search"
        onSubmitEditing={onSubmitEditing}
        accessibilityLabel={accessibilityLabel}
        onPressIn={onPress}
      />
      {value ? (
        <TouchableOpacity
          onPress={() => onChangeText?.('')}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name="close-circle"
            size={20}
            color={theme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
});

export default AppSearchInput;
