import type { Location } from '../../types';
import { demoPlaces } from './data';

const wait = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export class MockLocationApi {
  async searchPlaces(query: string): Promise<Location[]> {
    await wait(250);
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return demoPlaces;
    }
    return demoPlaces.filter(place => {
      const haystack = `${place.name ?? ''} ${place.address ?? ''}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    await wait(200);
    const nearest = demoPlaces.reduce<Location | null>((closest, place) => {
      if (!closest) {
        return place;
      }
      const currentDistance =
        Math.abs(place.latitude - latitude) +
        Math.abs(place.longitude - longitude);
      const closestDistance =
        Math.abs(closest.latitude - latitude) +
        Math.abs(closest.longitude - longitude);
      return currentDistance < closestDistance ? place : closest;
    }, null);

    return nearest?.address ?? 'Pinned location';
  }

  async getDirections(
    origin: Location,
    destination: Location,
  ): Promise<{ distance: number; duration: number }> {
    await wait(250);
    const distance =
      Math.abs(origin.latitude - destination.latitude) * 111_000 +
      Math.abs(origin.longitude - destination.longitude) * 111_000;
    return {
      distance: Math.round(distance),
      duration: Math.max(1, Math.round(distance / 80)),
    };
  }
}
