import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../../config/theme';
import { APP_NAME } from '../../../config/constants';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Legal'>;

interface Section {
  title: string;
  body: string;
}

const PRIVACY_SECTIONS: Section[] = [
  {
    title: 'What this demonstration build stores',
    body: 'Account details, favorites, preferences, and recent searches are stored locally on this device using AsyncStorage. The mock authentication service keeps demo credentials in memory only.',
  },
  {
    title: 'Location data',
    body: 'Location permission is requested only when you ask the app to find nearby boarding points or use your current location. Coordinates are used to calculate distances and are not uploaded by this build.',
  },
  {
    title: 'Network requests',
    body: 'This build runs with mock services. When a real ByaheKo API is connected, authenticated requests will include a bearer token and will be sent over HTTPS.',
  },
  {
    title: 'Your choices',
    body: 'You can clear recent searches in the location search screen, remove saved favorites from the Favorites tab, and sign out from your profile. Device-level permission can be changed in system settings.',
  },
];

const TERMS_SECTIONS: Section[] = [
  {
    title: 'Demonstration content',
    body: 'Routes, stops, fares, and travel times in this build are sample data. They are not verified public utility vehicle information and must not be relied on for real journeys.',
  },
  {
    title: 'No live tracking',
    body: 'ByaheKo does not track vehicles or provide real-time arrivals in this build. Trip guidance is a simulation based on the demonstration route graph.',
  },
  {
    title: 'Estimates only',
    body: 'Fares and durations are approximations. Actual costs, routes, and travel times depend on operators, traffic, weather, and local regulations.',
  },
  {
    title: 'Acceptable use',
    body: 'Use the app lawfully and do not attempt to disrupt the service, reverse engineer protected components, or misuse another person’s account.',
  },
  {
    title: 'Changes',
    body: `These terms will be updated when ${APP_NAME} connects to production transportation data and real account services.`,
  },
];

export const LegalScreen = ({ navigation, route }: Props) => {
  const theme = useAppTheme();
  const isPrivacy = route.params.type === 'privacy';
  const sections = isPrivacy ? PRIVACY_SECTIONS : TERMS_SECTIONS;

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title={isPrivacy ? 'Privacy policy' : 'Terms of use'}
        subtitle="Demonstration build"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text
          variant="bodyMedium"
          style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}
        >
          This is a plain-language summary for the {APP_NAME} demonstration
          build. It is not legal advice and should be reviewed by counsel before
          a public release.
        </Text>

        {sections.map(section => (
          <View
            key={section.title}
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline,
              },
            ]}
          >
            <Text
              variant="titleSmall"
              style={[styles.title, { color: theme.colors.onSurface }]}
            >
              {section.title}
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.body, { color: theme.colors.onSurfaceVariant }]}
            >
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  intro: {
    lineHeight: 21,
    marginBottom: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  title: {
    fontWeight: '700',
  },
  body: {
    lineHeight: 21,
  },
});

export default LegalScreen;
