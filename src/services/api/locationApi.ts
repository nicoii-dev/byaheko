import type { Location } from '../../types';
import { environment } from '../../config/environment';
import api from './client';
import { asList, requireData } from '../../utils/apiData';
import { getDeviceLocation } from '../location/deviceLocation';
import { MockLocationApi } from '../mock/locationApi';
import { searchGeocoder } from './geocoding';

export interface ILocationApi {
  getCurrentLocation(): Promise<Location>;
  reverseGeocode(latitude: number, longitude: number): Promise<string>;
  searchPlaces(query: string): Promise<Location[]>;
  getDirections(
    origin: Location,
    destination: Location,
  ): Promise<{ distance: number; duration: number }>;
}

export class LocationApi implements ILocationApi {
  async getCurrentLocation(): Promise<Location> {
    return getDeviceLocation();
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    const response = await api.get<{ address: string }>('/geocode/reverse', {
      params: { latitude, longitude },
    });
    return response.data?.address ?? '';
  }

  async searchPlaces(query: string): Promise<Location[]> {
    try {
      const response = await api.get<Location[]>('/geocode/search', {
        params: { query },
      });
      const results = asList(response.data);
      if (results.length > 0) {
        return results;
      }
    } catch {
      // The backend geocoder is optional; fall through to the configured
      // OpenStreetMap-based provider so destination search keeps working.
    }
    return searchGeocoder(query);
  }

  async getDirections(
    origin: Location,
    destination: Location,
  ): Promise<{ distance: number; duration: number }> {
    const response = await api.get<{ distance: number; duration: number }>(
      '/directions',
      {
        params: {
          originLatitude: origin.latitude,
          originLongitude: origin.longitude,
          destinationLatitude: destination.latitude,
          destinationLongitude: destination.longitude,
        },
      },
    );
    return requireData(response.data);
  }
}

class MockDeviceLocationApi extends MockLocationApi implements ILocationApi {
  async getCurrentLocation(): Promise<Location> {
    return getDeviceLocation();
  }
}

export const locationApi: ILocationApi = environment.enableMockServices
  ? new MockDeviceLocationApi()
  : new LocationApi();
