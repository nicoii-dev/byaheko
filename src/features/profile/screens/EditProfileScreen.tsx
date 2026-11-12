import React, { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../../config/theme';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import AppButton from '../../../components/buttons/AppButton';
import AppTextInput from '../../../components/inputs/AppTextInput';
import AppPhoneInput from '../../../components/inputs/AppPhoneInput';
import {
  profileSchema,
  type ProfileFormData,
} from '../schemas/profileSchema';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { clearAuthError, updateProfile } from '../../../redux/slices/authSlice';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export const EditProfileScreen = ({ navigation }: Props) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const { loading, error } = useAppSelector(state => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      mobileNumber: user?.mobileNumber ?? '',
    },
  });

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const onSubmit = async (data: ProfileFormData) => {
    const result = await dispatch(updateProfile(data));
    if (updateProfile.fulfilled.match(result)) {
      navigation.goBack();
    }
  };

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title="Edit profile"
        subtitle={user?.email}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
              <AppTextInput<ProfileFormData>
                name="firstName"
                control={control}
                label="First name"
                autoCapitalize="words"
                leftIcon="account-outline"
                error={errors.firstName?.message}
              />
            </View>
            <View style={styles.nameField}>
              <AppTextInput<ProfileFormData>
                name="lastName"
                control={control}
                label="Last name"
                autoCapitalize="words"
                error={errors.lastName?.message}
              />
            </View>
          </View>

          <AppPhoneInput<ProfileFormData>
            name="mobileNumber"
            control={control}
            error={errors.mobileNumber?.message}
          />

          <View
            style={[
              styles.readOnly,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.outline,
              },
            ]}
          >
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Email address
            </Text>
            <Text
              variant="bodyLarge"
              style={{ color: theme.colors.onSurface }}
            >
              {user?.email}
            </Text>
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Email changes are not available in this demonstration build.
            </Text>
          </View>

          <AppButton
            label="Save changes"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            icon="content-save-outline"
            style={styles.save}
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
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  errorBanner: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  readOnly: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 2,
    marginTop: 4,
  },
  save: {
    marginTop: 20,
  },
});

export default EditProfileScreen;
