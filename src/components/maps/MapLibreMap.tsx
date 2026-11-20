import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
  type CameraRef,
  type MapRef,
  type PressEventWithFeatures,
} from '@maplibre/maplibre-react-native';
import type { NativeSyntheticEvent } from 'react-native';
import { environment } from '../../config/environment';
import { useAppTheme } from '../../config/theme';
import {
  buildRouteMapGeoJson,
  getAllRoutesBounds,
  getRouteBounds,
  toPosition,
} from '../../utils/routeGeoJson';
import type {
  BoardingPoint,
  Location,
  Route,
} from '../../types';

/** CDO city centre; used before any route or device location is available. */
const DEFAULT_CENTER: [longitude: number, latitude: number] = [124.6472, 8.4822];
const DEFAULT_ZOOM = 12.5;

export interface MapLibreMapProps {
  routes?: Route[];
  boardingPoints?: BoardingPoint[];
  selectedRouteId?: string | null;
  selectedBoardingPointId?: string | null;
  location?: Location | null;
  center?: Location | null;
  destination?: Location | null;
  onSelectRoute?: (routeId: string) => void;
  onSelectBoardingPoint?: (boardingPoint: BoardingPoint) => void;
  showRecenter?: boolean;
  style?: StyleProp<ViewStyle>;
}

const readFeatureString = (
  feature: { properties?: Record<string, unknown> | null },
  key: string,
): string | null => {
  const value = feature.properties?.[key];
  return typeof value === 'string' ? value : null;
};

/**
 * MapLibre-backed OpenStreetMap view.
 *
 * Routes from the existing backend are converted to GeoJSON with
 * `[longitude, latitude]` coordinates (see `routeGeoJson.ts`) and rendered as
 * one coloured line per route plus stop/terminal/boarding markers. The basemap
 * is an OSM-derived CARTO style; no Google Maps key or Leaflet WebView is used.
 */
