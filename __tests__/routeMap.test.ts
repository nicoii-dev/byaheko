import {
  buildRouteMapGeoJson,
  cleanPositions,
  getAllRoutesBounds,
  getRouteBounds,
  getRouteColor,
  toPosition,
} from '../src/utils/routeGeoJson';
import { mapApiRoute, mapApiRouteStop } from '../src/services/api/routesApi';
import type { ApiRoute } from '../src/services/api/types';
import type {
  BoardingPoint,
  Coordinates,
  Route,
  RouteStop,
} from '../src/types';

const makeStop = (
  id: string,
  sequence: number,
  latitude: number | null,
  longitude: number | null,
): RouteStop => ({
  id,
  name: `Stop ${id}`,
  sequence,
  stopType: sequence === 1 ? 'boarding' : 'dropoff',
  latitude: latitude as number,
  longitude: longitude as number,
});

const route: Route = {
  id: 'route-1',
  routeCode: 'CDO-JEEP-01',
  routeName: 'Divisoria Loop',
  origin: 'Divisoria',
  destination: 'Cogon',
  transportationType: 'jeepney',
  status: 'active',
  fare: 9,
  estimatedDuration: 25,
  stops: [
    makeStop('s1', 1, 8.4822, 124.6472),
    makeStop('s2', 2, 8.486, 124.65),
    makeStop('s3', 3, null, 124.651), // invalid: missing latitude
    makeStop('s4', 4, 8.49, 124.655),
  ],
};

const boardingPoint: BoardingPoint = {
  id: 'bp-1',
  name: 'Divisoria Terminal',
  address: 'Cagayan de Oro',
  latitude: 8.4825,
  longitude: 124.6475,
  transportationTypes: ['jeepney'],
  routeIds: ['route-1'],
};

describe('routeGeoJson utilities', () => {
  it('converts coordinates to GeoJSON [longitude, latitude] order', () => {
    expect(toPosition(8.4822, 124.6472)).toEqual([124.6472, 8.4822]);
  });

  it('rejects missing, non-finite, and (0, 0) coordinates', () => {
    expect(toPosition(null, 124.6)).toBeNull();
    expect(toPosition(8.4, undefined)).toBeNull();
    expect(toPosition(Number.NaN, 124.6)).toBeNull();
    expect(toPosition(0, 0)).toBeNull();
    expect(toPosition(91, 10)).toBeNull();
  });

  it('drops invalid and duplicate consecutive coordinates', () => {
    expect(
      cleanPositions([
        { latitude: 8.4, longitude: 124.6 },
        { latitude: 8.4, longitude: 124.6 },
        { latitude: null, longitude: 124.7 } as unknown as Coordinates,
        { latitude: 8.41, longitude: 124.61 },
      ]),
    ).toEqual([
      [124.6, 8.4],
      [124.61, 8.41],
    ]);
  });

  it('builds a coloured line and point features from route stops', () => {
    const geoJson = buildRouteMapGeoJson([route]);
    expect(geoJson.lines.features).toHaveLength(1);
    expect(geoJson.lines.features[0].geometry).toEqual({
      type: 'LineString',
      coordinates: [
        [124.6472, 8.4822],
        [124.65, 8.486],
        [124.655, 8.49],
      ],
    });
    expect(geoJson.lines.features[0].properties.color).toBe(
      getRouteColor(route),
    );
    expect(geoJson.points.features).toHaveLength(3);
    expect(geoJson.points.features[0].properties.kind).toBe('origin');
    expect(geoJson.points.features[2].properties.kind).toBe('destination');
  });

  it('marks non-selected routes as dimmed and the selected route as selected', () => {
    const geoJson = buildRouteMapGeoJson([route], {
      selectedRouteId: 'route-1',
    });
    const properties = geoJson.lines.features[0].properties;
    expect(properties.selected).toBe(true);
    expect(properties.dimmed).toBe(false);

    const dimmed = buildRouteMapGeoJson([route], {
      selectedRouteId: 'another-route',
    });
    expect(dimmed.lines.features[0].properties.dimmed).toBe(true);
  });

  it('adds boarding points and destination markers with [lng, lat] positions', () => {
    const geoJson = buildRouteMapGeoJson([route], {
      boardingPoints: [boardingPoint],
      destination: {
        id: 'dest-1',
        name: 'SM City',
        latitude: 8.48,
        longitude: 124.64,
      },
    });
    const boarding = geoJson.points.features.find(
      feature => feature.properties.kind === 'boarding',
    );
    const destination = geoJson.points.features.find(
      feature => feature.properties.kind === 'search',
    );

    expect(boarding?.geometry).toEqual({
      type: 'Point',
      coordinates: [124.6475, 8.4825],
    });
    expect(boarding?.properties.boardingPointId).toBe('bp-1');
    expect(destination?.geometry).toEqual({
      type: 'Point',
      coordinates: [124.64, 8.48],
    });
  });

  it('does not emit a line for a route with fewer than two valid stops', () => {
    const singleStopRoute: Route = {
      ...route,
      stops: [makeStop('s1', 1, 8.4822, 124.6472)],
    };
    expect(buildRouteMapGeoJson([singleStopRoute]).lines.features).toHaveLength(
      0,
    );
  });

  it('computes west/south/east/north bounds', () => {
    expect(getRouteBounds(route)).toEqual([
      124.6472, 8.4822, 124.655, 8.49,
    ]);
    expect(getAllRoutesBounds([route])).toEqual([
      124.6472, 8.4822, 124.655, 8.49,
    ]);
    expect(getRouteBounds(null)).toBeNull();
  });
});

