import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from 'react-native-paper';
import { WebView as NativeWebView } from 'react-native-webview';
import type {
  WebViewMessageEvent,
  WebViewProps,
} from 'react-native-webview';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  APP_NAME,
  APP_VERSION,
  DEFAULT_MAP_DELTA,
  OPENSTREETMAP,
} from '../../config/constants';
import { useAppTheme } from '../../config/theme';
import { getCategoryColor } from '../../utils/transport';
import type { BoardingPoint, Location, RouteStop } from '../../types';

/**
 * react-native-webview's class type defaults its extra-props generic to
 * `undefined`, which makes the JSX prop type resolve to `never` with the
 * current TypeScript/React Native type combination. This alias keeps the real
 * props and ref methods without changing runtime behaviour.
 */
const WebView = NativeWebView as unknown as React.ComponentType<
  WebViewProps & React.RefAttributes<NativeWebView>
>;

const FALLBACK_FOCUS: MapFocus = {
  latitude: 8.4822,
  longitude: 124.6472,
  zoom: 13,
};

const MIN_ZOOM = 3;

interface OpenStreetMapProps {
  location?: Location | null;
  center?: Location | null;
  boardingPoints?: BoardingPoint[];
  selectedBoardingPointId?: string | null;
  onSelectBoardingPoint?: (boardingPoint: BoardingPoint) => void;
  routeStops?: RouteStop[];
  showRecenter?: boolean;
  style?: StyleProp<ViewStyle>;
}

interface MapColors {
  primary: string;
  onPrimary: string;
  surface: string;
  surfaceVariant: string;
  info: string;
  onSurfaceVariant: string;
}

interface MapBoardingPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  color: string;
  initial: string;
}

interface MapRouteStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface MapLocation {
  latitude: number;
  longitude: number;
}

interface MapData {
  colors: MapColors;
  boardingPoints: MapBoardingPoint[];
  selectedBoardingPointId: string | null;
  routeStops: MapRouteStop[];
  location: MapLocation | null;
}

interface MapFocus {
  latitude: number;
  longitude: number;
  zoom: number;
}

const getZoomForLocation = (location: Location | null): number => {
  const latitudeDelta =
    location?.latitudeDelta ?? DEFAULT_MAP_DELTA.latitudeDelta;
  const longitudeDelta =
    location?.longitudeDelta ?? DEFAULT_MAP_DELTA.longitudeDelta;
  const delta = Math.max(Math.min(latitudeDelta, longitudeDelta), 0.00001);
  const zoom = Math.round(Math.log2(360 / delta));
  return Math.min(OPENSTREETMAP.maxZoom, Math.max(MIN_ZOOM, zoom));
};

/**
 * Serializes data for injection into the WebView. Escaping `<` keeps the
 * payload safe if it is ever embedded in an HTML script block as well.
 */
const toScriptJson = (value: unknown): string => {
  const json = JSON.stringify(value);
  return (json ?? 'null').replace(/</g, '\\u003c');
};

