import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch } from "../redux/hooks";
import { checkAuthStatus } from "../redux/slices/authSlice";
import ByaheKoLogo from "../components/ByaheKoLogo";

const SplashScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeApp = async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));
      const result: any = await dispatch(checkAuthStatus());
      const state = result?.payload;
      if (state && state.user) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Onboarding" }],
        });
      }
    };

    initializeApp();
  }, [dispatch, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ByaheKoLogo />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SplashScreen;