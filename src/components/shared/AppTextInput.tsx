import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Controller, Control } from "react-hook-form";

interface AppTextInputProps {
  name: string;
  control: Control<any>;
  label: string;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric" | "decimal-pad";
  autoCapitalize?: "none" | "words" | "characters" | "sentences";
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: string;
  rightIcon?: string;
  editable?: boolean;
  maxLength?: number;
  containerStyle?: any;
}

const AppTextInput: React.FC<AppTextInputProps> = ({
  name,
  control,
  label,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  multiline = false,
  numberOfLines,
  leftIcon,
  rightIcon,
  editable = true,
  maxLength,
  containerStyle,
}) => {
  const theme = useTheme();

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
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            multiline={multiline}
            numberOfLines={numberOfLines}
            editable={editable}
            maxLength={maxLength}
            left={leftIcon ? <TextInput.Icon icon={leftIcon} /> : undefined}
            right={rightIcon ? <TextInput.Icon icon={rightIcon} /> : undefined}
            error={!!error}
            outlineColor={error ? theme.colors.error : theme.colors.outline}
            activeOutlineColor={error ? theme.colors.error : theme.colors.primary}
            style={styles.input}
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

export default AppTextInput;