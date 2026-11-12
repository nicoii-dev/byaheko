import type {
  BoardingPoint,
  BoardingPointWithDistance,
  Coordinates,
  Location,
} from '../types';

const EARTH_RADIUS_METERS = 6_371_000;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/** Great-circle distance between two coordinates, in metres. */
export const haversineDistance = (
  from: Coordinates,
  to: Coordinates,
): number => {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Reads the optional distance attached to a boarding point. Using a helper
 * keeps the UI from having to narrow the union with an `in` check, which
 * widens the property type to `unknown`.
 */
export const getDistanceMeters = (
  point: BoardingPoint | BoardingPointWithDistance,
): number | undefined =>
  'distanceMeters' in point ? point.distanceMeters : undefined;


export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

export const formatDuration = (minutes: number): string => {
  const rounded = Math.max(1, Math.round(minutes));
  if (rounded < 60) {
    return `${rounded} min`;
  }
  const hours = Math.floor(rounded / 60);
  const remaining = rounded % 60;
  return remaining === 0 ? `${hours} hr` : `${hours} hr ${remaining} min`;
};

export const formatFare = (fare: number): string => {
  const value = Number.isInteger(fare) ? fare.toString() : fare.toFixed(2);
  return `₱${value}`;
};

export const formatRelativeTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (Number.isNaN(diffMinutes)) {
    return '';
  }
  if (diffMinutes < 1) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  return date.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.trim().charAt(0) ?? '';
  const last = lastName?.trim().charAt(0) ?? '';
  return `${first}${last}`.toUpperCase() || 'BK';
};

export const toLocationLabel = (location: Location | null): string => {
  if (!location) {
    return 'Select a location';
  }
  return location.name || location.address || 'Pinned location';
};

export const isSameLocation = (
  first: Location | null,
  second: Location | null,
): boolean => {
  if (!first || !second) {
    return false;
  }
  if (first.id && second.id) {
    return first.id === second.id;
  }
  return (
    Math.abs(first.latitude - second.latitude) < 0.0001 &&
    Math.abs(first.longitude - second.longitude) < 0.0001
  );
};
