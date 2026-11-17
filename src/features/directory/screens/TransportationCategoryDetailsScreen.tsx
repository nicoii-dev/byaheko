import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../../config/theme';
import { TRANSPORTATION_META } from '../../../config/constants';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import DemoBanner from '../../../components/common/DemoBanner';
import InfoBanner from '../../../components/common/InfoBanner';
import AppButton from '../../../components/buttons/AppButton';
import StatTile from '../../../components/common/StatTile';
import RouteListCard from '../../../components/cards/RouteListCard';
import BoardingPointCard from '../../../components/cards/BoardingPointCard';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../components/common/StateViews';
import { useDirectoryData } from '../hooks/useDirectoryData';
import { useAppDispatch } from '../../../redux/hooks';
import { setSelectedCategory } from '../../../redux/slices/transportationSlice';
import {
  formatFareRange,
  getBoardingPointsForCategory,
  getCategoryColor,
  getCategorySummary,
  getRoutesForCategory,
} from '../../../utils/transport';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'TransportationCategoryDetails'
>;

export const TransportationCategoryDetailsScreen = ({
  navigation,
  route,
}: Props) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const { category } = route.params;
  const meta = TRANSPORTATION_META[category];
  const color = getCategoryColor(theme, category);

  const { categories, boardingPoints, routes, loading, error, reload } =
    useDirectoryData();

  const categoryInfo = categories.find(item => item.category === category);
  const categoryRoutes = useMemo(
    () => getRoutesForCategory(routes, category),
    [category, routes],
  );
  const categoryPoints = useMemo(
    () => getBoardingPointsForCategory(boardingPoints, category),
    [boardingPoints, category],
  );
  const summary = useMemo(
    () => getCategorySummary(routes, boardingPoints, category),
    [boardingPoints, category, routes],
  );
  const fareRange = formatFareRange(summary.minFare, summary.maxFare);

  const showInitialLoading = loading && categories.length === 0;
  const showInitialError = Boolean(error) && categories.length === 0;

  const findNearbyStops = () => {
    dispatch(setSelectedCategory(category));
    navigation.navigate('Main', { screen: 'Explore' });
  };

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title={meta.label}
        subtitle={
          categoryInfo?.description ?? 'Transportation type in this build'
        }
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DemoBanner />

        {error && categories.length > 0 ? (
          <InfoBanner
            message={error}
            tone="error"
            actionLabel="Retry"
            onAction={reload}
          />
        ) : null}

        {showInitialLoading ? (
          <LoadingState message="Loading transportation details…" />
        ) : showInitialError ? (
          <ErrorState
            message={error ?? 'Unable to load this transportation type.'}
            onRetry={reload}
          />
        ) : (
          <>
            <View
              style={[
                styles.hero,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.outline,
                },
              ]}
            >
              <View style={styles.heroHeader}>
                <View
                  style={[styles.heroIcon, { backgroundColor: `${color}1A` }]}
                >
                  <MaterialCommunityIcons
                    name={meta.icon}
                    size={30}
                    color={color}
                  />
                </View>
                <View style={styles.heroText}>
                  <Text
                    variant="titleMedium"
                    style={[styles.heroTitle, { color: theme.colors.onSurface }]}
                  >
                    {meta.label}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {categoryInfo?.description ??
                      'Demonstration transportation type.'}
                  </Text>
                </View>
              </View>

              <View style={styles.stats}>
                <StatTile
                  icon="routes"
                  label="Routes"
                  value={String(summary.routeCount)}
                />
                <StatTile
                  icon="map-marker-radius-outline"
                  label="Stops"
                  value={String(summary.boardingPointCount)}
                />
                <StatTile
                  icon="cash"
                  label="Fare range"
                  value={fareRange ?? '—'}
                />
              </View>

              <View style={styles.actions}>
                <AppButton
                  label="Find nearby stops"
                  onPress={findNearbyStops}
                  icon="crosshairs-gps"
                />
                <AppButton
                  label="Plan a trip"
                  mode="outlined"
                  onPress={() =>
                    navigation.navigate('Main', { screen: 'PlanTrip' })
                  }
                  icon="map-marker-path"
                />
              </View>
            </View>

            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
            >
              Routes
            </Text>
            {categoryRoutes.length > 0 ? (
              <View style={styles.list}>
                {categoryRoutes.map(item => (
                  <RouteListCard
                    key={item.id}
                    route={item}
                    onPress={() =>
                      navigation.navigate('RouteDetails', { routeId: item.id })
                    }
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                icon="routes"
                title="No demonstration routes yet"
                message={`No sample routes use ${meta.label.toLowerCase()} in this build. Other transportation types are available in the directory.`}
              />
            )}

            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
            >
              Boarding points
            </Text>
            {categoryPoints.length > 0 ? (
              <View style={styles.list}>
                {categoryPoints.map(point => (
                  <BoardingPointCard
                    key={point.id}
                    boardingPoint={point}
                    onPress={() =>
                      navigation.navigate('BoardingPointDetails', {
                        boardingPointId: point.id,
                      })
                    }
                  />
                ))}
              </View>
            ) : (
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                No demonstration boarding points list this transportation type
                yet.
              </Text>
            )}
          </>
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
  hero: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 14,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  heroTitle: {
    fontWeight: '700',
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actions: {
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  list: {
    gap: 10,
  },
});

export default TransportationCategoryDetailsScreen;
