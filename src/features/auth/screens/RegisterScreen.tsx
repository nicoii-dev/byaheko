import React, { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../../config/theme';
import { APP_NAME } from '../../../config/constants';
import Screen from '../../../components/common/Screen';
import AppButton from '../../../components/buttons/AppButton';
import AppTextInput from '../../../components/inputs/AppTextInput';
import AppPasswordInput from '../../../components/inputs/AppPasswordInput';
import AppPhoneInput from '../../../components/inputs/AppPhoneInput';
import {
  registerSchema,
  type RegisterFormData,
} from '../schemas/registerSchema';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { clearAuthError, register } from '../../../redux/slices/authSlice';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen = ({ navigation }: Props) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const onSubmit = async (data: RegisterFormData) => {
    const result = await dispatch(register(data));
    if (register.rejected.match(result)) {
      return;
    }
    navigation.reset({
      index: 0,
      routes: [
        { name: 'VerifyEmail', params: { email: result.payload.user.email } },
      ],
    });
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text
              variant="headlineMedium"
              style={[styles.title, { color: theme.colors.onBackground }]}
            >
              Create your account
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              Join {APP_NAME} and plan your commute with confidence.
            </Text>
          </View>

          {error ? (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: theme.colors.errorContainer },
              ]}
              accessibilityLiveRegion="polite"
            >
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onErrorContainer }}
              >
                {error}
              </Text>
            </View>
          ) : null}

          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <AppTextInput<RegisterFormData>
                name="firstName"
                control={control}
                label="First name"
                placeholder="Juan"
                autoCapitalize="words"
                autoComplete="given-name"
                leftIcon="account-outline"
                error={errors.firstName?.message}
              />
            </View>
            <View style={styles.nameField}>
              <AppTextInput<RegisterFormData>
                name="lastName"
                control={control}
                label="Last name"
                placeholder="Dela Cruz"
                autoCapitalize="words"
                autoComplete="family-name"
                error={errors.lastName?.message}
              />
            </View>
          </View>

          <AppTextInput<RegisterFormData>
            name="email"
            control={control}
            label="Email address"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoComplete="email"
            leftIcon="email-outline"
            error={errors.email?.message}
          />

          <AppPhoneInput<RegisterFormData>
            name="mobileNumber"
            control={control}
            error={errors.mobileNumber?.message}
          />

          <AppPasswordInput<RegisterFormData>
            name="password"
            control={control}
            label="Password"
            placeholder="Create a password"
            helperText="At least 8 characters with upper, lower, number, and symbol."
            error={errors.password?.message}
          />

          <AppPasswordInput<RegisterFormData>
            name="confirmPassword"
            control={control}
            label="Confirm password"
            placeholder="Re-enter your password"
            error={errors.confirmPassword?.message}
          />

          <AppButton
            label="Create account"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            icon="account-plus-outline"
            style={styles.submit}
          />

          <View style={styles.footer}>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Already have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.replace('Login')}
              accessibilityRole="button"
            >
              <Text
                variant="labelLarge"
                style={{ color: theme.colors.primary }}
              >
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    lineHeight: 21,
  },
  errorBanner: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  submit: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 24,
  },
});

export default RegisterScreen;
