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
import { APP_NAME, DEMO_ACCOUNT } from '../../../config/constants';
import Screen from '../../../components/common/Screen';
import AppLogo from '../../../components/common/AppLogo';
import AppButton from '../../../components/buttons/AppButton';
import AppTextInput from '../../../components/inputs/AppTextInput';
import AppPasswordInput from '../../../components/inputs/AppPasswordInput';
import { loginSchema, type LoginFormData } from '../schemas/loginSchema';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { clearAuthError, login } from '../../../redux/slices/authSlice';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen = ({ navigation }: Props) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(login(data));
    if (login.rejected.match(result)) {
      return;
    }
    if (!result.payload.user.isEmailVerified) {
      navigation.replace('VerifyEmail', { email: result.payload.user.email });
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const fillDemoAccount = () => {
    setValue('email', DEMO_ACCOUNT.email, { shouldValidate: true });
    setValue('password', DEMO_ACCOUNT.password, { shouldValidate: true });
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
            <AppLogo size="small" />
            <Text
              variant="headlineMedium"
              style={[styles.title, { color: theme.colors.onBackground }]}
            >
              Welcome back
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              Sign in to continue planning your journey with {APP_NAME}.
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

          <AppTextInput<LoginFormData>
            name="email"
            control={control}
            label="Email address"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoComplete="email"
            leftIcon="email-outline"
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
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgot}
            accessibilityRole="button"
          >
            <Text
              variant="labelLarge"
              style={{ color: theme.colors.primary }}
            >
              Forgot password?
            </Text>
          </TouchableOpacity>

          <AppButton
            label="Sign in"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            icon="login"
          />

          <AppButton
            label="Use demo account"
            onPress={fillDemoAccount}
            mode="outlined"
            icon="account-demo"
            style={styles.demoButton}
          />
          <Text
            variant="labelSmall"
            style={[styles.demoHint, { color: theme.colors.onSurfaceVariant }]}
          >
            Demo: {DEMO_ACCOUNT.email} / {DEMO_ACCOUNT.password}
          </Text>

          <View style={styles.footer}>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              New to {APP_NAME}?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              accessibilityRole="button"
            >
              <Text
                variant="labelLarge"
                style={{ color: theme.colors.primary }}
              >
                Create an account
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
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    marginTop: 12,
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
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 18,
    marginTop: -2,
  },
  demoButton: {
    marginTop: 12,
  },
  demoHint: {
    textAlign: 'center',
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 28,
  },
});

export default LoginScreen;
