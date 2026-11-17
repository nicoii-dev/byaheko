import {
  formatFareRange,
  getBoardingPointsForCategory,
  getCategorySummary,
  getRoutesForCategory,
} from '../src/utils/transport';
import type { BoardingPoint, Route } from '../src/types';

const route = (overrides: Partial<Route> = {}): Route => ({
  id: 'route_jeepney_1',
  routeCode: 'DEMO-01',
  routeName: 'Demo jeepney route',
  origin: 'Origin',
  destination: 'Destination',
  transportationType: 'jeepney',
  stops: [
    {
      id: 'stop_1',
      name: 'Origin',
      sequence: 1,
      latitude: 8.48,
      longitude: 124.64,
      stopType: 'boarding',
    },
    {
      id: 'stop_2',
      name: 'Destination',
      sequence: 2,
      latitude: 8.49,
      longitude: 124.65,
      stopType: 'dropoff',
    },
  ],
  fare: 13,
  estimatedDuration: 20,
  status: 'active',
  isDemoData: true,
  ...overrides,
});

const boardingPoint = (
  overrides: Partial<BoardingPoint> = {},
): BoardingPoint => ({
  id: 'bp_1',
  name: 'Demo stop',
  address: 'Demo address',
  latitude: 8.48,
  longitude: 124.64,
  transportationTypes: ['jeepney'],
  routeIds: ['route_jeepney_1'],
  ...overrides,
});

describe('transportation directory helpers', () => {
  it('filters routes by transportation category', () => {
    const routes = [
      route(),
      route({
        id: 'route_bus_1',
        routeCode: 'DEMO-02',
        transportationType: 'bus',
      }),
    ];

    expect(getRoutesForCategory(routes, 'jeepney')).toHaveLength(1);
    expect(getRoutesForCategory(routes, 'bus')[0].id).toBe('route_bus_1');
    expect(getRoutesForCategory(routes, 'ferry')).toEqual([]);
  });

  it('filters boarding points by supported category', () => {
    const points = [
      boardingPoint(),
      boardingPoint({
        id: 'bp_2',
        transportationTypes: ['bus', 'jeepney'],
      }),
      boardingPoint({ id: 'bp_3', transportationTypes: ['tricycle'] }),
    ];

    expect(getBoardingPointsForCategory(points, 'jeepney')).toHaveLength(2);
    expect(getBoardingPointsForCategory(points, 'tricycle')).toHaveLength(1);
    expect(getBoardingPointsForCategory(points, 'ferry')).toEqual([]);
  });

  it('summarises route counts, stops, and the fare range', () => {
    const routes = [
      route(),
      route({ id: 'route_2', fare: 18 }),
      route({ id: 'route_3', fare: 25, status: 'inactive' }),
      route({ id: 'route_bus', transportationType: 'bus', fare: 40 }),
    ];
    const points = [
      boardingPoint(),
      boardingPoint({ id: 'bp_2' }),
      boardingPoint({ id: 'bp_3', transportationTypes: ['bus'] }),
    ];

    expect(getCategorySummary(routes, points, 'jeepney')).toEqual({
      routeCount: 3,
      activeRouteCount: 2,
      boardingPointCount: 2,
      minFare: 13,
      maxFare: 25,
    });
  });

  it('returns null fares when a category has no routes', () => {
    expect(getCategorySummary([], [], 'ferry')).toEqual({
      routeCount: 0,
      activeRouteCount: 0,
      boardingPointCount: 0,
      minFare: null,
      maxFare: null,
    });
  });

  it('formats single fares and fare ranges', () => {
    expect(formatFareRange(null, null)).toBeNull();
    expect(formatFareRange(13, 13)).toBe('₱13');
    expect(formatFareRange(13, 25)).toBe('₱13 – ₱25');
  });
});
