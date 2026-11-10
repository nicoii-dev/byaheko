import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/MaterialIcons";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  mode?: "contained" | "outlined" | "text";
  style?: any;
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  mode = "contained",
  style,
}) => {
  const theme = useTheme();

  const getButtonStyle = () => {
    switch (mode) {
      case "outlined":
        return [
          styles.button,
          {
            backgroundColor: "transparent",
            borderColor: theme.colors.primary,
            borderWidth: 2,
          },
          style,
        ];
      case "text":
        return [styles.button, { backgroundColor: "transparent" }, style];
      default:
        return [
          styles.button,
          { backgroundColor: theme.colors.primary },
          style,
        ];
    }
  };

  const getTextStyle = () => {
    switch (mode) {
      case "outlined":
        return [styles.buttonText, { color: theme.colors.primary }];
      case "text":
        return [styles.buttonText, { color: theme.colors.primary }];
      default:
        return [styles.buttonText, { color: theme.colors.onPrimary }];
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <Icon name="hourglass-empty" size={wp(5)} color={theme.colors.onPrimary} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(6),
    borderRadius: wp(3),
    justifyContent: "center",
    alignItems: "center",
    minHeight: hp(6.5),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: wp(4),
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
    textAlign: "center",
  },
});

export default AppButton;