export const MapLibreMap = ({
  routes = [],
  boardingPoints = [],
  selectedRouteId = null,
  selectedBoardingPointId = null,
  location = null,
  center = null,
  destination = null,
  onSelectRoute,
  onSelectBoardingPoint,
  showRecenter = true,
  style,
}: MapLibreMapProps) => {
  const theme = useAppTheme();
  const cameraRef = useRef<CameraRef | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const [styleFailed, setStyleFailed] = useState(false);
  const [styleKey, setStyleKey] = useState(0);

  const mapStyle = theme.dark ? environment.mapStyleDarkUrl : environment.mapStyleUrl;

  /**
   * A selected route is shown on its own: unrelated lines, stops and boarding
   * points are removed rather than merely dimmed. Clearing the selection
   * restores the full network. If the id is stale (route no longer loaded), we
   * fall back to every route so the map is never left blank.
   */
  const visibleRoutes = useMemo(() => {
    if (selectedRouteId === null) {
      return routes;
    }
    const selected = routes.filter(route => route.id === selectedRouteId);
    return selected.length > 0 ? selected : routes;
  }, [routes, selectedRouteId]);

  const visibleBoardingPoints = useMemo(() => {
    if (selectedRouteId === null) {
      return boardingPoints;
    }
    return boardingPoints.filter(point =>
      point.routeIds.includes(selectedRouteId),
    );
  }, [boardingPoints, selectedRouteId]);

  const geoJson = useMemo(
    () =>
      buildRouteMapGeoJson(visibleRoutes, {
        boardingPoints: visibleBoardingPoints,
        destination,
        selectedRouteId,
      }),
    [destination, selectedRouteId, visibleBoardingPoints, visibleRoutes],
  );

  const focusLocation = location ?? center ?? null;

  const initialCenter = useMemo<[number, number]>(() => {
    const position = focusLocation
      ? toPosition(focusLocation.latitude, focusLocation.longitude)
      : null;
    return position ?? DEFAULT_CENTER;
  }, [focusLocation]);

  /**
   * Focus a route when selected, otherwise frame every route once they load.
   * Device location wins only when there is nothing else to show.
   */
  const fitToData = useCallback(
    (animated: boolean) => {
      const selectedRoute =
        selectedRouteId !== null
          ? routes.find(route => route.id === selectedRouteId) ?? null
          : null;
      const bounds =
        getRouteBounds(selectedRoute) ??
        (routes.length > 0 ? getAllRoutesBounds(routes) : null);

      if (bounds) {
        cameraRef.current?.fitBounds(bounds, {
          padding: { top: 48, right: 48, bottom: 48, left: 48 },
          duration: animated ? 700 : 0,
          easing: 'ease',
        });
        return;
      }

      cameraRef.current?.flyTo({
        center: initialCenter,
        zoom: DEFAULT_ZOOM,
        duration: animated ? 600 : 0,
      });
    },
    [initialCenter, routes, selectedRouteId],
  );

  useEffect(() => {
    fitToData(true);
  }, [fitToData]);

  const handleSourcePress = useCallback(
    (event: NativeSyntheticEvent<PressEventWithFeatures>) => {
      const feature = event.nativeEvent?.features?.[0];
      if (!feature) {
        return;
      }

      const routeId = readFeatureString(feature, 'routeId');
      const boardingPointId = readFeatureString(feature, 'boardingPointId');

      if (boardingPointId) {
        const point = boardingPoints.find(item => item.id === boardingPointId);
        if (point) {
          onSelectBoardingPoint?.(point);
        }
        return;
      }

      if (routeId && routeId !== 'search') {
        onSelectRoute?.(routeId);
      }

      event.stopPropagation?.();
    },
    [boardingPoints, onSelectBoardingPoint, onSelectRoute],
  );

  const recenter = useCallback(() => {
    cameraRef.current?.flyTo({
      center: initialCenter,
      zoom: DEFAULT_ZOOM,
      duration: 700,
    });
  }, [initialCenter]);

  const retryStyle = useCallback(() => {
    setStyleFailed(false);
    setStyleKey(value => value + 1);
  }, []);

  const userPosition = useMemo(
    () =>
      location
        ? toPosition(location.latitude, location.longitude)
        : null,
    [location],
  );

  const selectedBoarding = useMemo(() => {
    if (selectedBoardingPointId === null) {
      return null;
    }
    const point = boardingPoints.find(item => item.id === selectedBoardingPointId);
    if (!point) {
      return null;
    }
    const position = toPosition(point.latitude, point.longitude);
    return position ? { point, position } : null;
  }, [boardingPoints, selectedBoardingPointId]);

  return (
    <View style={[styles.container, style]}>
      <Map
        key={styleKey}
        ref={mapRef}
        testID="maplibre-map"
        style={styles.map}
        mapStyle={mapStyle}
        attribution
        compass
        logo={false}
        onDidFailLoadingMap={() => setStyleFailed(true)}
        onDidFinishLoadingMap={() => setStyleFailed(false)}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: initialCenter,
            zoom: DEFAULT_ZOOM,
          }}
        />

        <GeoJSONSource
          id="byaheko-routes"
          testID="byaheko-routes-source"
          data={geoJson.lines}
          onPress={handleSourcePress}
          hitbox={{ top: 12, right: 12, bottom: 12, left: 12 }}
        >
          <Layer
            id="byaheko-route-casing"
            type="line"
            source="byaheko-routes"
            layout={{ 'line-join': 'round', 'line-cap': 'round' }}
            paint={{
              'line-color': theme.colors.surface,
              'line-width': [
                'case',
                ['boolean', ['get', 'selected'], false],
                9,
                7,
              ],
              'line-opacity': [
                'case',
                ['boolean', ['get', 'dimmed'], false],
                0.25,
                0.9,
              ],
            }}
          />
          <Layer
            id="byaheko-route-lines"
            type="line"
            source="byaheko-routes"
            layout={{ 'line-join': 'round', 'line-cap': 'round' }}
            paint={{
              'line-color': ['coalesce', ['get', 'color'], theme.colors.primary],
              'line-width': [
                'case',
                ['boolean', ['get', 'selected'], false],
                6,
                ['boolean', ['get', 'dimmed'], false],
                2.5,
                4,
              ],
              'line-opacity': [
                'case',
                ['boolean', ['get', 'dimmed'], false],
                0.3,
                0.95,
              ],
            }}
          />
        </GeoJSONSource>

        <GeoJSONSource
          id="byaheko-points"
          testID="byaheko-points-source"
          data={geoJson.points}
          onPress={handleSourcePress}
        >
          <Layer
            id="byaheko-point-halos"
            type="circle"
            source="byaheko-points"
            paint={{
              'circle-radius': [
                'case',
                ['==', ['get', 'kind'], 'search'],
                14,
                ['==', ['get', 'kind'], 'origin'],
                12,
                ['==', ['get', 'kind'], 'destination'],
                12,
                9,
              ],
              'circle-color': theme.colors.surface,
              'circle-opacity': [
                'case',
                ['boolean', ['get', 'dimmed'], false],
                0.2,
                0.95,
              ],
            }}
          />
          <Layer
            id="byaheko-point-circles"
            type="circle"
            source="byaheko-points"
            paint={{
              'circle-radius': [
                'case',
                ['==', ['get', 'kind'], 'search'],
                10,
                ['==', ['get', 'kind'], 'origin'],
                8,
                ['==', ['get', 'kind'], 'destination'],
                8,
                ['==', ['get', 'kind'], 'boarding'],
                6,
                4.5,
              ],
              'circle-color': ['coalesce', ['get', 'color'], theme.colors.primary],
              'circle-stroke-color': theme.colors.surface,
              'circle-stroke-width': 2,
              'circle-opacity': [
                'case',
                ['boolean', ['get', 'dimmed'], false],
                0.35,
                1,
              ],
            }}
          />
        </GeoJSONSource>

        {selectedBoarding ? (
          <Marker
            id="byaheko-selected-boarding"
            lngLat={selectedBoarding.position}
          >
            <View
              style={[
                styles.selectedMarker,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="map-marker-check"
                size={24}
                color={theme.colors.primary}
              />
            </View>
          </Marker>
        ) : null}

        {userPosition ? (
          <Marker id="byaheko-user-location" lngLat={userPosition}>
            <View style={styles.userMarkerOuter}>
              <View
                style={[
                  styles.userMarkerInner,
                  { backgroundColor: theme.colors.info },
                ]}
              />
            </View>
          </Marker>
        ) : null}
      </Map>

      {styleFailed ? (
        <View
          style={[styles.errorOverlay, { backgroundColor: theme.colors.surface }]}
        >
          <MaterialCommunityIcons
            name="map-marker-off-outline"
            size={28}
            color={theme.colors.primary}
          />
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
            Map unavailable
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.errorHint, { color: theme.colors.onSurfaceVariant }]}
          >
            Check your internet connection and try again.
          </Text>
          <TouchableOpacity
            onPress={retryStyle}
            style={[
              styles.retryButton,
              { backgroundColor: theme.colors.primary },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Retry loading map"
          >
            <Text variant="labelLarge" style={{ color: theme.colors.onPrimary }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {showRecenter && !styleFailed ? (
        <TouchableOpacity
          onPress={recenter}
          style={[styles.recenter, { backgroundColor: theme.colors.surface }]}
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
  map: {
    flex: 1,
  },
  selectedMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  userMarkerOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(23, 92, 211, 0.18)',
  },
  userMarkerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 6,
  },
  errorHint: {
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
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

export default MapLibreMap;
