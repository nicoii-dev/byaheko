import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import AppTextInput from './AppTextInput';

interface AppPhoneInputProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const AppPhoneInput = <TFieldValues extends FieldValues>({
  name,
  control,
  label = 'Mobile Number',
  error,
  containerStyle,
}: AppPhoneInputProps<TFieldValues>) => (
  <AppTextInput
    name={name}
    control={control}
    label={label}
    placeholder="09171234567"
    keyboardType="phone-pad"
    autoComplete="tel"
    leftIcon="phone-outline"
    maxLength={11}
    helperText="11-digit Philippine mobile number"
    error={error}
    containerStyle={containerStyle}
  />
);

export default AppPhoneInput;
