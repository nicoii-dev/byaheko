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
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '../schemas/forgotPasswordSchema';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  clearAuthError,
  requestPasswordReset,
} from '../../../redux/slices/authSlice';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen = ({ navigation }: Props) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const result = await dispatch(requestPasswordReset(data.email));
    if (requestPasswordReset.fulfilled.match(result)) {
      setSubmittedEmail(data.email);
    }
  };

  if (submittedEmail) {
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
              name="email-check-outline"
              size={40}
              color={theme.colors.primary}
            />
          </View>
          <Text
            variant="headlineSmall"
            style={[styles.successTitle, { color: theme.colors.onBackground }]}
          >
            Check your email
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.successMessage, { color: theme.colors.onSurfaceVariant }]}
          >
            If {submittedEmail} is registered, a 6-digit reset code has been
            sent. In this demonstration build the code is 123456.
          </Text>
          <AppButton
            label="Enter reset code"
            onPress={() => navigation.replace('ResetPassword', { email: submittedEmail })}
            icon="lock-reset"
          />
          <AppButton
            label="Back to sign in"
            mode="text"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
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
            Forgot your password?
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Enter the email address on your account and we will send a reset
            code.
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

          <AppTextInput<ForgotPasswordFormData>
            name="email"
            control={control}
            label="Email address"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoComplete="email"
            leftIcon="email-outline"
            error={errors.email?.message}
          />

          <AppButton
            label="Send reset code"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            icon="send-outline"
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

export default ForgotPasswordScreen;
