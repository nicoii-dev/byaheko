import { Linking, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import type { Location } from '../../types';
import type { PermissionStatus } from './types';

Geolocation.setRNConfiguration({
  skipPermissionRequests: true,
  authorizationLevel: 'whenInUse',
  locationProvider: 'auto',
  enableBackgroundLocationUpdates: false,
});

const androidPermissions = [
  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
];

export const requestLocationPermission =
  async (): Promise<PermissionStatus> => {
    if (Platform.OS === 'android') {
      try {
        const result = await PermissionsAndroid.requestMultiple(
          androidPermissions,
        );
        const fine = result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
        const coarse =
          result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];

        if (
          fine === PermissionsAndroid.RESULTS.GRANTED ||
          coarse === PermissionsAndroid.RESULTS.GRANTED
        ) {
          return 'granted';
        }
        if (
          fine === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
          coarse === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
        ) {
          return 'blocked';
        }
        return 'denied';
      } catch {
        return 'denied';
      }
    }

    try {
      await new Promise<void>((resolve, reject) => {
        Geolocation.requestAuthorization(resolve, error => {
          reject(new Error(error.message));
        });
      });
      return 'granted';
    } catch {
      return 'denied';
    }
  };

export class LocationPermissionError extends Error {
  readonly status: PermissionStatus;

  constructor(status: PermissionStatus, message: string) {
    super(message);
    this.name = 'LocationPermissionError';
    this.status = status;
  }
}

export const getDeviceLocation = (): Promise<Location> =>
  new Promise<Location>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
          name: 'Current location',
        });
      },
      error => {
        if (error.code === 1) {
          reject(
            new LocationPermissionError(
              'denied',
              'Location permission was denied. You can choose a location manually.',
            ),
          );
          return;
        }
        reject(
          new Error(
            error.code === 3
              ? 'Getting your location timed out. Please try again.'
              : 'Your location is unavailable right now. Check GPS and try again.',
          ),
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 10_000,
      },
    );
  });

export const openAppSettings = async (): Promise<void> => {
  try {
    await Linking.openSettings();
  } catch {
    // The settings screen is not available on every platform/device.
  }
};
