import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import DemoBanner from '../../../components/common/DemoBanner';
import InfoBanner from '../../../components/common/InfoBanner';
import DirectoryCategoryCard from '../../../components/cards/DirectoryCategoryCard';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../components/common/StateViews';
import { useDirectoryData } from '../hooks/useDirectoryData';
import { getCategorySummary } from '../../../utils/transport';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'TransportationDirectory'
>;

export const TransportationDirectoryScreen = ({ navigation }: Props) => {
  const { categories, boardingPoints, routes, loading, error, reload } =
    useDirectoryData();

  const showInitialLoading = loading && categories.length === 0;
  const showInitialError = Boolean(error) && categories.length === 0;

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title="Transportation directory"
        subtitle="Vehicle types and stops from ByaheKo"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DemoBanner message="Vehicle categories are provided by the app. Boarding points are live from ByaheKo; route and fare coverage is still expanding." />

        {error && categories.length > 0 ? (
          <InfoBanner
            message={error}
            tone="error"
            actionLabel="Retry"
            onAction={reload}
          />
        ) : null}

        {showInitialLoading ? (
          <LoadingState message="Loading transportation types…" />
        ) : showInitialError ? (
          <ErrorState
            message={error ?? 'Unable to load the directory.'}
            onRetry={reload}
          />
        ) : categories.length === 0 ? (
          <EmptyState
            icon="bus-multiple"
            title="No transportation types"
            message="The demonstration dataset does not contain any vehicle types yet."
            actionLabel="Try again"
            onAction={reload}
          />
        ) : (
          <View style={styles.list}>
            {categories.map(category => (
              <DirectoryCategoryCard
                key={category.id}
                category={category}
                summary={getCategorySummary(
                  routes,
                  boardingPoints,
                  category.category,
                )}
                onPress={() =>
                  navigation.navigate('TransportationCategoryDetails', {
                    category: category.category,
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  list: {
    gap: 10,
    marginTop: 4,
  },
});

export default TransportationDirectoryScreen;
