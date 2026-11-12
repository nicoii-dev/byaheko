import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../../config/theme';
import { APP_NAME, STORAGE_KEYS } from '../../../config/constants';
import Screen from '../../../components/common/Screen';
import AppButton from '../../../components/buttons/AppButton';
import { storage } from '../../../services/storage';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

interface Slide {
  id: string;
  icon: string;
  title: string;
  description: string;
  accent: 'primary' | 'secondary' | 'tertiary';
}

const SLIDES: Slide[] = [
  {
    id: 'discover',
    icon: 'map-marker-radius-outline',
    title: 'Find transport near you',
    description:
      'See jeepney, bus, multicab, and tricycle boarding points around your location.',
    accent: 'primary',
  },
  {
    id: 'plan',
    icon: 'map-marker-path',
    title: 'Plan the whole journey',
    description:
      'Compare direct rides and transfers with walking directions, stops, and estimated travel time.',
    accent: 'secondary',
  },
  {
    id: 'prepare',
    icon: 'wallet-outline',
    title: 'Know before you go',
    description:
      'Preview estimated fares and travel time so you can prepare for the trip ahead.',
    accent: 'tertiary',
  },
];

const { width } = Dimensions.get('window');

export const OnboardingScreen = ({ navigation }: Props) => {
  const theme = useAppTheme();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);
  const isLast = index === SLIDES.length - 1;

  const goTo = (nextIndex: number) => {
    setIndex(nextIndex);
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  };

  const finish = async () => {
    await storage.setItem(STORAGE_KEYS.ONBOARDING_SEEN, 'true');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const next = () => {
    if (isLast) {
      finish();
      return;
    }
    goTo(index + 1);
  };

  const renderSlide = ({ item }: ListRenderItemInfo<Slide>) => {
    const accent = theme.colors[item.accent];
    return (
      <View style={[styles.slide, { width }]}>
        <View
          style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={72}
            color={accent}
          />
        </View>
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          {item.title}
        </Text>
        <Text
          variant="bodyLarge"
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
        >
          {item.description}
        </Text>
      </View>
    );
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <MaterialCommunityIcons
            name="bus-side"
            size={26}
            color={theme.colors.primary}
          />
          <Text
            variant="titleLarge"
            style={[styles.brand, { color: theme.colors.primary }]}
          >
            {APP_NAME}
          </Text>
        </View>
        {!isLast ? (
          <TouchableOpacity
            onPress={finish}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            hitSlop={8}
          >
            <Text
              variant="labelLarge"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Skip
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={item => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={event => {
          const nextIndex = Math.round(
            event.nativeEvent.contentOffset.x / width,
          );
          setIndex(nextIndex);
        }}
        getItemLayout={(_, itemIndex) => ({
          length: width,
          offset: width * itemIndex,
          index: itemIndex,
        })}
        style={styles.list}
      />

      <View style={styles.footer}>
        <View style={styles.dots} accessibilityRole="tablist">
          {SLIDES.map((slide, dotIndex) => (
            <View
              key={slide.id}
              style={[
                styles.dot,
                dotIndex === index ? styles.dotActive : null,
                {
                  backgroundColor:
                    dotIndex === index
                      ? theme.colors.primary
                      : theme.colors.outline,
                },
              ]}
            />
          ))}
        </View>
        <AppButton
          label={isLast ? 'Get started' : 'Next'}
          onPress={next}
          icon={isLast ? 'arrow-right' : undefined}
          accessibilityLabel={isLast ? 'Get started' : 'Next slide'}
        />
        <Text
          variant="labelSmall"
          style={[styles.note, { color: theme.colors.onSurfaceVariant }]}
        >
          Demonstration build. Routes and fares are sample data.
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  list: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 148,
    height: 148,
    borderRadius: 74,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 360,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 16,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 26,
  },
  note: {
    textAlign: 'center',
  },
});

export default OnboardingScreen;
