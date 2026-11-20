import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  TRANSPORTATION_META,
} from '../../../config/constants';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import CategoryCard from '../../../components/cards/CategoryCard';
import BoardingPointCard from '../../../components/cards/BoardingPointCard';
import MapLibreMap from '../../../components/maps/MapLibreMap';
import AppSearchInput from '../../../components/inputs/AppSearchInput';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../components/common/StateViews';
import AppButton from '../../../components/buttons/AppButton';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  addRecentSearch,
  getCurrentLocation,
  searchPlaces,
  setSelectedDestination,
  setSelectedOrigin,
} from '../../../redux/slices/locationSlice';
import {
  loadNearbyBoardingPoints,
  loadTransportationData,
  setSelectedCategory,
} from '../../../redux/slices/transportationSlice';
import { loadRoutes } from '../../../redux/slices/routesSlice';
import { useAppNavigation } from '../../../navigation/useAppNavigation';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { getDistanceMeters } from '../../../utils/geo';
import { openAppSettings } from '../../../services/location/deviceLocation';
import type { BoardingPoint, Location, Route } from '../../../types';

export const ExploreScreen = () => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const navigation = useAppNavigation();

  const {
    boardingPoints,
    nearbyBoardingPoints,
    selectedCategory,
    loading: transportationLoading,
    error: transportationError,
  } = useAppSelector(state => state.transportation);
  const {
    routes,
    loading: routesLoading,
    error: routesError,
  } = useAppSelector(state => state.routes);
  const {
    currentLocation,
    selectedDestination,
    permissionStatus,
    accessAllowed,
    restoring,
    loading: locationLoading,
    error: locationError,
  } = useAppSelector(state => state.location);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query, 350);
  const latestQuery = useRef(query);

  const nearbyAccessDenied =
    permissionStatus === 'blocked' || permissionStatus === 'denied';
  const showLocationPrompt = !accessAllowed || nearbyAccessDenied;

  useEffect(() => {
    if (boardingPoints.length === 0) {
      dispatch(loadTransportationData());
    }
    if (routes.length === 0) {
      dispatch(loadRoutes());
    }
  }, [boardingPoints.length, dispatch, routes.length]);

  useEffect(() => {
    if (currentLocation) {
      dispatch(loadNearbyBoardingPoints({ location: currentLocation }));
    }
  }, [currentLocation, dispatch]);

  // Destination geocoding is debounced and guarded against stale responses.
  useEffect(() => {
    latestQuery.current = query;
    if (query.trim().length === 0) {
      setSearchResults([]);
      setSearching(false);
      setSearchError(null);
    } else {
      setSearching(true);
    }
  }, [query]);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length === 0) {
      return;
    }

    let active = true;
    dispatch(searchPlaces(trimmed))
      .unwrap()
      .then(found => {
        if (!active || latestQuery.current.trim() !== trimmed) {
          return;
        }
        setSearchResults(found);
        setSearchError(null);
      })
      .catch(() => {
        if (!active || latestQuery.current.trim() !== trimmed) {
          return;
        }
        setSearchResults([]);
        setSearchError('Place search is unavailable right now. Try again later.');
      })
      .finally(() => {
        if (active && latestQuery.current.trim() === trimmed) {
          setSearching(false);
        }
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery, dispatch]);

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

  const selectedPoint = points.find(point => point.id === selectedId) ?? null;
  const selectedRoute: Route | null = useMemo(
    () => routes.find(route => route.id === selectedRouteId) ?? null,
    [routes, selectedRouteId],
  );

  const toggleCategory = (
    category: (typeof TRANSPORTATION_CATEGORY_LIST)[number],
  ) => {
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

  const selectDestination = useCallback(
    (location: Location) => {
      dispatch(addRecentSearch(location));
      dispatch(setSelectedDestination(location));
      setQuery('');
      setSearchResults([]);
    },
    [dispatch],
  );

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title="Explore nearby"
        subtitle={
          currentLocation
            ? `Routes and stops within ${NEARBY_RADIUS_KM} km`
            : accessAllowed && !nearbyAccessDenied
              ? 'Finding transport near you…'
              : 'Find routes and stops around you'
        }
        rightIcon="crosshairs-gps"
        onRightPress={requestLocation}
        rightAccessibilityLabel="Refresh my location"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mapWrap}>
          <MapLibreMap
            routes={routes}
            boardingPoints={points}
            selectedRouteId={selectedRouteId}
            selectedBoardingPointId={selectedId}
            location={currentLocation}
            destination={selectedDestination}
            onSelectRoute={routeId =>
              setSelectedRouteId(current =>
                current === routeId ? null : routeId,
              )
            }
            onSelectBoardingPoint={point => setSelectedId(point.id)}
            style={styles.map}
          />
          {showLocationPrompt ? (
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
                style={[
                  styles.emptyHint,
                  { color: theme.colors.onSurfaceVariant },
                ]}
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
          ) : !currentLocation ? (
            <View
              style={[
                styles.mapOverlay,
                { backgroundColor: theme.colors.surface },
              ]}
              accessibilityLiveRegion="polite"
            >
              <ActivityIndicator color={theme.colors.primary} />
              <Text
                variant="titleSmall"
                style={{ color: theme.colors.onSurface }}
              >
                {restoring ? 'Finding your location…' : 'Location unavailable'}
              </Text>
              <Text
                variant="bodySmall"
                style={[
                  styles.emptyHint,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {restoring
                  ? 'Nearby boarding points will appear automatically.'
                  : 'Showing all boarding points for now. Tap the GPS icon to retry.'}
              </Text>
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

        <Text
          variant="titleMedium"
          style={[styles.filterLabel, { color: theme.colors.onBackground }]}
        >
          Destination
        </Text>
        <AppSearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search a place, landmark, or address"
          accessibilityLabel="Search for a destination"
        />
        {selectedDestination ? (
          <View
            style={[
              styles.destinationChip,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <MaterialCommunityIcons
              name="map-marker-check-outline"
              size={18}
              color={theme.colors.primary}
            />
            <View style={styles.flex}>
              <Text
                variant="labelLarge"
                style={{ color: theme.colors.onPrimaryContainer }}
                numberOfLines={1}
              >
                {selectedDestination.name ?? 'Selected destination'}
              </Text>
              {selectedDestination.address ? (
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onPrimaryContainer }}
                  numberOfLines={1}
                >
                  {selectedDestination.address}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => dispatch(setSelectedDestination(null))}
              accessibilityRole="button"
              accessibilityLabel="Clear destination"
            >
              <MaterialCommunityIcons
                name="close"
                size={18}
                color={theme.colors.onPrimaryContainer}
              />
            </TouchableOpacity>
          </View>
        ) : null}
        {searchError ? (
          <Text
            variant="bodySmall"
            style={[styles.searchError, { color: theme.colors.error }]}
          >
            {searchError}
          </Text>
        ) : null}
        {searching ? (
          <View style={styles.searching}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Searching places…
            </Text>
          </View>
        ) : searchResults.length > 0 ? (
          <View style={styles.searchResults}>
            {searchResults.map(result => (
              <TouchableOpacity
                key={
                  result.id ?? `${result.latitude},${result.longitude}`
                }
                onPress={() => selectDestination(result)}
                style={[
                  styles.searchRow,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.outline,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Select ${result.name ?? 'place'}`}
              >
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <View style={styles.flex}>
                  <Text
                    variant="titleSmall"
                    style={{ color: theme.colors.onSurface }}
                    numberOfLines={1}
                  >
                    {result.name ?? 'Pinned location'}
                  </Text>
                  {result.address ? (
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.onSurfaceVariant }}
                      numberOfLines={1}
                    >
                      {result.address}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <TouchableOpacity
          onPress={() => navigation.navigate('TransportationDirectory')}
          style={[
            styles.directoryLink,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Browse the transportation directory"
        >
          <MaterialCommunityIcons
            name="view-grid-outline"
            size={20}
            color={theme.colors.primary}
          />
          <View style={styles.directoryText}>
            <Text
              variant="titleSmall"
              style={{ color: theme.colors.onSurface }}
            >
              Transportation directory
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Compare vehicle types, routes, and fare ranges.
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={theme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>

        <View style={styles.listHeader}>
          <Text
            variant="titleMedium"
            style={[styles.listTitle, { color: theme.colors.onBackground }]}
          >
            Routes on the map
          </Text>
          {selectedRouteId ? (
            <TouchableOpacity
              onPress={() => setSelectedRouteId(null)}
              accessibilityRole="button"
            >
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.primary }}
              >
                Clear selection
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {routesLoading && routes.length === 0 ? (
          <LoadingState message="Loading routes…" />
        ) : routesError && routes.length === 0 ? (
          <ErrorState
            message={routesError}
            onRetry={() => dispatch(loadRoutes())}
          />
        ) : routes.length === 0 ? (
          <EmptyState
            icon="route"
            title="No routes available"
            message="Routes with mapped stops will appear here once they are published."
            actionLabel="Retry"
            onAction={() => dispatch(loadRoutes())}
          />
        ) : (
          <View style={styles.list}>
            {routes.map(route => {
              const active = route.id === selectedRouteId;
              const meta = TRANSPORTATION_META[route.transportationType];
              return (
                <TouchableOpacity
                  key={route.id}
                  onPress={() =>
                    setSelectedRouteId(current =>
                      current === route.id ? null : route.id,
                    )
                  }
                  style={[
                    styles.routeRow,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: active
                        ? theme.colors.primary
                        : theme.colors.outline,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Show route ${route.routeName}`}
                >
                  <View
                    style={[
                      styles.routeIcon,
                      { backgroundColor: theme.colors.primaryContainer },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={meta.icon}
                      size={20}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.flex}>
                    <Text
                      variant="titleSmall"
                      style={{ color: theme.colors.onSurface }}
                      numberOfLines={1}
                    >
                      {route.routeName || route.routeCode}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.onSurfaceVariant }}
                      numberOfLines={1}
                    >
                      {route.origin} → {route.destination}
                    </Text>
                  </View>
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {meta.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {selectedRoute ? (
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
                name="map-marker-path"
                size={22}
                color={theme.colors.primary}
              />
              <Text
                variant="titleSmall"
                style={[styles.flex, { color: theme.colors.onSurface }]}
              >
                {selectedRoute.routeName || selectedRoute.routeCode}
              </Text>
            </View>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {selectedRoute.origin} → {selectedRoute.destination}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {selectedRoute.stops.length} mapped stop
              {selectedRoute.stops.length === 1 ? '' : 's'} · Fare ₱
              {selectedRoute.fare.toFixed(2)} · ~
              {selectedRoute.estimatedDuration} min
            </Text>
            {selectedDestination ? (
              <AppButton
                label="Plan a trip here"
                fullWidth={false}
                icon="map-marker-path"
                onPress={() => {
                  const firstStop = selectedRoute.stops[0];
                  if (firstStop) {
                    dispatch(
                      setSelectedOrigin({
                        id: firstStop.id,
                        name: firstStop.name,
                        latitude: firstStop.latitude,
                        longitude: firstStop.longitude,
                      }),
                    );
                  }
                  navigation.navigate('Main', { screen: 'PlanTrip' });
                }}
              />
            ) : null}
          </View>
        ) : null}

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

        {transportationLoading && points.length === 0 ? (
          <LoadingState message="Loading boarding points…" />
        ) : transportationError && points.length === 0 ? (
          <ErrorState
            message={transportationError}
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

        {(transportationLoading || routesLoading) &&
        (points.length > 0 || routes.length > 0) ? (
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
    marginTop: 4,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 4,
  },
  destinationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  searchError: {
    marginTop: 8,
  },
  searching: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  searchResults: {
    gap: 8,
    marginTop: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  directoryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
  },
  directoryText: {
    flex: 1,
    gap: 1,
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
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  routeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
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
