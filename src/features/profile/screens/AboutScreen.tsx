import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../../config/theme';
import { APP_NAME, APP_TAGLINE, APP_VERSION } from '../../../config/constants';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import AppLogo from '../../../components/common/AppLogo';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

const FEATURES = [
  'Nearby boarding points and transport categories',
  'Trip planning with direct, transfer, and walking options',
  'Route details, stop lists, and simulated guidance',
  'Favorites, notifications, and account preferences',
];

export const AboutScreen = ({ navigation }: Props) => {
  const theme = useAppTheme();

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title={`About ${APP_NAME}`}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <AppLogo size="large" />
          <Text
            variant="bodyMedium"
            style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}
          >
            {APP_TAGLINE}
          </Text>
          <Text
            variant="labelMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Version {APP_VERSION}
          </Text>
        </View>

        <View
          style={[
            styles.disclaimer,
            { backgroundColor: theme.colors.tertiaryContainer },
          ]}
        >
          <MaterialCommunityIcons
            name="alert-outline"
            size={20}
            color={theme.colors.onTertiaryContainer}
          />
          <Text
            variant="bodySmall"
            style={[styles.flex, { color: theme.colors.onTertiaryContainer }]}
          >
            Demonstration build. Routes, stops, fares, and travel times are
            sample data and must be verified before release. No live vehicle
            tracking is included.
          </Text>
        </View>

        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
        >
          What you can try
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          {FEATURES.map(feature => (
            <View key={feature} style={styles.featureRow}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={18}
                color={theme.colors.success}
              />
              <Text
                variant="bodyMedium"
                style={[styles.flex, { color: theme.colors.onSurface }]}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
        >
          Demo account
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Email: juan@example.com
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Password: Password123!
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Verification and reset code: 123456
          </Text>
        </View>

        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
        >
          Built with
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            React Native, TypeScript, Redux Toolkit, React Hook Form, Yup,
            React Native Paper, React Navigation, Axios, and React Native Maps.
          </Text>
        </View>

        <Text
          variant="labelSmall"
          style={[styles.footer, { color: theme.colors.onSurfaceVariant }]}
        >
          Made for Filipino commuters. {APP_NAME} · {APP_TAGLINE}
        </Text>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  tagline: {
    textAlign: 'center',
    marginTop: 4,
  },
  disclaimer: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 14,
    padding: 12,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  flex: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  footer: {
    textAlign: 'center',
    marginTop: 28,
  },
});

export default AboutScreen;
