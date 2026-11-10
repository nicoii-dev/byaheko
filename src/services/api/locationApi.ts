import { Location } from "../../types";

export interface ILocationApi {
  getCurrentLocation(): Promise<Location>;
  reverseGeocode(latitude: number, longitude: number): Promise<string>;
  searchPlaces(query: string): Promise<Location[]>;
  getDirections(origin: Location, destination: Location): Promise<any>;
}

export class LocationApi implements ILocationApi {
  async getCurrentLocation(): Promise<Location> {
    return new Promise<Location>((resolve, reject) => {
      try {
        const geo = (globalThis as any).navigator?.geolocation;
        if (!geo) {
          reject(new Error("Geolocation not available"));
          return;
        }
        geo.getCurrentPosition(
          (position: any) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          },
          (error: any) => reject(error),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }

  async searchPlaces(query: string): Promise<Location[]> {
    return new MockLocationApi().searchPlaces(query);
  }

  async getDirections(origin: Location, destination: Location): Promise<any> {
    return new MockLocationApi().getDirections(origin, destination);
  }
}

export class MockLocationApi implements ILocationApi {
  private samplePlaces: Location[] = [
    {
      id: "loc_1",
      name: "SM City Cagayan de Oro",
      latitude: 8.4542,
      longitude: 124.6319,
      address: "Uptown, Cagayan de Oro",
    },
    {
      id: "loc_2",
      name: "Centrio Mall",
      latitude: 8.4795,
      longitude: 124.6417,
      address: "Uptown, Cagayan de Oro",
    },
    {
      id: "loc_3",
      name: "Cagayan de Oro City Hall",
      latitude: 8.4541,
      longitude: 124.6356,
      address: "City Hall, CDO",
    },
    {
      id: "loc_4",
      name: "Limketkai Center",
      latitude: 8.4744,
      longitude: 124.6493,
      address: "Uptown, CDO",
    },
    {
      id: "loc_5",
      name: "MacArthur Highway",
      latitude: 8.4812,
      longitude: 124.6541,
      address: "CDO",
    },
  ];

  async getCurrentLocation(): Promise<Location> {
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
    return {
      latitude: 8.4542,
      longitude: 124.6319,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
      name: "Current Location",
      address: "Cagayan de Oro",
    };
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    await new Promise<void>((resolve) => setTimeout(resolve, 300));
    const place = this.samplePlaces.find(
      (p) => Math.abs(p.latitude - latitude) < 0.01
    );
    return place ? place.address || "" : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }

  async searchPlaces(query: string): Promise<Location[]> {
    await new Promise<void>((resolve) => setTimeout(resolve, 400));
    const lowerQuery = query.toLowerCase();
    return this.samplePlaces.filter((p) =>
      p.name ? p.name.toLowerCase().includes(lowerQuery) : false
    );
  }

  async getDirections(_origin: Location, _destination: Location): Promise<any> {
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
    return {
      distance: 5200,
      duration: 780,
      polyline: [],
    };
  }
}

export const locationApi: ILocationApi = new MockLocationApi();