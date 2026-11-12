import {
  getNearbyBoardingPoints,
  planRoutes,
} from '../src/services/tripPlanner';
import type {
  BoardingPoint,
  Location,
  Route,
  RouteStop,
} from '../src/types';

const stop = (
  id: string,
  sequence: number,
  latitude: number,
  longitude: number,
  stopType: RouteStop['stopType'] = 'boarding',
): RouteStop => ({
  id,
  name: id,
  sequence,
  latitude,
  longitude,
  stopType,
});

const route = (overrides: Partial<Route> = {}): Route => ({
  id: 'route_a',
  routeCode: 'A',
  routeName: 'Route A',
  origin: 'Origin',
  destination: 'Destination',
  transportationType: 'jeepney',
  stops: [
    stop('a1', 1, 8.48, 124.64),
    stop('a2', 2, 8.49, 124.65, 'dropoff'),
  ],
  fare: 15,
  estimatedDuration: 20,
  status: 'active',
  isDemoData: true,
  ...overrides,
});

const boardingPoint = (
  id: string,
  latitude: number,
  longitude: number,
): BoardingPoint => ({
  id,
  name: id,
  address: id,
  latitude,
  longitude,
  transportationTypes: ['jeepney'],
  routeIds: ['route_a'],
});

const origin: Location = {
  latitude: 8.4801,
  longitude: 124.6401,
  name: 'Origin',
};

const destination: Location = {
  latitude: 8.4901,
  longitude: 124.6501,
  name: 'Destination',
};

describe('planRoutes', () => {
  it('suggests a walk-only option for a very short trip', () => {
    const options = planRoutes({
      origin: { latitude: 8.48, longitude: 124.64 },
      destination: { latitude: 8.4805, longitude: 124.6405 },
      routes: [],
      boardingPoints: [],
    });

    expect(options).toHaveLength(1);
    expect(options[0]).toMatchObject({
      id: 'walking_only',
      walkingOnly: true,
      transfers: 0,
      estimatedFare: 0,
    });
    expect(options[0].steps).toHaveLength(1);
  });

  it('builds a direct ride from one active route', () => {
    const options = planRoutes({
      origin,
      destination,
      routes: [route()],
      boardingPoints: [
        boardingPoint('bp_a1', 8.48, 124.64),
        boardingPoint('bp_a2', 8.49, 124.65),
      ],
    });

    expect(options).toHaveLength(1);
    expect(options[0]).toMatchObject({
      id: 'direct_route_a',
      summary: 'Route A',
      transfers: 0,
      estimatedFare: 15,
      routeIds: ['route_a'],
    });
    expect(options[0].boardingPoint.id).toBe('bp_a1');
    expect(options[0].dropoffPoint.id).toBe('bp_a2');
    expect(options[0].steps).toHaveLength(3);
  });

  it('builds a one-transfer option between two configured routes', () => {
    const firstRoute = route();
    const secondRoute = route({
      id: 'route_b',
      routeCode: 'B',
      routeName: 'Route B',
      stops: [
        stop('b1', 1, 8.4905, 124.6505),
        stop('b2', 2, 8.5, 124.66, 'dropoff'),
      ],
    });

    const options = planRoutes({
      origin,
      destination: { latitude: 8.5001, longitude: 124.6601 },
      routes: [firstRoute, secondRoute],
      boardingPoints: [
        boardingPoint('bp_a1', 8.48, 124.64),
        boardingPoint('bp_a2', 8.49, 124.65),
        boardingPoint('bp_b1', 8.4905, 124.6505),
        boardingPoint('bp_b2', 8.5, 124.66),
      ],
    });

    expect(options).toHaveLength(1);
    expect(options[0]).toMatchObject({
      id: 'transfer_route_a_route_b',
      transfers: 1,
      estimatedFare: 30,
      routeIds: ['route_a', 'route_b'],
    });
    expect(options[0].transferPoints).toHaveLength(1);
    expect(options[0].steps).toHaveLength(5);
  });

  it('returns no options when the configured graph cannot connect the trip', () => {
    const options = planRoutes({
      origin: { latitude: 8.48, longitude: 124.64 },
      destination: { latitude: 8.52, longitude: 124.7 },
      routes: [route()],
      boardingPoints: [],
    });

    expect(options).toEqual([]);
  });

  it('ignores inactive routes', () => {
    const options = planRoutes({
      origin,
      destination,
      routes: [route({ status: 'inactive' })],
      boardingPoints: [],
    });

    expect(options).toEqual([]);
  });
});

describe('getNearbyBoardingPoints', () => {
  const points = [
    boardingPoint('near', 8.4805, 124.6405),
    boardingPoint('far', 8.52, 124.7),
  ];

  it('filters by radius and sorts by distance', () => {
    const nearby = getNearbyBoardingPoints(
      { latitude: 8.48, longitude: 124.64 },
      points,
      3,
    );

    expect(nearby.map(point => point.id)).toEqual(['near']);
    expect(nearby[0].distanceMeters).toBeGreaterThan(0);
  });

  it('returns all points within a wider radius in distance order', () => {
    const nearby = getNearbyBoardingPoints(
      { latitude: 8.48, longitude: 124.64 },
      points,
      10,
    );

    expect(nearby.map(point => point.id)).toEqual(['near', 'far']);
    expect(nearby[0].distanceMeters).toBeLessThan(nearby[1].distanceMeters);
  });
});
