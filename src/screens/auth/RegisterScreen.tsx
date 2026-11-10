import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "react-native-paper";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers";
import { KeyboardAvoidingView, Platform } from "react-native";

import { registerSchema, RegisterFormData } from "../../features/auth/schemas/registerSchema";
import AppTextInput from "../../components/shared/AppTextInput";
import AppPasswordInput from "../../components/shared/AppPasswordInput";
import AppButton from "../../components/shared/AppButton";
import { useAppDispatch } from "../../redux/hooks";
import { register } from "../../redux/slices/authSlice";
import { APP_NAME } from "../../config/constants";

const RegisterScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await dispatch(register(data));
      if (register.rejected.match(result)) {
        setError("email" as any, {
          type: "manual",
          message: (result.payload as string) || "Registration failed",
        });
        return;
      }
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch (err) {
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
              Create your {APP_NAME} account
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Sign up to start your journey
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <AppTextInput
                  name="firstName"
                  control={control}
                  label="First Name"
                  placeholder="John"
                  autoCapitalize="words"
                  leftIcon="person"
                  error={errors.firstName?.message}
                />
              </View>
              <View style={styles.halfField}>
                <AppTextInput
                  name="lastName"
                  control={control}
                  label="Last Name"
                  placeholder="Doe"
                  autoCapitalize="words"
                  error={errors.lastName?.message}
                />
              </View>
            </View>

            <AppTextInput
              name="email"
              control={control}
              label="Email Address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="email"
              error={errors.email?.message}
            />

            <AppTextInput
              name="mobileNumber"
              control={control}
              label="Mobile Number"
              placeholder="09171234567"
              keyboardType="phone-pad"
              leftIcon="phone"
              error={errors.mobileNumber?.message}
            />

            <AppPasswordInput
              name="password"
              control={control}
              label="Password"
              placeholder="Create a password"
              error={errors.password?.message}
            />

            <AppPasswordInput
              name="confirmPassword"
              control={control}
              label="Confirm Password"
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
            />

            <AppButton
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              mode="contained"
            />

            <View style={styles.signUpContainer}>
              <Text style={[styles.signUpText, { color: theme.colors.onSurfaceVariant }]}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.signUpLink, { color: theme.colors.primary }]}>
                  Sign In
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
    fontSize: wp(7.5),
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
  row: {
    flexDirection: "row",
    gap: wp(3),
  },
  halfField: {
    flex: 1,
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

export default RegisterScreen;