import {
  formatDistance,
  formatDuration,
  formatFare,
  formatRelativeTime,
  getDistanceMeters,
  getInitials,
  haversineDistance,
  isSameLocation,
  toLocationLabel,
} from '../src/utils/geo';
import type { BoardingPoint, Location } from '../src/types';

const location = (overrides: Partial<Location> = {}): Location => ({
  id: 'loc_1',
  name: 'Cogon Market',
  address: 'Cogon, Cagayan de Oro',
  latitude: 8.48,
  longitude: 124.65,
  ...overrides,
});

describe('haversineDistance', () => {
  it('returns zero for identical coordinates', () => {
    expect(haversineDistance(location(), location())).toBe(0);
  });

  it('returns a plausible distance between two city points', () => {
    const distance = haversineDistance(
      { latitude: 8.48, longitude: 124.64 },
      { latitude: 8.49, longitude: 124.65 },
    );

    expect(distance).toBeGreaterThan(1000);
    expect(distance).toBeLessThan(2000);
  });
});

describe('isSameLocation', () => {
  it('matches locations by id when both have one', () => {
    expect(isSameLocation(location(), location({ latitude: 8.5 }))).toBe(true);
    expect(isSameLocation(location(), location({ id: 'loc_2' }))).toBe(false);
  });

  it('falls back to coordinates when ids are missing', () => {
    expect(
      isSameLocation(
        location({ id: undefined }),
        location({ id: undefined, latitude: 8.48001 }),
      ),
    ).toBe(true);
    expect(
      isSameLocation(
        location({ id: undefined }),
        location({ id: undefined, latitude: 8.5 }),
      ),
    ).toBe(false);
  });

  it('returns false when either location is missing', () => {
    expect(isSameLocation(null, location())).toBe(false);
    expect(isSameLocation(location(), null)).toBe(false);
  });
});

describe('formatting helpers', () => {
  it('formats distances in metres and kilometres', () => {
    expect(formatDistance(450)).toBe('450 m');
    expect(formatDistance(1500)).toBe('1.5 km');
  });

  it('formats durations in minutes and hours', () => {
    expect(formatDuration(0)).toBe('1 min');
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(60)).toBe('1 hr');
    expect(formatDuration(95)).toBe('1 hr 35 min');
  });

  it('formats fares with the peso sign', () => {
    expect(formatFare(15)).toBe('₱15');
    expect(formatFare(12.5)).toBe('₱12.50');
  });

  it('handles invalid dates without throwing', () => {
    expect(formatRelativeTime('not-a-date')).toBe('');
  });
});

describe('display helpers', () => {
  it('uses the location name, then address, then a fallback', () => {
    expect(toLocationLabel(location())).toBe('Cogon Market');
    expect(toLocationLabel(location({ name: '' }))).toBe(
      'Cogon, Cagayan de Oro',
    );
    expect(toLocationLabel(location({ name: '', address: '' }))).toBe(
      'Pinned location',
    );
    expect(toLocationLabel(null)).toBe('Select a location');
  });

  it('derives initials from the available names', () => {
    expect(getInitials('Juan', 'Dela Cruz')).toBe('JD');
    expect(getInitials('Juan')).toBe('J');
    expect(getInitials()).toBe('BK');
  });

  it('reads an attached distance only when present', () => {
    const point: BoardingPoint = {
      id: 'bp_1',
      name: 'Cogon',
      address: 'Cogon',
      latitude: 8.48,
      longitude: 124.65,
      transportationTypes: ['jeepney'],
      routeIds: [],
    };

    expect(getDistanceMeters(point)).toBeUndefined();
    expect(getDistanceMeters({ ...point, distanceMeters: 320 })).toBe(320);
  });
});