describe('routes API mapper', () => {
  const apiRoute: ApiRoute = {
    id: 'route-1',
    routeCode: 'CDO-JEEP-01',
    name: 'Divisoria Loop',
    origin: 'Divisoria',
    destination: 'Cogon',
    locality: 'Cagayan de Oro',
    district: null,
    status: 'ACTIVE',
    isVerified: true,
    sourceName: null,
    sourceUrl: null,
    mapUrl: null,
    distanceKm: 12,
    distanceIsRoundtrip: false,
    fare: 9,
    fareDescription: null,
    estimatedDurationMin: 25,
    notes: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    stops: [
      {
        id: 's2',
        routeId: 'route-1',
        name: 'Cogon',
        sequence: 2,
        stopType: 'DESTINATION',
        latitude: 8.49,
        longitude: 124.655,
        notes: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 's1',
        routeId: 'route-1',
        name: 'Divisoria',
        sequence: 1,
        stopType: 'ORIGIN',
        latitude: 8.4822,
        longitude: 124.6472,
        notes: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 's3',
        routeId: 'route-1',
        name: 'Unmapped',
        sequence: 3,
        stopType: 'INTERMEDIATE',
        latitude: null,
        longitude: null,
        notes: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    transportationTypes: [
      {
        id: 'rt-1',
        routeId: 'route-1',
        transportationTypeId: 'type-jeepney',
        code: 'JEEPNEY',
        isPrimary: true,
        isVerified: true,
        sourceName: null,
        sourceUrl: null,
        notes: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ],
  };

  it('maps backend route fields to the domain model', () => {
    const mapped = mapApiRoute(apiRoute);
    expect(mapped).toMatchObject({
      id: 'route-1',
      routeCode: 'CDO-JEEP-01',
      routeName: 'Divisoria Loop',
      origin: 'Divisoria',
      destination: 'Cogon',
      status: 'active',
      transportationType: 'jeepney',
      fare: 9,
      estimatedDuration: 25,
    });
  });

  it('sorts stops by sequence and skips stops without coordinates', () => {
    const mapped = mapApiRoute(apiRoute);
    expect(mapped.stops.map(stop => stop.id)).toEqual(['s1', 's2']);
    expect(mapped.stops[0].stopType).toBe('boarding');
    expect(mapped.stops[1].stopType).toBe('dropoff');
  });

  it('infers the transport category from the route code when no type is joined', () => {
    const mapped = mapApiRoute({
      ...apiRoute,
      routeCode: 'CDO-BUS-05',
      transportationTypes: [],
    });
    expect(mapped.transportationType).toBe('bus');
  });

  it('returns null from mapApiRouteStop for invalid coordinates', () => {
    expect(
      mapApiRouteStop({
        ...apiRoute.stops![0],
        latitude: null,
        longitude: 124.6,
      }),
    ).toBeNull();
  });
});
