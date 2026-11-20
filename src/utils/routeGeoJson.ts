import type {
  Feature,
  FeatureCollection,
  LineString,
  Point,
} from 'geojson';
import type {
  BoardingPoint,
  Coordinates,
  Location,
  Route,
  RouteStop,
} from '../types';

/** GeoJSON requires [longitude, latitude] order. */
export type RoutePosition = [longitude: number, latitude: number];

export type RoutePointKind =
  | 'stop'
  | 'origin'
  | 'destination'
  | 'boarding'
  | 'search';

export interface RouteFeatureProperties {
  routeId: string;
  routeName: string;
  routeCode?: string;
  color: string;
  selected: boolean;
  dimmed: boolean;
  kind?: RoutePointKind;
  name?: string;
  sequence?: number;
  stopType?: string;
  transportationType?: string;
  /** Identifiers mirrored into properties so source taps can resolve a record. */
  stopId?: string;
  boardingPointId?: string;
}

export type RouteLineFeature = Feature<LineString, RouteFeatureProperties>;
export type RoutePointFeature = Feature<Point, RouteFeatureProperties>;

export interface RouteMapGeoJson {
  lines: FeatureCollection<LineString, RouteFeatureProperties>;
  points: FeatureCollection<Point, RouteFeatureProperties>;
}

export interface RouteMapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface BuildRouteMapOptions {
  boardingPoints?: BoardingPoint[];
  destination?: Location | null;
  selectedRouteId?: string | null;
  /** Boarding points unrelated to the selected route are dimmed when set. */
  dimUnrelatedBoardingPoints?: boolean;
}

const ROUTE_COLORS = [
  '#16A34A',
  '#2563EB',
  '#EA580C',
  '#9333EA',
  '#0D9488',
  '#E11D48',
  '#CA8A04',
  '#0891B2',
  '#7C3AED',
  '#65A30D',
] as const;

/** Stable colour per route id so the same corridor keeps its colour. */
export const getRouteColor = (route: Route): string => {
  let hash = 0;
  for (let index = 0; index < route.id.length; index += 1) {
    hash = Math.abs(hash * 31 + route.id.charCodeAt(index)) % 2147483647;
  }
  return ROUTE_COLORS[hash % ROUTE_COLORS.length];
};

const isValidCoordinate = (
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): boolean =>
  typeof latitude === 'number' &&
  typeof longitude === 'number' &&
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  Math.abs(latitude) <= 90 &&
  Math.abs(longitude) <= 180 &&
  !(latitude === 0 && longitude === 0);

export const toPosition = (
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): RoutePosition | null => {
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !isValidCoordinate(latitude, longitude)
  ) {
    return null;
  }
  return [longitude, latitude];
};

const samePosition = (first: RoutePosition, second: RoutePosition): boolean =>
  Math.abs(first[0] - second[0]) < 1e-7 &&
  Math.abs(first[1] - second[1]) < 1e-7;

/** Drops invalid and duplicate consecutive coordinates from an ordered path. */
export const cleanPositions = (
  coordinates: ReadonlyArray<Coordinates | null | undefined>,
): RoutePosition[] => {
  const positions: RoutePosition[] = [];

  for (const coordinate of coordinates) {
    const position = toPosition(coordinate?.latitude, coordinate?.longitude);
    if (!position) {
      continue;
    }
    const previous = positions[positions.length - 1];
    if (!previous || !samePosition(previous, position)) {
      positions.push(position);
    }
  }

  return positions;
};

const baseProperties = (
  route: Route,
  selectedRouteId: string | null,
): RouteFeatureProperties => {
  const selected = route.id === selectedRouteId;
  return {
    routeId: route.id,
    routeName: route.routeName,
    routeCode: route.routeCode,
    color: getRouteColor(route),
    selected,
    dimmed: selectedRouteId !== null && !selected,
    transportationType: route.transportationType,
  };
};

const pointFeature = (
  position: RoutePosition,
  properties: RouteFeatureProperties,
  id: string,
): RoutePointFeature => ({
  type: 'Feature',
  id,
  geometry: { type: 'Point', coordinates: position },
  properties,
});

