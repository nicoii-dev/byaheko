import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../../config/theme';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import DemoBanner from '../../../components/common/DemoBanner';
import AppButton from '../../../components/buttons/AppButton';
import TransportBadge from '../../../components/common/TransportBadge';
import { EmptyState } from '../../../components/common/StateViews';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  setSelectedDestination,
  setSelectedOrigin,
} from '../../../redux/slices/locationSlice';
import {
  planTrip,
  setSelectedRouteOption,
} from '../../../redux/slices/routesSlice';
import { addFavorite, removeFavorite } from '../../../redux/slices/favoritesSlice';
import { formatDistance, formatDuration, formatFare } from '../../../utils/geo';
import type { RootStackParamList } from '../../../navigation/types';
import type { Location, Route, RouteOption, TripStep } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RouteDetails'>;

const stepIcon = (step: TripStep): string => {
  if (step.transportationType) {
    switch (step.transportationType) {
      case 'jeepney':
        return 'bus-side';
      case 'modern_jeepney':
        return 'bus-electric';
      case 'multicab':
        return 'car-estate';
      case 'tricycle':
        return 'motorbike';
      case 'bus':
        return 'bus';
      case 'uv_express':
        return 'van-passenger';
      case 'van':
        return 'van-utility';
      case 'ferry':
        return 'ferry';
      case 'train':
        return 'train';
      default:
        return 'map-marker-path';
    }
  }
  return 'walk';
};

const toStopLocation = (
  stop: Route['stops'][number],
): Location => ({
  id: stop.id,
  name: stop.name,
  address: stop.name,
  latitude: stop.latitude,
  longitude: stop.longitude,
});

