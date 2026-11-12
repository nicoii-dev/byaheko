import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../../config/theme';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import DemoBanner from '../../../components/common/DemoBanner';
import AppButton from '../../../components/buttons/AppButton';
import TransportBadge from '../../../components/common/TransportBadge';
import TransportMap from '../../../components/maps/TransportMap';
import { EmptyState } from '../../../components/common/StateViews';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setSelectedOrigin } from '../../../redux/slices/locationSlice';
import { addFavorite, removeFavorite } from '../../../redux/slices/favoritesSlice';
import { formatDuration, formatFare, haversineDistance } from '../../../utils/geo';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BoardingPointDetails'>;

export const BoardingPointDetailsScreen = ({ navigation, route }: Props) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const boardingPoints = useAppSelector(
    state => state.transportation.boardingPoints,
  );
  const routes = useAppSelector(state => state.routes.routes);
  const favorites = useAppSelector(state => state.favorites.items);

  const point = useMemo(
    () =>
      boardingPoints.find(
        item => item.id === route.params.boardingPointId,
      ) ?? null,
    [boardingPoints, route.params.boardingPointId],
  );

  const servedRoutes = useMemo(
    () =>
      point
        ? routes.filter(item =>
            item.stops.some(stop => haversineDistance(stop, point) < 120),
          )
        : [],
    [point, routes],
  );

  const favorite = point
    ? favorites.find(
        item =>
          item.type === 'boarding_point' &&
          'id' in item.data &&
          item.data.id === point.id,
      )
    : undefined;

  if (!point) {
    return (
      <Screen>
        <ScreenHeader
          title="Boarding point"
          onBack={() => navigation.goBack()}
        />
        <EmptyState
          icon="map-marker-question-outline"
          title="Boarding point not found"
          message="This stop may have been removed from the demonstration dataset."
          actionLabel="Open Explore"
          onAction={() => navigation.navigate('Main', { screen: 'Explore' })}
        />
      </Screen>
    );
  }

  const toggleFavorite = () => {
    if (favorite) {
      dispatch(removeFavorite(favorite.id));
      return;
    }
    dispatch(
      addFavorite({
        type: 'boarding_point',
        name: point.name,
        data: point,
      }),
    );
  };

  const planFromHere = () => {
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
        title={point.name}
        subtitle={point.address}
        onBack={() => navigation.goBack()}
        rightIcon={favorite ? 'heart' : 'heart-outline'}
        onRightPress={toggleFavorite}
        rightAccessibilityLabel={
          favorite ? 'Remove from favorites' : 'Save boarding point'
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DemoBanner />

        <TransportMap
          center={point}
          boardingPoints={[point]}
          selectedBoardingPointId={point.id}
          showRecenter={false}
          style={styles.map}
        />

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
            >
              <MaterialCommunityIcons
                name="map-marker-radius-outline"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.cardTitleWrap}>
              <Text
                variant="titleMedium"
                style={[styles.bold, { color: theme.colors.onSurface }]}
              >
                {point.name}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {point.address}
              </Text>
            </View>
          </View>

          <View style={styles.badges}>
            {point.transportationTypes.map(category => (
              <TransportBadge key={category} category={category} />
            ))}
          </View>

          {point.description ? (
            <Text
              variant="bodyMedium"
              style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
            >
              {point.description}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <AppButton
              label="Plan a trip from here"
              onPress={planFromHere}
              icon="map-marker-path"
            />
            <AppButton
              label={favorite ? 'Saved to favorites' : 'Save boarding point'}
              mode="outlined"
              onPress={toggleFavorite}
              icon={favorite ? 'heart' : 'heart-outline'}
            />
          </View>
        </View>

        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
        >
          Routes serving this stop
        </Text>
        {servedRoutes.length > 0 ? (
          <View style={styles.routeList}>
            {servedRoutes.map(item => (
              <TouchableOpacity
                key={item.id}
                onPress={() =>
                  navigation.navigate('RouteDetails', { routeId: item.id })
                }
                style={[
                  styles.routeRow,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.outline,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`View ${item.routeName}`}
              >
                <View style={styles.routeBody}>
                  <Text
                    variant="titleSmall"
                    style={{ color: theme.colors.onSurface }}
                  >
                    {item.routeCode} · {item.routeName}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {formatDuration(item.estimatedDuration)} ·{' '}
                    {formatFare(item.fare)}
                  </Text>
                </View>
                <TransportBadge
                  category={item.transportationType}
                  compact
                />
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            No demonstration route lists this stop yet.
          </Text>
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
  map: {
    height: 220,
    borderRadius: 18,
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleWrap: {
    flex: 1,
    gap: 2,
  },
  bold: {
    fontWeight: '700',
  },
  description: {
    lineHeight: 21,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  routeList: {
    gap: 8,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  routeBody: {
    flex: 1,
    gap: 2,
  },
});

export default BoardingPointDetailsScreen;
