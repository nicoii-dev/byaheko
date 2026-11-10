import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "react-native-paper";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { KeyboardAvoidingView, Platform } from "react-native";

import { loginSchema, LoginFormData } from "../../features/auth/schemas/loginSchema";
import AppTextInput from "../../components/shared/AppTextInput";
import AppPasswordInput from "../../components/shared/AppPasswordInput";
import AppButton from "../../components/shared/AppButton";
import { useAppDispatch } from "../../redux/hooks";
import { login } from "../../redux/slices/authSlice";
import { APP_NAME } from "../../config/constants";

const LoginScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await dispatch(login(data));
      if (login.rejected.match(result)) {
        setError("email" as any, {
          type: "manual",
          message: (result.payload as string) || "Login failed",
        });
        return;
      }
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch {
      setError("email" as any, {
        type: "manual",
        message: "An unexpected error occurred",
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onBackground }]}>
              Welcome back to {APP_NAME}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Sign in to continue your journey
            </Text>
          </View>

          <View style={styles.form}>
            <AppTextInput<LoginFormData>
              name="email"
              control={control}
              label="Email Address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="email"
              error={errors.email?.message}
            />

            <AppPasswordInput<LoginFormData>
              name="password"
              control={control}
              label="Password"
              placeholder="Enter your password"
              error={errors.password?.message}
            />

            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={[styles.forgotText, { color: theme.colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <AppButton
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              mode="contained"
            />

            <View style={styles.signUpContainer}>
              <Text style={[styles.signUpText, { color: theme.colors.onSurfaceVariant }]}>
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={[styles.signUpLink, { color: theme.colors.primary }]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(8),
    paddingTop: hp(8),
    paddingBottom: hp(4),
  },
  header: {
    marginBottom: hp(5),
  },
  title: {
    fontSize: wp(8),
    fontWeight: "bold",
    marginBottom: hp(1),
    fontFamily: "Nunito-Bold",
  },
  subtitle: {
    fontSize: wp(4),
    fontFamily: "Nunito-Regular",
  },
  form: {
    gap: hp(0.5),
  },
  forgotLink: {
    alignItems: "flex-end",
    marginBottom: hp(2),
  },
  forgotText: {
    fontSize: wp(3.8),
    fontWeight: "600",
    fontFamily: "Nunito-SemiBold",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: hp(3),
  },
  signUpText: {
    fontSize: wp(3.8),
    fontFamily: "Nunito-Regular",
  },
  signUpLink: {
    fontSize: wp(3.8),
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
  },
});

export default LoginScreen;