import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../../config/theme';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import AppSearchInput from '../../../components/inputs/AppSearchInput';
import DemoBanner from '../../../components/common/DemoBanner';
import AppButton from '../../../components/buttons/AppButton';
import { EmptyState } from '../../../components/common/StateViews';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  addRecentSearch,
  clearRecentSearches,
  getCurrentLocation,
  searchPlaces,
  setSelectedDestination,
  setSelectedOrigin,
} from '../../../redux/slices/locationSlice';
import { formatDistance, haversineDistance } from '../../../utils/geo';
import type { RootStackParamList } from '../../../navigation/types';
import type { Location } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'LocationSearch'>;

export const LocationSearchScreen = ({ navigation, route }: Props) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const { field, title, returnTo = 'back' } = route.params;

  const recentSearches = useAppSelector(
    state => state.location.recentSearches,
  );
  const currentLocation = useAppSelector(
    state => state.location.currentLocation,
  );
  const permissionStatus = useAppSelector(
    state => state.location.permissionStatus,
  );

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setResults([]);
      setSearching(false);
      return;
    }

    let active = true;
    setSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const found = await dispatch(searchPlaces(trimmed)).unwrap();
        if (active) {
          setResults(found);
          setError(null);
        }
      } catch (searchError) {
        if (active) {
          setResults([]);
          setError(
            typeof searchError === 'string'
              ? searchError
              : 'Place search failed. Please try again.',
          );
        }
      } finally {
        if (active) {
          setSearching(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [dispatch, query]);

  const finish = useCallback(() => {
    if (returnTo === 'planner') {
      navigation.navigate('Main', { screen: 'PlanTrip' });
      return;
    }
    navigation.goBack();
  }, [navigation, returnTo]);

  const selectLocation = useCallback(
    (location: Location) => {
      dispatch(addRecentSearch(location));
      if (field === 'origin') {
        dispatch(setSelectedOrigin(location));
      } else {
        dispatch(setSelectedDestination(location));
      }
      finish();
    },
    [dispatch, field, finish],
  );

  const useCurrentLocation = async () => {
    setLocating(true);
    setError(null);
    const result = await dispatch(getCurrentLocation());
    setLocating(false);
    if (getCurrentLocation.fulfilled.match(result)) {
      selectLocation(result.payload);
      return;
    }
    setError(
      result.payload?.message ??
        'Unable to get your location. Check permissions and GPS.',
    );
  };

  const renderRow = (location: Location, icon: string) => {
    const distance = currentLocation
      ? haversineDistance(currentLocation, location)
      : null;
    return (
      <TouchableOpacity
        key={location.id ?? `${location.latitude},${location.longitude}`}
        onPress={() => selectLocation(location)}
        style={[
          styles.row,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Select ${location.name ?? 'location'}`}
      >
        <View
          style={[
            styles.rowIcon,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.rowBody}>
          <Text
            variant="titleSmall"
            style={{ color: theme.colors.onSurface }}
            numberOfLines={1}
          >
            {location.name ?? 'Pinned location'}
          </Text>
          {location.address ? (
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
              numberOfLines={2}
            >
              {location.address}
            </Text>
          ) : null}
        </View>
        {distance !== null ? (
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {formatDistance(distance)}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader
        title={title ?? (field === 'origin' ? 'Choose starting point' : 'Choose destination')}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.searchWrap}>
        <AppSearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search a place, landmark, or address"
          autoFocus
          accessibilityLabel="Search for a place"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {field === 'origin' ? (
          <AppButton
            label="Use my current location"
            mode="outlined"
            onPress={useCurrentLocation}
            loading={locating}
            icon="crosshairs-gps"
            style={styles.currentButton}
          />
        ) : null}

        {error ? (
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
              {error}
            </Text>
            {permissionStatus === 'blocked' ? (
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onErrorContainer }}
              >
                Location access is blocked. You can still search for a place
                below.
              </Text>
            ) : null}
          </View>
        ) : null}

        <DemoBanner message="Demonstration place data. Search results are sample locations, not a live geocoder." />

        {query.trim().length > 0 ? (
          searching ? (
            <View style={styles.searching}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Searching…
              </Text>
            </View>
          ) : results.length > 0 ? (
            <View style={styles.list}>
              {results.map(location => renderRow(location, 'map-marker-outline'))}
            </View>
          ) : (
            <EmptyState
              icon="map-search-outline"
              title="No places found"
              message={`Nothing in the demonstration dataset matches “${query.trim()}”.`}
              actionLabel="Clear search"
              onAction={() => setQuery('')}
            />
          )
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text
                variant="titleSmall"
                style={[styles.bold, { color: theme.colors.onBackground }]}
              >
                Recent searches
              </Text>
              {recentSearches.length > 0 ? (
                <TouchableOpacity
                  onPress={() => dispatch(clearRecentSearches())}
                  accessibilityRole="button"
                >
                  <Text
                    variant="labelMedium"
                    style={{ color: theme.colors.primary }}
                  >
                    Clear all
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {recentSearches.length > 0 ? (
              <View style={styles.list}>
                {recentSearches.map(location =>
                  renderRow(location, 'history'),
                )}
              </View>
            ) : (
              <EmptyState
                icon="map-search-outline"
                title="Search for a place"
                message="Try a mall, university, market, or terminal from the demonstration dataset."
              />
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  searchWrap: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  currentButton: {
    marginBottom: 12,
  },
  errorBanner: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 4,
  },
  searching: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 24,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 10,
  },
  bold: {
    fontWeight: '700',
  },
});

export default LocationSearchScreen;