export const RouteDetailsScreen = ({ navigation, route: screenRoute }: Props) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();

  const routeOptions = useAppSelector(state => state.routes.routeOptions);
  const selectedOption = useAppSelector(
    state => state.routes.selectedRouteOption,
  );
  const routes = useAppSelector(state => state.routes.routes);
  const favorites = useAppSelector(state => state.favorites.items);

  const option: RouteOption | null = useMemo(() => {
    const optionId = screenRoute.params?.optionId;
    if (optionId) {
      return routeOptions.find(item => item.id === optionId) ?? null;
    }
    // A routeId means this screen was opened from a saved or popular route.
    // Do not fall back to a previously selected planner option in that case.
    if (screenRoute.params?.routeId) {
      return null;
    }
    return selectedOption;
  }, [
    routeOptions,
    screenRoute.params?.optionId,
    screenRoute.params?.routeId,
    selectedOption,
  ]);

  const routeId =
    screenRoute.params?.routeId ?? option?.routeIds[0] ?? undefined;
  const selectedRoute = routeId
    ? routes.find(item => item.id === routeId) ?? null
    : null;

  const favorite = selectedRoute
    ? favorites.find(
        item =>
          item.type === 'route' &&
          'id' in item.data &&
          item.data.id === selectedRoute.id,
      )
    : undefined;

  const toggleFavorite = () => {
    if (!selectedRoute) {
      return;
    }
    if (favorite) {
      dispatch(removeFavorite(favorite.id));
      return;
    }
    dispatch(
      addFavorite({
        type: 'route',
        name: selectedRoute.routeName,
        data: selectedRoute,
      }),
    );
  };

  const startNavigation = () => {
    if (!option) {
      return;
    }
    dispatch(setSelectedRouteOption(option));
    navigation.navigate('Navigation', { optionId: option.id });
  };

  const planSelectedRoute = () => {
    if (!selectedRoute || selectedRoute.stops.length < 2) {
      return;
    }
    const first = selectedRoute.stops[0];
    const last = selectedRoute.stops[selectedRoute.stops.length - 1];
    const origin = toStopLocation(first);
    const destination = toStopLocation(last);
    dispatch(setSelectedOrigin(origin));
    dispatch(setSelectedDestination(destination));
    dispatch(planTrip({ origin, destination }));
    navigation.navigate('Main', { screen: 'PlanTrip' });
  };

  if (!option && !selectedRoute) {
    return (
      <Screen>
        <ScreenHeader title="Route details" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="routes"
          title="No route selected"
          message="Choose a route option from the trip planner to see its details."
          actionLabel="Plan a trip"
          onAction={() => navigation.navigate('Main', { screen: 'PlanTrip' })}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title={option ? 'Route option' : selectedRoute?.routeCode ?? 'Route'}
        subtitle={option?.summary ?? selectedRoute?.routeName}
        onBack={() => navigation.goBack()}
        rightIcon={selectedRoute ? (favorite ? 'heart' : 'heart-outline') : undefined}
        onRightPress={selectedRoute ? toggleFavorite : undefined}
        rightAccessibilityLabel={
          favorite ? 'Remove from favorites' : 'Save route to favorites'
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DemoBanner />

        {option ? (
          <>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.outline,
                },
              ]}
            >
              <Text
                variant="titleMedium"
                style={[styles.summaryTitle, { color: theme.colors.onSurface }]}
              >
                {option.summary}
              </Text>
              <View style={styles.badges}>
                {option.transportationTypes.length > 0 ? (
                  option.transportationTypes.map(category => (
                    <TransportBadge key={category} category={category} />
                  ))
                ) : (
                  <TransportBadge category="jeepney" compact />
                )}
              </View>
              <View style={styles.metrics}>
                <View style={styles.metric}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <View>
                    <Text
                      variant="labelSmall"
                      style={{ color: theme.colors.onSurfaceVariant }}
                    >
                      Estimated time
                    </Text>
                    <Text
                      variant="bodyLarge"
                      style={{ color: theme.colors.onSurface }}
                    >
                      {formatDuration(option.estimatedTravelTime)}
                    </Text>
                  </View>
                </View>
                <View style={styles.metric}>
                  <MaterialCommunityIcons
                    name="cash"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <View>
                    <Text
                      variant="labelSmall"
                      style={{ color: theme.colors.onSurfaceVariant }}
                    >
                      Estimated fare
                    </Text>
                    <Text
                      variant="bodyLarge"
                      style={{ color: theme.colors.onSurface }}
                    >
                      {formatFare(option.estimatedFare)}
                    </Text>
                  </View>
                </View>
                <View style={styles.metric}>
                  <MaterialCommunityIcons
                    name="walk"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <View>
                    <Text
                      variant="labelSmall"
                      style={{ color: theme.colors.onSurfaceVariant }}
                    >
                      Walking
                    </Text>
                    <Text
                      variant="bodyLarge"
                      style={{ color: theme.colors.onSurface }}
                    >
                      {formatDistance(option.walkingDistance)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
            >
              Step by step
            </Text>
            <View style={styles.timeline}>
              {option.steps.map((step, index) => (
                <View key={step.id} style={styles.stepRow}>
                  <View style={styles.stepRail}>
                    <View
                      style={[
                        styles.stepDot,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={stepIcon(step)}
                        size={16}
                        color={theme.colors.onPrimary}
                      />
                    </View>
                    {index < option.steps.length - 1 ? (
                      <View
                        style={[
                          styles.stepLine,
                          { backgroundColor: theme.colors.outline },
                        ]}
                      />
                    ) : null}
                  </View>
                  <View
                    style={[
                      styles.stepBody,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.outline,
                      },
                    ]}
                  >
                    <Text
                      variant="bodyMedium"
                      style={{ color: theme.colors.onSurface }}
                    >
                      {step.instruction}
                    </Text>
                    <View style={styles.stepMeta}>
                      {step.duration ? (
                        <Text
                          variant="labelSmall"
                          style={{ color: theme.colors.onSurfaceVariant }}
                        >
                          {formatDuration(step.duration)}
                        </Text>
                      ) : null}
                      {typeof step.fare === 'number' && step.fare > 0 ? (
                        <Text
                          variant="labelSmall"
                          style={{ color: theme.colors.onSurfaceVariant }}
                        >
                          {formatFare(step.fare)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.actions}>
              <AppButton
                label="Start navigation"
                onPress={startNavigation}
                icon="navigation-variant-outline"
              />
              {selectedRoute ? (
                <AppButton
                  label={favorite ? 'Saved to favorites' : 'Save route'}
                  mode="outlined"
                  onPress={toggleFavorite}
                  icon={favorite ? 'heart' : 'heart-outline'}
                />
              ) : null}
            </View>
          </>
        ) : selectedRoute ? (
          <>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.outline,
                },
              ]}
            >
              <View style={styles.badges}>
                <TransportBadge category={selectedRoute.transportationType} />
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        selectedRoute.status === 'active'
                          ? theme.colors.secondaryContainer
                          : theme.colors.errorContainer,
                    },
                  ]}
                >
                  <Text
                    variant="labelSmall"
                    style={{
                      color:
                        selectedRoute.status === 'active'
                          ? theme.colors.onSecondaryContainer
                          : theme.colors.onErrorContainer,
                    }}
                  >
                    {selectedRoute.status}
                  </Text>
                </View>
              </View>
              <Text
                variant="titleMedium"
                style={[styles.summaryTitle, { color: theme.colors.onSurface }]}
              >
                {selectedRoute.routeName}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {selectedRoute.origin} → {selectedRoute.destination}
              </Text>
              <View style={styles.metrics}>
                <View style={styles.metric}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurface }}
                  >
                    {formatDuration(selectedRoute.estimatedDuration)}
                  </Text>
                </View>
                <View style={styles.metric}>
                  <MaterialCommunityIcons
                    name="cash"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurface }}
                  >
                    {formatFare(selectedRoute.fare)}
                  </Text>
                </View>
              </View>
            </View>

            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
            >
              Stops
            </Text>
            <View
              style={[
                styles.stopsCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.outline,
                },
              ]}
            >
              {selectedRoute.stops.map((stop, index) => (
                <View key={stop.id} style={styles.stopRow}>
                  <View style={styles.stopRail}>
                    <View
                      style={[
                        styles.stopDot,
                        {
                          backgroundColor:
                            index === 0 || index === selectedRoute.stops.length - 1
                              ? theme.colors.primary
                              : theme.colors.surface,
                          borderColor: theme.colors.primary,
                        },
                      ]}
                    />
                    {index < selectedRoute.stops.length - 1 ? (
                      <View
                        style={[
                          styles.stopLine,
                          { backgroundColor: theme.colors.outline },
                        ]}
                      />
                    ) : null}
                  </View>
                  <View style={styles.stopBody}>
                    <Text
                      variant="bodyMedium"
                      style={{ color: theme.colors.onSurface }}
                    >
                      {stop.name}
                    </Text>
                    <Text
                      variant="labelSmall"
                      style={{ color: theme.colors.onSurfaceVariant }}
                    >
                      Stop {stop.sequence} · {stop.stopType}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.actions}>
              <AppButton
                label="Plan this route"
                onPress={planSelectedRoute}
                icon="map-marker-path"
              />
              <AppButton
                label={favorite ? 'Saved to favorites' : 'Save route'}
                mode="outlined"
                onPress={toggleFavorite}
                icon={favorite ? 'heart' : 'heart-outline'}
              />
            </View>
          </>
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
  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  summaryTitle: {
    fontWeight: '700',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    marginTop: 4,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  timeline: {
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stepRail: {
    alignItems: 'center',
    width: 32,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 16,
  },
  stepBody: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    gap: 4,
  },
  stepMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  actions: {
    gap: 10,
    marginTop: 24,
  },
  stopsCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  stopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stopRail: {
    alignItems: 'center',
    width: 16,
  },
  stopDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  stopLine: {
    width: 2,
    flex: 1,
    minHeight: 18,
  },
  stopBody: {
    flex: 1,
    paddingBottom: 14,
    gap: 1,
  },
});

export default RouteDetailsScreen;
