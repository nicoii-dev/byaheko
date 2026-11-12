import React, { useEffect, useRef } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEFAULT_MAP_DELTA, TRANSPORTATION_META } from '../../config/constants';
import { useAppTheme } from '../../config/theme';
import { getCategoryColor } from '../../utils/transport';
import type { BoardingPoint, Location, RouteStop } from '../../types';

const FALLBACK_REGION: Region = {
  latitude: 8.4822,
  longitude: 124.6472,
  latitudeDelta: 0.045,
  longitudeDelta: 0.045,
};

interface TransportMapProps {
  location?: Location | null;
  center?: Location | null;
  boardingPoints?: BoardingPoint[];
  selectedBoardingPointId?: string | null;
  onSelectBoardingPoint?: (boardingPoint: BoardingPoint) => void;
  routeStops?: RouteStop[];
  showRecenter?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const TransportMap = ({
  location,
  center,
  boardingPoints = [],
  selectedBoardingPointId,
  onSelectBoardingPoint,
  routeStops = [],
  showRecenter = true,
  style,
}: TransportMapProps) => {
  const theme = useAppTheme();
  const mapRef = useRef<MapView | null>(null);
  const focusLocation = location ?? center ?? null;

  const initialRegion: Region = focusLocation
    ? {
        latitude: focusLocation.latitude,
        longitude: focusLocation.longitude,
        latitudeDelta:
          focusLocation.latitudeDelta ?? DEFAULT_MAP_DELTA.latitudeDelta,
        longitudeDelta:
          focusLocation.longitudeDelta ?? DEFAULT_MAP_DELTA.longitudeDelta,
      }
    : FALLBACK_REGION;

  useEffect(() => {
    if (!focusLocation || !mapRef.current) {
      return;
    }
    mapRef.current.animateToRegion(
      {
        latitude: focusLocation.latitude,
        longitude: focusLocation.longitude,
        latitudeDelta:
          focusLocation.latitudeDelta ?? DEFAULT_MAP_DELTA.latitudeDelta,
        longitudeDelta:
          focusLocation.longitudeDelta ?? DEFAULT_MAP_DELTA.longitudeDelta,
      },
      500,
    );
  }, [focusLocation]);

  const recenter = () => {
    if (!mapRef.current) {
      return;
    }
    mapRef.current.animateToRegion(
      focusLocation
        ? {
            latitude: focusLocation.latitude,
            longitude: focusLocation.longitude,
            latitudeDelta:
              focusLocation.latitudeDelta ?? DEFAULT_MAP_DELTA.latitudeDelta,
            longitudeDelta:
              focusLocation.longitudeDelta ?? DEFAULT_MAP_DELTA.longitudeDelta,
          }
        : FALLBACK_REGION,
      500,
    );
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation={Boolean(location)}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        accessibilityLabel="Transport map"
      >
        {boardingPoints.map(point => {
          const category = point.transportationTypes[0];
          const meta = category ? TRANSPORTATION_META[category] : null;
          const color = category
            ? getCategoryColor(theme, category)
            : theme.colors.primary;
          const selected = point.id === selectedBoardingPointId;

          return (
            <Marker
              key={point.id}
              coordinate={{
                latitude: point.latitude,
                longitude: point.longitude,
              }}
              onPress={() => onSelectBoardingPoint?.(point)}
              tracksViewChanges={false}
              accessibilityLabel={point.name}
            >
              <View
                style={[
                  styles.marker,
                  {
                    backgroundColor: selected ? theme.colors.primary : color,
                    borderColor: theme.colors.surface,
                    transform: [{ scale: selected ? 1.15 : 1 }],
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={meta?.icon ?? 'map-marker'}
                  size={16}
                  color={
                    selected ? theme.colors.onPrimary : theme.colors.onPrimary
                  }
                />
              </View>
            </Marker>
          );
        })}

        {routeStops.length > 0 ? (
          <>
            <Polyline
              coordinates={routeStops.map(stop => ({
                latitude: stop.latitude,
                longitude: stop.longitude,
              }))}
              strokeColor={theme.colors.primary}
              strokeWidth={4}
            />
            {routeStops.map((stop, index) => (
              <Marker
                key={stop.id}
                coordinate={{
                  latitude: stop.latitude,
                  longitude: stop.longitude,
                }}
                tracksViewChanges={false}
                accessibilityLabel={stop.name}
              >
                <View
                  style={[
                    styles.stopMarker,
                    {
                      backgroundColor:
                        index === 0 || index === routeStops.length - 1
                          ? theme.colors.primary
                          : theme.colors.surface,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                />
              </Marker>
            ))}
          </>
        ) : null}

        {location ? (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            tracksViewChanges={false}
            accessibilityLabel="Your location"
          >
            <View
              style={[
                styles.userMarker,
                {
                  backgroundColor: theme.colors.info,
                  borderColor: theme.colors.surface,
                },
              ]}
            />
          </Marker>
        ) : null}
      </MapView>

      {showRecenter ? (
        <TouchableOpacity
          onPress={recenter}
          style={[
            styles.recenter,
            { backgroundColor: theme.colors.surface },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Recenter map"
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={22}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 18,
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  userMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
  },
  recenter: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default TransportMap;
