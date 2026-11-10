import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "react-native-paper";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers";
import { KeyboardAvoidingView, Platform } from "react-native";

import { resetPasswordSchema, ResetPasswordFormData } from "../../features/auth/schemas/resetPasswordSchema";
import AppTextInput from "../../components/shared/AppTextInput";
import AppPasswordInput from "../../components/shared/AppPasswordInput";
import AppButton from "../../components/shared/AppButton";

const ResetPasswordScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (err) {
      setError("code" as any, {
        type: "manual",
        message: "Invalid or expired reset code",
      });
    }
  };

  if (isSubmitted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: theme.colors.success + "20" }]}>
              <Text style={[styles.successEmoji, { color: theme.colors.success }]}>✓</Text>
            </View>
            <Text style={[styles.successTitle, { color: theme.colors.onBackground }]}>
              Password reset successful
            </Text>
            <Text style={[styles.successMessage, { color: theme.colors.onSurfaceVariant }]}>
              Your password has been updated. You can now sign in with your new password.
            </Text>
            <AppButton
              title="Go to Sign In"
              onPress={() => navigation.navigate("Login")}
              mode="contained"
            />
          </View>
        </ScrollView>
      </View>
    );
  }

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
              Reset your password
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Enter the code from your email and set a new password.
            </Text>
          </View>

          <View style={styles.form}>
            <AppTextInput
              name="code"
              control={control}
              label="Reset Code"
              placeholder="Enter 6-digit code"
              keyboardType="numeric"
              leftIcon="lock"
              error={errors.code?.message}
            />

            <AppPasswordInput
              name="newPassword"
              control={control}
              label="New Password"
              placeholder="Create a new password"
              error={errors.newPassword?.message}
            />

            <AppPasswordInput
              name="confirmPassword"
              control={control}
              label="Confirm New Password"
              placeholder="Confirm your new password"
              error={errors.confirmPassword?.message}
            />

            <AppButton
              title="Reset Password"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              mode="contained"
            />

            <View style={styles.signUpContainer}>
              <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                <Text style={[styles.backText, { color: theme.colors.onSurfaceVariant }]}>
                  ← Back to Forgot Password
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
    marginBottom: hp(4),
  },
  title: {
    fontSize: wp(8),
    fontWeight: "bold",
    marginBottom: hp(1),
    fontFamily: "Nunito-Bold",
  },
  subtitle: {
    fontSize: wp(4),
    lineHeight: wp(5.5),
    fontFamily: "Nunito-Regular",
  },
  form: {
    gap: hp(0.5),
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(10),
  },
  successIcon: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(12),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(4),
  },
  successEmoji: {
    fontSize: wp(12),
    fontWeight: "bold",
  },
  successTitle: {
    fontSize: wp(7),
    fontWeight: "bold",
    marginBottom: hp(2),
    textAlign: "center",
    fontFamily: "Nunito-Bold",
  },
  successMessage: {
    fontSize: wp(4),
    textAlign: "center",
    lineHeight: wp(5.5),
    marginBottom: hp(4),
    fontFamily: "Nunito-Regular",
  },
  signUpContainer: {
    marginTop: hp(3),
    alignItems: "center",
  },
  backText: {
    fontSize: wp(4),
    fontWeight: "600",
    fontFamily: "Nunito-SemiBold",
  },
});

export default ResetPasswordScreen;