import type {
  Location,
  Route,
  RouteStop,
  StopType,
  TransportationCategory,
  Trip,
} from '../../types';
import { environment } from '../../config/environment';
import api from './client';
import { asList, requireData } from '../../utils/apiData';
import { fetchAllPages } from './pagination';
import type {
  ApiRoute,
  ApiRouteStop,
  ApiStopType,
  ApiTransportationTypeCode,
} from './types';
import { MockRoutesApi } from '../mock/routesApi';

export interface IRoutesApi {
  getRoutes(): Promise<Route[]>;
  getRouteDetails(routeId: string): Promise<Route | null>;
  planTrip(origin: Location, destination: Location): Promise<Trip>;
}

const STOP_TYPE_MAP: Record<ApiStopType, StopType> = {
  ORIGIN: 'boarding',
  INTERMEDIATE: 'transfer',
  DESTINATION: 'dropoff',
};

const STATUS_MAP = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'inactive',
} as const;

const TRANSPORTATION_TYPE_MAP: Record<
  ApiTransportationTypeCode,
  TransportationCategory
> = {
  JEEPNEY: 'jeepney',
  MODERN_JEEPNEY: 'modern_jeepney',
  MULTICAB: 'multicab',
  TRICYCLE: 'tricycle',
  BUS: 'bus',
  UV_EXPRESS: 'uv_express',
  VAN: 'van',
  FERRY: 'ferry',
  TRAIN: 'train',
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const hasCoordinates = (
  latitude: number | null,
  longitude: number | null,
): boolean =>
  isFiniteNumber(latitude) &&
  isFiniteNumber(longitude) &&
  Math.abs(latitude) <= 90 &&
  Math.abs(longitude) <= 180;

/**
 * Fallback for responses that do not embed the transportation type code. Route
 * codes are stable operator identifiers, so a small prefix map keeps the badge
 * correct until the API always joins `route_transportation_types`.
 */
const categoryFromRouteCode = (routeCode: string): TransportationCategory => {
  const code = routeCode.toUpperCase();
  if (/AIR.*BUS|BUS|AIRPORT/.test(code)) return 'bus';
  if (/AIR.*VAN|UV|VAN/.test(code)) return 'van';
  if (/FERRY|SEA|PORT/.test(code)) return 'ferry';
  if (/TRAIN|RAIL/.test(code)) return 'train';
  if (/TRICYCLE|MOTORELA/.test(code)) return 'tricycle';
  if (/MODERN/.test(code)) return 'modern_jeepney';
  return 'jeepney';
};

const getTransportationType = (row: ApiRoute): TransportationCategory => {
  const types = row.transportationTypes ?? [];
  const primary =
    types.find(type => type.isPrimary) ?? types.find(Boolean) ?? undefined;
  const code =
    primary?.code ??
    (
      primary as
        | { transportationType?: { code?: ApiTransportationTypeCode } }
        | undefined
    )?.transportationType?.code;

  return (code && TRANSPORTATION_TYPE_MAP[code]) || categoryFromRouteCode(row.routeCode);
};

/** Converts an ordered stop row into a UI stop, skipping unmapped coordinates. */
export const mapApiRouteStop = (stop: ApiRouteStop): RouteStop | null => {
  const { latitude, longitude } = stop;
  if (
    !isFiniteNumber(latitude) ||
    !isFiniteNumber(longitude) ||
    !hasCoordinates(latitude, longitude)
  ) {
    return null;
  }
  return {
    id: stop.id,
    name: stop.name,
    sequence: stop.sequence,
    stopType: STOP_TYPE_MAP[stop.stopType] ?? 'transfer',
    latitude,
    longitude,
  };
};

/**
 * Maps the backend `Route` shape (routeCode/name/status, nullable fare and
 * coordinates, nested stops) to the domain `Route` used by the app. Keeping
 * this translation here avoids duplicating route records in the client.
 */
export const mapApiRoute = (row: ApiRoute): Route => {
  const stops = asList(row.stops)
    .map(mapApiRouteStop)
    .filter((stop): stop is RouteStop => stop !== null)
    .sort((a, b) => a.sequence - b.sequence);

  return {
    id: row.id,
    routeCode: row.routeCode,
    routeName: row.name,
    origin: row.origin,
    destination: row.destination,
    transportationType: getTransportationType(row),
    stops,
    fare: row.fare ?? 0,
    estimatedDuration: row.estimatedDurationMin ?? 0,
    status: STATUS_MAP[row.status] ?? 'inactive',
  };
};

export class RoutesApi implements IRoutesApi {
  async getRoutes(): Promise<Route[]> {
    // The API returns ACTIVE routes with their ordered stops. fetchAllPages
    // walks the pagination envelope so every mapped corridor reaches the map.
    const rows = await fetchAllPages<ApiRoute>('/routes', { status: 'ACTIVE' });
    return rows.map(mapApiRoute).filter(route => route.stops.length > 0);
  }

  async getRouteDetails(routeId: string): Promise<Route | null> {
    try {
      const response = await api.get<ApiRoute>(`/routes/${routeId}`);
      return response.data ? mapApiRoute(response.data) : null;
    } catch {
      return null;
    }
  }

  async planTrip(origin: Location, destination: Location): Promise<Trip> {
    const response = await api.post<Trip>('/trips/plan', {
      origin,
      destination,
    });
    return requireData(response.data);
  }
}

export const routesApi: IRoutesApi = environment.enableMockServices
  ? new MockRoutesApi()
  : new RoutesApi();