/**
 * Converts the existing route/stop records into MapLibre-ready GeoJSON.
 *
 * Lines use [longitude, latitude]; each route keeps its own colour and tap
 * metadata. Invalid coordinates are skipped instead of producing (0, 0)
 * markers or broken LineStrings.
 */
export const buildRouteMapGeoJson = (
  routes: Route[],
  options: BuildRouteMapOptions = {},
): RouteMapGeoJson => {
  const selectedRouteId = options.selectedRouteId ?? null;
  const lines: RouteLineFeature[] = [];
  const points: RoutePointFeature[] = [];

  for (const route of routes) {
    const properties = baseProperties(route, selectedRouteId);
    const positions = cleanPositions(route.stops);
    const validStops: RouteStop[] = [];

    for (const stop of route.stops) {
      if (toPosition(stop.latitude, stop.longitude)) {
        validStops.push(stop);
      }
    }

    if (positions.length >= 2) {
      lines.push({
        type: 'Feature',
        id: `route-${route.id}`,
        geometry: { type: 'LineString', coordinates: positions },
        properties: { ...properties, kind: 'stop' },
      });
    }

    validStops.forEach((stop, index) => {
      const position = toPosition(stop.latitude, stop.longitude);
      if (!position) {
        return;
      }
      const isEndpoint = index === 0 || index === validStops.length - 1;
      const kind: RoutePointKind =
        stop.stopType === 'boarding' || index === 0
          ? 'origin'
          : stop.stopType === 'dropoff' || index === validStops.length - 1
            ? 'destination'
            : 'stop';

      points.push(
        pointFeature(
          position,
          {
            ...properties,
            kind: isEndpoint ? kind : 'stop',
            name: stop.name,
            sequence: stop.sequence,
            stopType: stop.stopType,
            stopId: stop.id,
          },
          `${route.id}:stop:${stop.id}`,
        ),
      );
    });
  }

  for (const boardingPoint of options.boardingPoints ?? []) {
    const position = toPosition(
      boardingPoint.latitude,
      boardingPoint.longitude,
    );
    if (!position) {
      continue;
    }
    const dimmed =
      options.dimUnrelatedBoardingPoints === true &&
      selectedRouteId !== null &&
      !boardingPoint.routeIds.includes(selectedRouteId);

    points.push(
      pointFeature(
        position,
        {
          routeId: boardingPoint.routeIds[0] ?? '',
          routeName: boardingPoint.name,
          color: '#0284C7',
          selected: false,
          dimmed,
          kind: 'boarding',
          name: boardingPoint.name,
          boardingPointId: boardingPoint.id,
        },
        `boarding:${boardingPoint.id}`,
      ),
    );
  }

  const destination = options.destination;
  const destinationPosition = destination
    ? toPosition(destination.latitude, destination.longitude)
    : null;
  if (destination && destinationPosition) {
    points.push(
      pointFeature(
        destinationPosition,
        {
          routeId: 'search',
          routeName: destination.name ?? 'Selected destination',
          color: '#DC2626',
          selected: true,
          dimmed: false,
          kind: 'search',
          name: destination.name ?? destination.address ?? 'Selected destination',
        },
        'search:destination',
      ),
    );
  }

  return {
    lines: { type: 'FeatureCollection', features: lines },
    points: { type: 'FeatureCollection', features: points },
  };
};

/** Bounds for a set of coordinates, in MapLibre's [west, south, east, north]. */
export const getBoundsFromPositions = (
  positions: RoutePosition[],
): [number, number, number, number] | null => {
  const valid = positions.filter(position =>
    isValidCoordinate(position[1], position[0]),
  );
  if (valid.length === 0) {
    return null;
  }

  const longitudes = valid.map(position => position[0]);
  const latitudes = valid.map(position => position[1]);
  return [
    Math.min(...longitudes),
    Math.min(...latitudes),
    Math.max(...longitudes),
    Math.max(...latitudes),
  ];
};

export const getRouteBounds = (
  route: Route | null,
): [number, number, number, number] | null =>
  route ? getBoundsFromPositions(cleanPositions(route.stops)) : null;

export const getAllRoutesBounds = (
  routes: Route[],
): [number, number, number, number] | null =>
  getBoundsFromPositions(routes.flatMap(route => cleanPositions(route.stops)));
