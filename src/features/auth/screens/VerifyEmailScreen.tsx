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
import { APP_NAME } from '../../../config/constants';
import Screen from '../../../components/common/Screen';
import AppButton from '../../../components/buttons/AppButton';
import AppTextInput from '../../../components/inputs/AppTextInput';
import {
  verifyEmailSchema,
  type VerifyEmailFormData,
} from '../schemas/verifyEmailSchema';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  clearAuthError,
  resendVerification,
  verifyEmail,
} from '../../../redux/slices/authSlice';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;

export const VerifyEmailScreen = ({ navigation, route }: Props) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);
  const [resent, setResent] = useState(false);
  const email = route.params.email;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormData>({
    resolver: yupResolver(verifyEmailSchema),
    defaultValues: { code: '' },
  });

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const onSubmit = async (data: VerifyEmailFormData) => {
    const result = await dispatch(
      verifyEmail({ email, code: data.code }),
    );
    if (verifyEmail.fulfilled.match(result)) {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  const resend = async () => {
    const result = await dispatch(resendVerification(email));
    if (resendVerification.fulfilled.match(result)) {
      setResent(true);
    }
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
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <MaterialCommunityIcons
              name="email-fast-outline"
              size={40}
              color={theme.colors.primary}
            />
          </View>

          <Text
            variant="headlineMedium"
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            Verify your email
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            We sent a 6-digit verification code to {email}. Enter it below to
            finish setting up your {APP_NAME} account.
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

          {resent ? (
            <View
              style={[
                styles.infoBanner,
                { backgroundColor: theme.colors.secondaryContainer },
              ]}
              accessibilityLiveRegion="polite"
            >
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSecondaryContainer }}
              >
                A new code has been sent. Demo code: 123456.
              </Text>
            </View>
          ) : null}

          <AppTextInput<VerifyEmailFormData>
            name="code"
            control={control}
            label="Verification code"
            placeholder="6-digit code"
            keyboardType="number-pad"
            maxLength={6}
            leftIcon="numeric"
            helperText="Demo build code: 123456"
            error={errors.code?.message}
          />

          <AppButton
            label="Verify email"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            icon="check-decagram-outline"
          />

          <View style={styles.links}>
            <TouchableOpacity
              onPress={resend}
              accessibilityRole="button"
              disabled={loading}
            >
              <Text
                variant="labelLarge"
                style={{ color: theme.colors.primary }}
              >
                Resend code
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
              }
              accessibilityRole="button"
            >
              <Text
                variant="labelLarge"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Back to sign in
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
    paddingTop: 32,
    paddingBottom: 32,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
  infoBanner: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default VerifyEmailScreen;
