import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import SegmentedControl from '../../../components/common/SegmentedControl';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../components/common/StateViews';
import FavoriteCard from '../../../components/cards/FavoriteCard';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  loadFavorites,
  removeFavorite,
} from '../../../redux/slices/favoritesSlice';
import { useAppNavigation } from '../../../navigation/useAppNavigation';
import type { Favorite, FavoriteType } from '../../../types';

type Filter = FavoriteType | 'all';

const FILTER_OPTIONS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Places', value: 'destination' },
  { label: 'Routes', value: 'route' },
  { label: 'Stops', value: 'boarding_point' },
];

export const FavoritesScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useAppNavigation();
  const [filter, setFilter] = useState<Filter>('all');

  const { items, loading, error } = useAppSelector(state => state.favorites);

  const filtered = useMemo(
    () =>
      filter === 'all' ? items : items.filter(item => item.type === filter),
    [filter, items],
  );

  const openFavorite = (favorite: Favorite) => {
    switch (favorite.type) {
      case 'destination':
        navigation.navigate('Main', { screen: 'PlanTrip' });
        break;
      case 'route':
        navigation.navigate('RouteDetails', { routeId: favorite.targetId });
        break;
      case 'boarding_point':
        navigation.navigate('BoardingPointDetails', {
          boardingPointId: favorite.targetId,
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
        ) : error && items.length === 0 ? (
          <ErrorState
            message={error}
            onRetry={() => dispatch(loadFavorites())}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="heart-outline"
            title={
              items.length === 0 ? 'No favorites yet' : 'Nothing in this filter'
            }
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
              <FavoriteCard
                key={favorite.id}
                favorite={favorite}
                onPress={() => openFavorite(favorite)}
                onRemove={() => dispatch(removeFavorite(favorite.id))}
              />
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
});

export default FavoritesScreen;
