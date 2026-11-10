import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Controller, Control } from "react-hook-form";

interface AppPasswordInputProps<T extends Record<string, any>> {
  name: keyof T & string;
  control: Control<T>;
  label: string;
  placeholder?: string;
  error?: string;
  editable?: boolean;
  containerStyle?: any;
}

const AppPasswordInput = <T extends Record<string, any>>({
  name,
  control,
  label,
  placeholder,
  error,
  editable = true,
  containerStyle,
}: AppPasswordInputProps<T>) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <Controller
        control={control}
        name={name as any}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            mode="outlined"
            label={label}
            placeholder={placeholder}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            secureTextEntry={!showPassword}
            editable={editable}
            error={!!error}
            outlineColor={error ? theme.colors.error : theme.colors.outline}
            activeOutlineColor={error ? theme.colors.error : theme.colors.primary}
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showPassword ? "visibility-off" : "visibility"}
                onPress={() => setShowPassword(!showPassword)}
                color={theme.colors.onSurfaceVariant}
              />
            }
          />
        )}
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
    marginBottom: hp(1.5),
  },
  input: {
    backgroundColor: "transparent",
  },
  errorText: {
    fontSize: wp(3.2),
    marginTop: hp(0.3),
    fontFamily: "Nunito-Regular",
  },
});

export default AppPasswordInput;