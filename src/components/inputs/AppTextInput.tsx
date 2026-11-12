import React from 'react';
import {
  KeyboardTypeOptions,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import { useAppTheme } from '../../config/theme';

export interface AppTextInputProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: React.ComponentProps<typeof TextInput>['autoComplete'];
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: string;
  rightIcon?: string;
  editable?: boolean;
  maxLength?: number;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export const AppTextInput = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  error,
  helperText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  multiline = false,
  numberOfLines,
  leftIcon,
  rightIcon,
  editable = true,
  maxLength,
  containerStyle,
  testID,
}: AppTextInputProps<TFieldValues>) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            mode="outlined"
            label={label}
            placeholder={placeholder}
            value={typeof value === 'string' ? value : ''}
            onBlur={onBlur}
            onChangeText={onChange}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            multiline={multiline}
            numberOfLines={numberOfLines}
            editable={editable}
            maxLength={maxLength}
            testID={testID}
            left={leftIcon ? <TextInput.Icon icon={leftIcon} /> : undefined}
            right={rightIcon ? <TextInput.Icon icon={rightIcon} /> : undefined}
            error={Boolean(error)}
            outlineColor={error ? theme.colors.error : theme.colors.outline}
            activeOutlineColor={
              error ? theme.colors.error : theme.colors.primary
            }
            style={styles.input}
            contentStyle={styles.content}
          />
        )}
      />
      {error ? (
        <Text
          style={[styles.errorText, { color: theme.colors.error }]}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text
          style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  input: {
    backgroundColor: 'transparent',
  },
  content: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default AppTextInput;
