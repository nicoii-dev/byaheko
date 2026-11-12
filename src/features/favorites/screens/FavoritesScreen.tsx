import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../../config/theme';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import SegmentedControl from '../../../components/common/SegmentedControl';
import { EmptyState, LoadingState } from '../../../components/common/StateViews';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { removeFavorite } from '../../../redux/slices/favoritesSlice';
import { setSelectedDestination } from '../../../redux/slices/locationSlice';
import { useAppNavigation } from '../../../navigation/useAppNavigation';
import { formatRelativeTime } from '../../../utils/geo';
import type {
  BoardingPoint,
  Favorite,
  FavoriteType,
  Location,
  Route,
} from '../../../types';

type Filter = FavoriteType | 'all';

const FILTER_OPTIONS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Places', value: 'destination' },
  { label: 'Routes', value: 'route' },
  { label: 'Stops', value: 'boarding_point' },
];

const iconForType = (type: FavoriteType): string => {
  switch (type) {
    case 'destination':
      return 'map-marker-outline';
    case 'route':
      return 'routes';
    case 'boarding_point':
      return 'map-marker-radius-outline';
    default:
      return 'heart-outline';
  }
};

const subtitleForFavorite = (favorite: Favorite): string => {
  switch (favorite.type) {
    case 'destination': {
      const location = favorite.data as Location;
      return location.address ?? 'Saved place';
    }
    case 'route': {
      const route = favorite.data as Route;
      return `${route.routeCode} · ${route.origin} → ${route.destination}`;
    }
    case 'boarding_point': {
      const point = favorite.data as BoardingPoint;
      return point.address;
    }
    default:
      return '';
  }
};

export const FavoritesScreen = () => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const navigation = useAppNavigation();
  const [filter, setFilter] = useState<Filter>('all');

  const { items, loading } = useAppSelector(state => state.favorites);

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? items
        : items.filter(item => item.type === filter),
    [filter, items],
  );

  const openFavorite = (favorite: Favorite) => {
    switch (favorite.type) {
      case 'destination':
        dispatch(setSelectedDestination(favorite.data as Location));
        navigation.navigate('Main', { screen: 'PlanTrip' });
        break;
      case 'route':
        navigation.navigate('RouteDetails', {
          routeId: (favorite.data as Route).id,
        });
        break;
      case 'boarding_point':
        navigation.navigate('BoardingPointDetails', {
          boardingPointId: (favorite.data as BoardingPoint).id,
        });
        break;
      default:
        break;
    }
  };

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title="Favorites"
        subtitle={`${items.length} saved item${items.length === 1 ? '' : 's'}`}
      />
      <View style={styles.filterWrap}>
        <SegmentedControl
          options={FILTER_OPTIONS}
          value={filter}
          onChange={setFilter}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading && items.length === 0 ? (
          <LoadingState message="Loading your favorites…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="heart-outline"
            title={items.length === 0 ? 'No favorites yet' : 'Nothing in this filter'}
            message={
              items.length === 0
                ? 'Save routes, places, and boarding points to find them quickly later.'
                : 'Try a different category or save something new.'
            }
            actionLabel="Plan a trip"
            onAction={() => navigation.navigate('Main', { screen: 'PlanTrip' })}
          />
        ) : (
          <View style={styles.list}>
            {filtered.map(favorite => (
              <TouchableOpacity
                key={favorite.id}
                onPress={() => openFavorite(favorite)}
                activeOpacity={0.85}
                style={[
                  styles.row,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.outline,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Open ${favorite.name}`}
              >
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={iconForType(favorite.type)}
                    size={20}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.body}>
                  <Text
                    variant="titleSmall"
                    style={{ color: theme.colors.onSurface }}
                    numberOfLines={1}
                  >
                    {favorite.name}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                    numberOfLines={1}
                  >
                    {subtitleForFavorite(favorite)}
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.muted }}
                  >
                    Saved {formatRelativeTime(favorite.createdAt)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => dispatch(removeFavorite(favorite.id))}
                  style={styles.removeButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${favorite.name} from favorites`}
                  hitSlop={8}
                >
                  <MaterialCommunityIcons
                    name="heart-remove-outline"
                    size={20}
                    color={theme.colors.error}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  filterWrap: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 1,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FavoritesScreen;
