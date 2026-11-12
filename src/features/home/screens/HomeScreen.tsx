import React, { useCallback, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../../config/theme';
import { APP_NAME, TRANSPORTATION_CATEGORY_LIST } from '../../../config/constants';
import Screen from '../../../components/common/Screen';
import AppSearchInput from '../../../components/inputs/AppSearchInput';
import DemoBanner from '../../../components/common/DemoBanner';
import SectionHeader from '../../../components/common/SectionHeader';
import CategoryCard from '../../../components/cards/CategoryCard';
import BoardingPointCard from '../../../components/cards/BoardingPointCard';
import PopularRouteCard from '../../../components/cards/PopularRouteCard';
import AnnouncementCard from '../../../components/cards/AnnouncementCard';
import { EmptyState } from '../../../components/common/StateViews';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  getCurrentLocation,
} from '../../../redux/slices/locationSlice';
import {
  loadNearbyBoardingPoints,
  loadTransportationData,
  setSelectedCategory,
} from '../../../redux/slices/transportationSlice';
import { loadRoutes } from '../../../redux/slices/routesSlice';
import { useAppNavigation } from '../../../navigation/useAppNavigation';
import { getDistanceMeters } from '../../../utils/geo';

const greetingForNow = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
};

export const HomeScreen = () => {
  const theme = useAppTheme();
  const navigation = useAppNavigation();
  const dispatch = useAppDispatch();

  const user = useAppSelector(state => state.auth.user);
  const {
    categories,
    boardingPoints,
    nearbyBoardingPoints,
    popularRoutes,
    announcements,
    loading,
    error,
  } = useAppSelector(state => state.transportation);
  const currentLocation = useAppSelector(
    state => state.location.currentLocation,
  );
  const locationLoading = useAppSelector(state => state.location.loading);
  const locationError = useAppSelector(state => state.location.error);
  const unreadCount = useAppSelector(
    state => state.notifications.unreadCount,
  );
  const notificationEnabled = useAppSelector(
    state => state.settings.notificationEnabled,
  );
  const routes = useAppSelector(state => state.routes.routes);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(loadTransportationData());
    }
    if (routes.length === 0) {
      dispatch(loadRoutes());
    }
  }, [categories.length, dispatch, routes.length]);

  useEffect(() => {
    if (currentLocation) {
      dispatch(loadNearbyBoardingPoints({ location: currentLocation }));
    }
  }, [currentLocation, dispatch]);

  const requestLocation = useCallback(async () => {
    await dispatch(getCurrentLocation());
  }, [dispatch]);

  const openDestinationSearch = () => {
    navigation.navigate('LocationSearch', {
      field: 'destination',
      title: 'Where are you going?',
      returnTo: 'planner',
    });
  };

  const openCategory = (category: (typeof TRANSPORTATION_CATEGORY_LIST)[number]) => {
    dispatch(setSelectedCategory(category));
    navigation.navigate('Main', { screen: 'Explore' });
  };

  const pointsToShow = currentLocation
    ? nearbyBoardingPoints
    : boardingPoints;

  return (
    <Screen edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {greetingForNow()}
              {user ? `, ${user.firstName}` : ''}!
            </Text>
            <Text
              variant="headlineSmall"
              style={[styles.title, { color: theme.colors.onBackground }]}
            >
              Where are you headed today?
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={[
              styles.iconButton,
              { backgroundColor: theme.colors.surface },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Notifications, ${unreadCount} unread`}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={22}
              color={theme.colors.onSurface}
            />
            {notificationEnabled && unreadCount > 0 ? (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: theme.colors.error },
                ]}
              >
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        <DemoBanner />

        <AppSearchInput
          editable={false}
          onPress={openDestinationSearch}
          placeholder="Search a destination or place"
          accessibilityLabel="Search a destination"
        />

        <View
          style={[
            styles.locationCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <View
            style={[
              styles.locationIcon,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={22}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.locationBody}>
            <Text
              variant="labelLarge"
              style={{ color: theme.colors.onSurface }}
            >
              {currentLocation?.name ?? 'Your location'}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
              numberOfLines={2}
            >
              {currentLocation?.address ??
                'Allow location access to see nearby boarding points.'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={requestLocation}
            disabled={locationLoading}
            style={[
              styles.locationButton,
              { backgroundColor: theme.colors.primary },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Use my current location"
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.onPrimary }}
              >
                Locate
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {locationError ? (
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
              {locationError}
            </Text>
            <TouchableOpacity
              onPress={openDestinationSearch}
              accessibilityRole="button"
            >
              <Text
                variant="labelLarge"
                style={{ color: theme.colors.onErrorContainer }}
              >
                Pick a place manually
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <SectionHeader
          title="Transportation"
          subtitle="Explore the vehicle types in this build"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {TRANSPORTATION_CATEGORY_LIST.map(category => (
            <CategoryCard
              key={category}
              category={category}
              onPress={() => openCategory(category)}
            />
          ))}
        </ScrollView>

        <View style={styles.section}>
          <SectionHeader
            title={currentLocation ? 'Nearby boarding points' : 'Boarding points'}
            subtitle={
              currentLocation
                ? 'Within 3 km of your location'
                : 'Sample stops from the demonstration dataset'
            }
            actionLabel="See map"
            onAction={() => navigation.navigate('Main', { screen: 'Explore' })}
          />
          {loading && pointsToShow.length === 0 ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : pointsToShow.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {pointsToShow.map(point => (
                <BoardingPointCard
                  key={point.id}
                  boardingPoint={point}
                  distanceMeters={getDistanceMeters(point)}
                  horizontal
                  onPress={() =>
                    navigation.navigate('BoardingPointDetails', {
                      boardingPointId: point.id,
                    })
                  }
                />
              ))}
            </ScrollView>
          ) : (
            <EmptyState
              icon="map-marker-off-outline"
              title="No stops found nearby"
              message={
                error ??
                'Try refreshing your location or browse the full map in Explore.'
              }
              actionLabel="Open Explore"
              onAction={() => navigation.navigate('Main', { screen: 'Explore' })}
            />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Popular routes"
            subtitle="Sample trips from the demonstration dataset"
          />
          {popularRoutes.map(route => (
            <PopularRouteCard
              key={route.id}
              route={route}
              onPress={() =>
                navigation.navigate('RouteDetails', { routeId: route.routeId })
              }
            />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Service updates" subtitle="Sample advisories" />
          {announcements.map(announcement => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
            />
          ))}
        </View>

        <View style={styles.planCard}>
          <View style={styles.planText}>
            <Text
              variant="titleMedium"
              style={[styles.planTitle, { color: theme.colors.onPrimary }]}
            >
              Ready to plan a trip?
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.planSubtitle, { color: theme.colors.onPrimary }]}
            >
              Compare direct rides and transfers with walking directions.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Main', { screen: 'PlanTrip' })}
            style={styles.planButton}
            accessibilityRole="button"
            accessibilityLabel="Plan a trip"
          >
            <MaterialCommunityIcons
              name="arrow-right"
              size={22}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        <Text
          variant="labelSmall"
          style={[styles.footer, { color: theme.colors.onSurfaceVariant }]}
        >
          {APP_NAME} · Routes and fares shown here are demonstration data.
        </Text>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontWeight: '700',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  locationIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationBody: {
    flex: 1,
    gap: 2,
  },
  locationButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 6,
  },
  categoryRow: {
    gap: 10,
    paddingBottom: 4,
  },
  section: {
    marginTop: 24,
  },
  horizontalList: {
    gap: 10,
    paddingRight: 8,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#163D32',
    borderRadius: 18,
    padding: 16,
    marginTop: 28,
  },
  planText: {
    flex: 1,
    gap: 2,
  },
  planTitle: {
    fontWeight: '700',
  },
  planSubtitle: {
    opacity: 0.85,
  },
  planButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#B8E65A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HomeScreen;