const createMapHtml = (initialData: MapData, initialFocus: MapFocus): string => {
  const colors = initialData.colors;
  const initialPayload = toScriptJson({
    data: initialData,
    focus: initialFocus,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
  />
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  />
  <style>
    html,
    body {
      height: 100%;
      margin: 0;
      padding: 0;
      background: ${colors.surfaceVariant};
    }

    #map {
      height: 100%;
      width: 100%;
      background: ${colors.surfaceVariant};
    }

    .leaflet-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .byaheko-div-icon {
      background: transparent;
      border: 0;
    }

    .byaheko-marker {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 2px solid ${colors.surface};
      box-sizing: border-box;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
    }

    .byaheko-marker span {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 700;
      line-height: 1;
    }

    .byaheko-stop {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid ${colors.primary};
      box-sizing: border-box;
    }

    .byaheko-stop-endpoint {
      width: 16px;
      height: 16px;
    }

    .byaheko-user {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 3px solid ${colors.surface};
      box-sizing: border-box;
      box-shadow: 0 0 0 4px rgba(23, 92, 211, 0.2);
    }

    .leaflet-control-attribution {
      background: ${colors.surface};
      color: ${colors.onSurfaceVariant};
      font-size: 10px;
      padding: 2px 5px;
    }

    .leaflet-control-attribution a {
      color: ${colors.info};
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    (function () {
      function post(type, payload) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: type, payload: payload }),
          );
        }
      }

      if (!window.L) {
        post('error', { message: 'Leaflet failed to load' });
        return;
      }

      var initial = ${initialPayload};

      function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
          return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
          }[character];
        });
      }

      function divIcon(html, size) {
        return L.divIcon({
          html: html,
          className: 'byaheko-div-icon',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      }

      var map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true,
      }).setView(
        [initial.focus.latitude, initial.focus.longitude],
        initial.focus.zoom,
      );

      L.control
        .attribution({ position: 'bottomleft', prefix: false })
        .addTo(map);

      L.tileLayer('${OPENSTREETMAP.tileUrl}', {
        maxZoom: ${OPENSTREETMAP.maxZoom},
        attribution: '${OPENSTREETMAP.attribution}',
      }).addTo(map);

      var boardingLayer = L.layerGroup().addTo(map);
      var routeLayer = L.layerGroup().addTo(map);
      var userLayer = L.layerGroup().addTo(map);

      function render(data) {
        boardingLayer.clearLayers();
        routeLayer.clearLayers();
        userLayer.clearLayers();

        var routeStops = data.routeStops || [];
        if (routeStops.length > 0) {
          var coordinates = routeStops.map(function (stop) {
            return [stop.latitude, stop.longitude];
          });

          L.polyline(coordinates, {
            color: data.colors.primary,
            weight: 4,
            opacity: 0.9,
            lineJoin: 'round',
            lineCap: 'round',
          }).addTo(routeLayer);

          routeStops.forEach(function (stop, index) {
            var endpoint =
              index === 0 || index === routeStops.length - 1;
            var stopColor = endpoint
              ? data.colors.primary
              : data.colors.surface;

            L.marker([stop.latitude, stop.longitude], {
              icon: divIcon(
                '<div class="byaheko-stop' +
                  (endpoint ? ' byaheko-stop-endpoint' : '') +
                  '" style="background:' +
                  stopColor +
                  ';border-color:' +
                  data.colors.primary +
                  ';"></div>',
                endpoint ? 16 : 14,
              ),
              title: stop.name,
              alt: stop.name,
              keyboard: true,
              interactive: false,
            }).addTo(routeLayer);
          });
        }

        (data.boardingPoints || []).forEach(function (point) {
          var selected = point.id === data.selectedBoardingPointId;
          var size = selected ? 36 : 32;
          var markerHtml =
            '<div class="byaheko-marker" style="width:' +
            size +
            'px;height:' +
            size +
            'px;background:' +
            point.color +
            ';border-color:' +
            data.colors.surface +
            ';"><span style="color:' +
            data.colors.onPrimary +
            ';">' +
            escapeHtml(point.initial) +
            '</span></div>';

          var marker = L.marker([point.latitude, point.longitude], {
            icon: divIcon(markerHtml, size),
            title: point.name,
            alt: point.name,
            keyboard: true,
            riseOnHover: true,
          });

          marker.on('click', function () {
            post('boardingPointPress', { id: point.id });
          });
          marker.addTo(boardingLayer);
        });

        if (data.location) {
          L.marker([data.location.latitude, data.location.longitude], {
            icon: divIcon(
              '<div class="byaheko-user" style="background:' +
                data.colors.info +
                ';border-color:' +
                data.colors.surface +
                ';"></div>',
              18,
            ),
            title: 'Your location',
            alt: 'Your location',
            keyboard: true,
            interactive: false,
          }).addTo(userLayer);
        }
      }

      function focus(view) {
        map.setView([view.latitude, view.longitude], view.zoom, {
          animate: true,
        });
      }

      window.ByaheKoMap = {
        update: function (data) {
          render(data);
        },
        focus: function (view) {
          focus(view);
        },
        recenter: function (view) {
          focus(view);
        },
      };

      try {
        render(initial.data);
        focus(initial.focus);
        map.invalidateSize();

        window.addEventListener('resize', function () {
          map.invalidateSize();
        });

        post('ready', {});
      } catch (error) {
        post('error', { message: String(error) });
      }
    })();
  </script>
