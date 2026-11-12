import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../../config/theme';
import {
  NEARBY_RADIUS_KM,
  TRANSPORTATION_CATEGORY_LIST,
} from '../../../config/constants';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import DemoBanner from '../../../components/common/DemoBanner';
import CategoryCard from '../../../components/cards/CategoryCard';
import BoardingPointCard from '../../../components/cards/BoardingPointCard';
import TransportMap from '../../../components/maps/TransportMap';
import { EmptyState, ErrorState, LoadingState } from '../../../components/common/StateViews';
import AppButton from '../../../components/buttons/AppButton';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  getCurrentLocation,
  setSelectedOrigin,
} from '../../../redux/slices/locationSlice';
import {
  loadNearbyBoardingPoints,
  loadTransportationData,
  setSelectedCategory,
} from '../../../redux/slices/transportationSlice';
import { useAppNavigation } from '../../../navigation/useAppNavigation';
import { getDistanceMeters } from '../../../utils/geo';
import { openAppSettings } from '../../../services/location/deviceLocation';
import type { BoardingPoint } from '../../../types';

export const ExploreScreen = () => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const navigation = useAppNavigation();

  const {
    boardingPoints,
    nearbyBoardingPoints,
    selectedCategory,
    loading,
    error,
  } = useAppSelector(state => state.transportation);
  const {
    currentLocation,
    permissionStatus,
    loading: locationLoading,
    error: locationError,
  } = useAppSelector(state => state.location);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (boardingPoints.length === 0) {
      dispatch(loadTransportationData());
    }
  }, [boardingPoints.length, dispatch]);

  useEffect(() => {
    if (currentLocation) {
      dispatch(loadNearbyBoardingPoints({ location: currentLocation }));
    }
  }, [currentLocation, dispatch]);

  const requestLocation = useCallback(async () => {
    await dispatch(getCurrentLocation());
  }, [dispatch]);

  const points = useMemo(() => {
    const source = currentLocation ? nearbyBoardingPoints : boardingPoints;
    return selectedCategory
      ? source.filter(point =>
          point.transportationTypes.includes(selectedCategory),
        )
      : source;
  }, [boardingPoints, currentLocation, nearbyBoardingPoints, selectedCategory]);

  const selectedPoint =
    points.find(point => point.id === selectedId) ?? null;

  const toggleCategory = (category: (typeof TRANSPORTATION_CATEGORY_LIST)[number]) => {
    dispatch(
      setSelectedCategory(selectedCategory === category ? null : category),
    );
  };

  const openPoint = (point: BoardingPoint) => {
    navigation.navigate('BoardingPointDetails', {
      boardingPointId: point.id,
    });
  };

  const planFromPoint = (point: BoardingPoint) => {
    dispatch(
      setSelectedOrigin({
        id: point.id,
        name: point.name,
        address: point.address,
        latitude: point.latitude,
        longitude: point.longitude,
      }),
    );
    navigation.navigate('Main', { screen: 'PlanTrip' });
  };

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title="Explore nearby"
        subtitle={
          currentLocation
            ? `Boarding points within ${NEARBY_RADIUS_KM} km`
            : 'Find boarding points around you'
        }
        rightIcon="crosshairs-gps"
        onRightPress={requestLocation}
        rightAccessibilityLabel="Refresh my location"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DemoBanner />

        <View style={styles.mapWrap}>
          <TransportMap
            location={currentLocation}
            boardingPoints={points}
            selectedBoardingPointId={selectedId}
            onSelectBoardingPoint={point => setSelectedId(point.id)}
            style={styles.map}
          />
          {!currentLocation ? (
            <View
              style={[
                styles.mapOverlay,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <MaterialCommunityIcons
                name={
                  permissionStatus === 'blocked'
                    ? 'map-marker-off-outline'
                    : 'crosshairs-gps'
                }
                size={26}
                color={theme.colors.primary}
              />
              <Text
                variant="titleSmall"
                style={{ color: theme.colors.onSurface }}
              >
                {permissionStatus === 'blocked'
                  ? 'Location access is blocked'
                  : 'Show stops near you'}
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.emptyHint, { color: theme.colors.onSurfaceVariant }]}
              >
                {permissionStatus === 'blocked'
                  ? 'Enable location in device settings, or browse the sample stops below.'
                  : 'Allow location access to sort boarding points by distance.'}
              </Text>
              {permissionStatus === 'blocked' ? (
                <AppButton
                  label="Open settings"
                  mode="outlined"
                  fullWidth={false}
                  onPress={openAppSettings}
                  icon="cog-outline"
                />
              ) : (
                <AppButton
                  label="Use my location"
                  fullWidth={false}
                  loading={locationLoading}
                  onPress={requestLocation}
                  icon="crosshairs-gps"
                />
              )}
            </View>
          ) : null}
        </View>

        {locationError ? (
          <View
            style={[
              styles.notice,
              { backgroundColor: theme.colors.errorContainer },
            ]}
            accessibilityLiveRegion="polite"
          >
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onErrorContainer }}
            >
              {locationError}
            </Text>
          </View>
        ) : null}

        <Text
          variant="titleMedium"
          style={[styles.filterLabel, { color: theme.colors.onBackground }]}
        >
          Filter by transport
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {TRANSPORTATION_CATEGORY_LIST.map(category => (
            <CategoryCard
              key={category}
              category={category}
              compact
              selected={selectedCategory === category}
              onPress={() => toggleCategory(category)}
            />
          ))}
        </ScrollView>

        <View style={styles.listHeader}>
          <Text
            variant="titleMedium"
            style={[styles.listTitle, { color: theme.colors.onBackground }]}
          >
            {points.length} boarding point{points.length === 1 ? '' : 's'}
          </Text>
          {selectedCategory ? (
            <TouchableOpacity
              onPress={() => dispatch(setSelectedCategory(null))}
              accessibilityRole="button"
            >
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.primary }}
              >
                Clear filter
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {loading && points.length === 0 ? (
          <LoadingState message="Loading boarding points…" />
        ) : error && points.length === 0 ? (
          <ErrorState
            message={error}
            onRetry={() => dispatch(loadTransportationData())}
          />
        ) : points.length === 0 ? (
          <EmptyState
            icon="map-marker-off-outline"
            title="No boarding points match"
            message="Try clearing the transport filter or moving the search to another area."
            actionLabel="Clear filter"
            onAction={() => dispatch(setSelectedCategory(null))}
          />
        ) : (
          <View style={styles.list}>
            {points.map(point => (
              <BoardingPointCard
                key={point.id}
                boardingPoint={point}
                distanceMeters={getDistanceMeters(point)}
                onPress={() => {
                  setSelectedId(point.id);
                  openPoint(point);
                }}
              />
            ))}
          </View>
        )}

        {selectedPoint ? (
          <View
            style={[
              styles.selectedCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.primary,
              },
            ]}
          >
            <View style={styles.selectedHeader}>
              <MaterialCommunityIcons
                name="map-marker-check-outline"
                size={22}
                color={theme.colors.primary}
              />
              <Text
                variant="titleSmall"
                style={[styles.flex, { color: theme.colors.onSurface }]}
              >
                {selectedPoint.name}
              </Text>
            </View>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {selectedPoint.address}
            </Text>
            <View style={styles.selectedActions}>
              <AppButton
                label="Details"
                mode="outlined"
                fullWidth={false}
                onPress={() => openPoint(selectedPoint)}
              />
              <AppButton
                label="Plan from here"
                fullWidth={false}
                onPress={() => planFromPoint(selectedPoint)}
                icon="map-marker-path"
              />
            </View>
          </View>
        ) : null}

        {loading && points.length > 0 ? (
          <ActivityIndicator
            color={theme.colors.primary}
            style={styles.listLoader}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  mapWrap: {
    height: 280,
    marginBottom: 16,
    borderRadius: 18,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    alignItems: 'center',
  },
  emptyHint: {
    textAlign: 'center',
  },
  notice: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  flex: {
    flex: 1,
  },
  listTitle: {
    fontWeight: '700',
  },
  filterLabel: {
    fontWeight: '700',
    marginBottom: 10,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 4,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 12,
  },
  list: {
    gap: 10,
  },
  selectedCard: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  listLoader: {
    marginTop: 16,
  },
});

export default ExploreScreen;
