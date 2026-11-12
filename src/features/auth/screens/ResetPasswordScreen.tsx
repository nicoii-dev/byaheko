import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../../config/theme';
import Screen from '../../../components/common/Screen';
import AppButton from '../../../components/buttons/AppButton';
import AppTextInput from '../../../components/inputs/AppTextInput';
import AppPasswordInput from '../../../components/inputs/AppPasswordInput';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '../schemas/resetPasswordSchema';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { clearAuthError, resetPassword } from '../../../redux/slices/authSlice';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen = ({ navigation, route }: Props) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);
  const [isComplete, setIsComplete] = useState(false);
  const email = route.params.email;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { code: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    const result = await dispatch(
      resetPassword({
        email,
        code: data.code,
        newPassword: data.newPassword,
      }),
    );
    if (resetPassword.fulfilled.match(result)) {
      setIsComplete(true);
    }
  };

  if (isComplete) {
    return (
      <Screen edges={['top', 'bottom']}>
        <View style={styles.successContainer}>
          <View
            style={[
              styles.successIcon,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={42}
              color={theme.colors.primary}
            />
          </View>
          <Text
            variant="headlineSmall"
            style={[styles.successTitle, { color: theme.colors.onBackground }]}
          >
            Password updated
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.successMessage, { color: theme.colors.onSurfaceVariant }]}
          >
            Your password has been reset. Sign in with your new password to
            continue.
          </Text>
          <AppButton
            label="Go to sign in"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
            icon="login"
          />
        </View>
      </Screen>
    );
  }

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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color={theme.colors.onBackground}
            />
          </TouchableOpacity>

          <Text
            variant="headlineMedium"
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            Set a new password
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Enter the 6-digit code sent to {email} and choose a new password.
          </Text>

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

          <AppTextInput<ResetPasswordFormData>
            name="code"
            control={control}
            label="Reset code"
            placeholder="6-digit code"
            keyboardType="number-pad"
            maxLength={6}
            leftIcon="numeric"
            helperText="Demo build code: 123456"
            error={errors.code?.message}
          />

          <AppPasswordInput<ResetPasswordFormData>
            name="newPassword"
            control={control}
            label="New password"
            placeholder="Create a new password"
            helperText="At least 8 characters with upper, lower, number, and symbol."
            error={errors.newPassword?.message}
          />

          <AppPasswordInput<ResetPasswordFormData>
            name="confirmPassword"
            control={control}
            label="Confirm new password"
            placeholder="Re-enter your new password"
            error={errors.confirmPassword?.message}
          />

          <AppButton
            label="Reset password"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            icon="lock-reset"
          />
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
    paddingTop: 12,
    paddingBottom: 32,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginLeft: -8,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 21,
  },
  errorBanner: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 8,
  },
  successIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  successMessage: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
});

export default ResetPasswordScreen;