</body>
</html>`;
};

/**
 * OpenStreetMap-backed map rendered in a WebView with Leaflet.
 *
 * This is intentionally separate from TransportMap, which keeps the original
 * Google/Apple Maps implementation. OSM tiles and Leaflet avoid a Google Maps
 * SDK key, and the tile layer includes the required OSM attribution.
 */
export const OpenStreetMap = ({
  location,
  center,
  boardingPoints = [],
  selectedBoardingPointId,
  onSelectBoardingPoint,
  routeStops = [],
  showRecenter = true,
  style,
}: OpenStreetMapProps) => {
  const theme = useAppTheme();
  const webViewRef = useRef<NativeWebView | null>(null);
  const readyRef = useRef(false);
  const [hasError, setHasError] = useState(false);

  const focusLocation = useMemo(
    () => location ?? center ?? null,
    [center, location],
  );

  const focusData = useMemo<MapFocus>(
    () =>
      focusLocation
        ? {
            latitude: focusLocation.latitude,
            longitude: focusLocation.longitude,
            zoom: getZoomForLocation(focusLocation),
          }
        : FALLBACK_FOCUS,
    [focusLocation],
  );

  const mapData = useMemo<MapData>(
    () => ({
      colors: {
        primary: theme.colors.primary,
        onPrimary: theme.colors.onPrimary,
        surface: theme.colors.surface,
        surfaceVariant: theme.colors.surfaceVariant,
        info: theme.colors.info,
        onSurfaceVariant: theme.colors.onSurfaceVariant,
      },
      boardingPoints: boardingPoints.map(point => {
        const category = point.transportationTypes[0];
        const color = category
          ? getCategoryColor(theme, category)
          : theme.colors.primary;

        return {
          id: point.id,
          name: point.name,
          latitude: point.latitude,
          longitude: point.longitude,
          color,
          initial: point.name.trim().charAt(0).toUpperCase() || '•',
        };
      }),
      selectedBoardingPointId: selectedBoardingPointId ?? null,
      routeStops: routeStops.map(stop => ({
        id: stop.id,
        name: stop.name,
        latitude: stop.latitude,
        longitude: stop.longitude,
      })),
      location: location
        ? { latitude: location.latitude, longitude: location.longitude }
        : null,
    }),
    [
      boardingPoints,
      location,
      routeStops,
      selectedBoardingPointId,
      theme,
    ],
  );

  /**
   * The HTML is created once so prop updates do not reload the WebView. Later
   * changes are sent through injected JavaScript instead.
   */
  const [initialHtml] = useState(() => createMapHtml(mapData, focusData));

  const inject = useCallback((script: string) => {
    webViewRef.current?.injectJavaScript(`${script}; true;`);
  }, []);

  const syncMap = useCallback(() => {
    inject(
      `window.ByaheKoMap && window.ByaheKoMap.update(${toScriptJson(mapData)})`,
    );
    inject(
      `window.ByaheKoMap && window.ByaheKoMap.focus(${toScriptJson(
        focusData,
      )})`,
    );
  }, [focusData, inject, mapData]);

  useEffect(() => {
    if (!readyRef.current) {
      return;
    }
    inject(
      `window.ByaheKoMap && window.ByaheKoMap.update(${toScriptJson(mapData)})`,
    );
  }, [inject, mapData]);

  useEffect(() => {
    if (!readyRef.current) {
      return;
    }
    inject(
      `window.ByaheKoMap && window.ByaheKoMap.focus(${toScriptJson(
        focusData,
      )})`,
    );
  }, [focusData, inject]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      let message: unknown;
      try {
        message = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }

      if (!message || typeof message !== 'object') {
        return;
      }

      const typedMessage = message as { type?: unknown; payload?: unknown };

      if (typedMessage.type === 'ready') {
        readyRef.current = true;
        setHasError(false);
        syncMap();
        return;
      }

      if (typedMessage.type === 'error') {
        setHasError(true);
        return;
      }

      if (typedMessage.type === 'boardingPointPress') {
        const payload = typedMessage.payload as
          | { id?: unknown }
          | null
          | undefined;
        if (typeof payload?.id !== 'string') {
          return;
        }
        const point = boardingPoints.find(item => item.id === payload.id);
        if (point) {
          onSelectBoardingPoint?.(point);
        }
      }
    },
    [boardingPoints, onSelectBoardingPoint, syncMap],
  );

  const recenter = useCallback(() => {
    inject(
      `window.ByaheKoMap && window.ByaheKoMap.recenter(${toScriptJson(
        focusData,
      )})`,
    );
  }, [focusData, inject]);

  const retry = useCallback(() => {
    setHasError(false);
    readyRef.current = false;
    webViewRef.current?.reload();
  }, []);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        style={styles.webView}
        source={{ html: initialHtml }}
        originWhitelist={['*']}
        applicationNameForUserAgent={`${APP_NAME}/${APP_VERSION}`}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        setSupportMultipleWindows={false}
        onLoadStart={() => {
          readyRef.current = false;
          setHasError(false);
        }}
        onMessage={handleMessage}
        onError={() => {
          readyRef.current = false;
          setHasError(true);
        }}
        onShouldStartLoadWithRequest={request => {
          if (request.url.startsWith('https://www.openstreetmap.org/')) {
            Linking.openURL(request.url).catch(() => undefined);
            return false;
          }
          return true;
        }}
        startInLoadingState
        renderLoading={() => (
          <View
            style={[
              styles.loading,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <ActivityIndicator color={theme.colors.primary} />
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Loading map…
            </Text>
          </View>
        )}
        renderError={() => <View style={styles.webView} />}
        accessibilityLabel="OpenStreetMap map"
      />

      {hasError ? (
        <View
          style={[styles.errorOverlay, { backgroundColor: theme.colors.surface }]}
        >
          <MaterialCommunityIcons
            name="map-marker-off-outline"
            size={28}
            color={theme.colors.primary}
          />
          <Text
            variant="titleSmall"
            style={{ color: theme.colors.onSurface }}
          >
            Map unavailable
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.errorHint, { color: theme.colors.onSurfaceVariant }]}
          >
            Check your internet connection and try again.
          </Text>
          <TouchableOpacity
            onPress={retry}
            style={[
              styles.retryButton,
              { backgroundColor: theme.colors.primary },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Retry loading map"
          >
            <Text
              variant="labelLarge"
              style={{ color: theme.colors.onPrimary }}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {showRecenter && !hasError ? (
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
  webView: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'transparent',
    borderRadius: 18,
  },
  loading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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

export default OpenStreetMap;
