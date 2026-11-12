import React, { useCallback, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../../config/theme';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import DemoBanner from '../../../components/common/DemoBanner';
import AppButton from '../../../components/buttons/AppButton';
import RouteOptionCard from '../../../components/cards/RouteOptionCard';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../components/common/StateViews';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  getCurrentLocation,
  setSelectedDestination,
  setSelectedOrigin,
  swapOriginDestination,
} from '../../../redux/slices/locationSlice';
import {
  planTrip,
  setSelectedRouteOption,
} from '../../../redux/slices/routesSlice';
import { useAppNavigation } from '../../../navigation/useAppNavigation';
import { isSameLocation, toLocationLabel } from '../../../utils/geo';
import type { Location, RouteOption } from '../../../types';

interface LocationFieldProps {
  label: string;
  value: Location | null;
  icon: string;
  onPress: () => void;
  onClear?: () => void;
}

const LocationField = ({
  label,
  value,
  icon,
  onPress,
  onClear,
}: LocationFieldProps) => {
  const theme = useAppTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.field,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${toLocationLabel(value)}`}
    >
      <View
        style={[
          styles.fieldIcon,
          { backgroundColor: theme.colors.primaryContainer },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.fieldBody}>
        <Text
          variant="labelSmall"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {label}
        </Text>
        <Text
          variant="bodyLarge"
          style={{ color: theme.colors.onSurface }}
          numberOfLines={1}
        >
          {toLocationLabel(value)}
        </Text>
      </View>
      {value && onClear ? (
        <TouchableOpacity
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel={`Clear ${label}`}
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name="close-circle"
            size={20}
            color={theme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      ) : (
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={theme.colors.onSurfaceVariant}
        />
      )}
    </TouchableOpacity>
  );
};

export const TripPlannerScreen = () => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const navigation = useAppNavigation();

  const {
    selectedOrigin,
    selectedDestination,
    currentLocation,
    loading: locationLoading,
    error: locationError,
  } = useAppSelector(state => state.location);
  const { routeOptions, loading, error, currentTrip } = useAppSelector(
    state => state.routes,
  );
  const { autoStartNavigation, locationSharing } = useAppSelector(
    state => state.settings,
  );

  // Apply the "location sharing" preference once per visit: if the user
  // already has a current location, start the form from there.
  const appliedLocationPreference = useRef(false);
  useEffect(() => {
    if (
      appliedLocationPreference.current ||
      !locationSharing ||
      selectedOrigin ||
      !currentLocation
    ) {
      return;
    }
    appliedLocationPreference.current = true;
    dispatch(setSelectedOrigin(currentLocation));
  }, [currentLocation, dispatch, locationSharing, selectedOrigin]);

  const chooseOrigin = () =>
    navigation.navigate('LocationSearch', {
      field: 'origin',
      title: 'Choose your starting point',
      returnTo: 'back',
    });

  const chooseDestination = () =>
    navigation.navigate('LocationSearch', {
      field: 'destination',
      title: 'Choose your destination',
      returnTo: 'back',
    });

  const useCurrentLocation = useCallback(async () => {
    const result = await dispatch(getCurrentLocation());
    if (getCurrentLocation.fulfilled.match(result)) {
      dispatch(setSelectedOrigin(result.payload));
    }
  }, [dispatch]);

  const canPlan = Boolean(selectedOrigin && selectedDestination);
  const tripMatchesSelection = Boolean(
    currentTrip &&
      isSameLocation(currentTrip.origin, selectedOrigin) &&
      isSameLocation(currentTrip.destination, selectedDestination),
  );
  const visibleOptions = tripMatchesSelection ? routeOptions : [];

  const submit = () => {
    if (!selectedOrigin || !selectedDestination) {
      return;
    }
    dispatch(
      planTrip({
        origin: selectedOrigin,
        destination: selectedDestination,
      }),
    );
  };

  const openOption = (option: RouteOption) => {
    dispatch(setSelectedRouteOption(option));
    navigation.navigate(
      autoStartNavigation ? 'Navigation' : 'RouteDetails',
      { optionId: option.id },
    );
  };

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title="Plan a trip"
        subtitle="Compare sample routes, transfers, and walking directions"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <DemoBanner />

        <View
          style={[
            styles.formCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <LocationField
            label="From"
            value={selectedOrigin}
            icon="circle-slice-8"
            onPress={chooseOrigin}
            onClear={() => dispatch(setSelectedOrigin(null))}
          />
          <View style={styles.swapRow}>
            <View
              style={[
                styles.divider,
                { backgroundColor: theme.colors.outline },
              ]}
            />
            <TouchableOpacity
              onPress={() => dispatch(swapOriginDestination())}
              style={[
                styles.swapButton,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Swap origin and destination"
            >
              <MaterialCommunityIcons
                name="swap-vertical"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
          <LocationField
            label="To"
            value={selectedDestination}
            icon="map-marker-outline"
            onPress={chooseDestination}
            onClear={() => dispatch(setSelectedDestination(null))}
          />

          {!selectedOrigin ? (
            <TouchableOpacity
              onPress={useCurrentLocation}
              disabled={locationLoading}
              style={styles.currentLocationRow}
              accessibilityRole="button"
              accessibilityState={{ disabled: locationLoading }}
            >
              <MaterialCommunityIcons
                name="crosshairs-gps"
                size={18}
                color={theme.colors.primary}
              />
              <Text
                variant="labelLarge"
                style={{ color: theme.colors.primary }}
              >
                {locationLoading
                  ? 'Finding your location…'
                  : 'Use my current location'}
              </Text>
            </TouchableOpacity>
          ) : null}

          <AppButton
            label="Find routes"
            onPress={submit}
            disabled={!canPlan}
            loading={loading}
            icon="map-search-outline"
            style={styles.submit}
          />
        </View>

        {locationError ? (
          <View
            style={[
              styles.locationError,
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

        {!canPlan ? (
          <EmptyState
            icon="map-marker-path"
            title="Choose both points"
            message="Pick a starting point and destination to compare the demonstration routes."
          />
        ) : loading ? (
          <LoadingState message="Comparing routes…" />
        ) : error ? (
          <ErrorState message={error} onRetry={submit} />
        ) : visibleOptions.length > 0 ? (
          <View style={styles.results}>
            <View style={styles.resultsHeader}>
              <Text
                variant="titleMedium"
                style={[styles.resultsTitle, { color: theme.colors.onBackground }]}
              >
                {visibleOptions.length} option
                {visibleOptions.length === 1 ? '' : 's'}
              </Text>
              {tripMatchesSelection && currentTrip ? (
                <Text
                  variant="labelSmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Best: {currentTrip.estimatedDuration} min · ₱
                  {currentTrip.estimatedFare}
                </Text>
              ) : null}
            </View>
            {visibleOptions.map((option, index) => (
              <RouteOptionCard
                key={option.id}
                option={option}
                recommended={index === 0}
                onPress={() => openOption(option)}
              />
            ))}
          </View>
        ) : tripMatchesSelection && currentTrip ? (
          <EmptyState
            icon="map-marker-question-outline"
            title="No route found"
            message="The demonstration route graph does not connect these two points. Try a different pair of locations."
          />
        ) : null}

        <View
          style={[
            styles.tip,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={18}
            color={theme.colors.primary}
          />
          <Text
            variant="bodySmall"
            style={[styles.flex, { color: theme.colors.onSurfaceVariant }]}
          >
            Fares and travel times are estimates for demonstration purposes. No
            live vehicle tracking is available in this build.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  formCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldBody: {
    flex: 1,
    gap: 1,
  },
  swapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  locationError: {
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  submit: {
    marginTop: 6,
  },
  results: {
    marginTop: 24,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultsTitle: {
    fontWeight: '700',
  },
  flex: {
    flex: 1,
  },
  tip: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 14,
    padding: 12,
    marginTop: 24,
    alignItems: 'flex-start',
  },
});

export default TripPlannerScreen;
