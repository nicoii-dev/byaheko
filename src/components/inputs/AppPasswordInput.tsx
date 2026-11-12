import React, { useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { TextInput } from 'react-native-paper';
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import { useAppTheme } from '../../config/theme';

interface AppPasswordInputProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  editable?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export const AppPasswordInput = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  error,
  helperText,
  editable = true,
  containerStyle,
  testID,
}: AppPasswordInputProps<TFieldValues>) => {
  const theme = useAppTheme();
  const [visible, setVisible] = useState(false);

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
            secureTextEntry={!visible}
            editable={editable}
            testID={testID}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={visible ? 'eye-off-outline' : 'eye-outline'}
                onPress={() => setVisible(current => !current)}
                accessibilityLabel={
                  visible ? 'Hide password' : 'Show password'
                }
              />
            }
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

export default AppPasswordInput;
