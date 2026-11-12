import type { Location, Route, Trip } from '../../types';
import { environment } from '../../config/environment';
import api from './client';
import { MockRoutesApi } from '../mock/routesApi';

export interface IRoutesApi {
  getRoutes(): Promise<Route[]>;
  getRouteDetails(routeId: string): Promise<Route | null>;
  planTrip(origin: Location, destination: Location): Promise<Trip>;
}

export class RoutesApi implements IRoutesApi {
  async getRoutes(): Promise<Route[]> {
    const response = await api.get<Route[]>('/routes');
    return response.data;
  }

  async getRouteDetails(routeId: string): Promise<Route | null> {
    const response = await api.get<Route | null>(`/routes/${routeId}`);
    return response.data;
  }

  async planTrip(origin: Location, destination: Location): Promise<Trip> {
    const response = await api.post<Trip>('/trips/plan', {
      origin,
      destination,
    });
    return response.data;
  }
}

export const routesApi: IRoutesApi = environment.enableMockServices
  ? new MockRoutesApi()
  : new RoutesApi();
