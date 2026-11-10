import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "react-native-paper";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { KeyboardAvoidingView, Platform } from "react-native";

import { forgotPasswordSchema, ForgotPasswordFormData } from "../../features/auth/schemas/forgotPasswordSchema";
import AppTextInput from "../../components/shared/AppTextInput";
import AppButton from "../../components/shared/AppButton";

const ForgotPasswordScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const successColor = "#2E7D52";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch {
      setError("email" as any, {
        type: "manual",
        message: "An unexpected error occurred",
      });
    }
  };

  if (isSubmitted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: successColor + "20" }]}>
              <Text style={[styles.successEmoji, { color: successColor }]}>✓</Text>
            </View>
            <Text style={[styles.successTitle, { color: theme.colors.onBackground }]}>
              Check your email
            </Text>
            <Text style={[styles.successMessage, { color: theme.colors.onSurfaceVariant }]}>
              We sent a password reset link to {submittedEmail}. Please check your inbox and follow the instructions.
            </Text>
            <AppButton
              title="Back to Sign In"
              onPress={() => navigation.navigate("Login")}
              mode="outlined"
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
              Forgot password?
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              No worries. Enter your email and we'll send you a reset link.
            </Text>
          </View>

          <View style={styles.form}>
            <AppTextInput<ForgotPasswordFormData>
              name="email"
              control={control}
              label="Email Address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="email"
              error={errors.email?.message}
            />

            <AppButton
              title="Send Reset Link"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              mode="contained"
            />

            <View style={styles.signUpContainer}>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.backText, { color: theme.colors.onSurfaceVariant }]}>
                  ← Back to Sign In
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

export default ForgotPasswordScreen;