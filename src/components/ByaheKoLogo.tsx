import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { APP_NAME, APP_TAGLINE } from "../config/constants";

const ByaheKoLogo = () => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.logoText, { color: theme.colors.onPrimary }]}>
          {APP_NAME.charAt(0)}
        </Text>
      </View>
      <Text style={[styles.appName, { color: theme.colors.onBackground }]}>
        {APP_NAME}
      </Text>
      <Text style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}>
        {APP_TAGLINE}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp(8),
  },
  logoContainer: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(3),
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoText: {
    fontSize: wp(14),
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
  },
  appName: {
    fontSize: wp(9),
    fontWeight: "bold",
    marginBottom: hp(1),
    fontFamily: "Nunito-Bold",
  },
  tagline: {
    fontSize: wp(3.5),
    textAlign: "center",
    fontFamily: "Nunito-Regular",
  },
});

export default ByaheKoLogo;