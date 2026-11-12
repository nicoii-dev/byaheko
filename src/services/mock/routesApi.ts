import type { Location, Route, Trip } from '../../types';
import { demoBoardingPoints, demoRoutes } from './data';
import { buildTrip } from '../tripPlanner';

const wait = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export class MockRoutesApi {
  async getRoutes(): Promise<Route[]> {
    await wait(300);
    return demoRoutes;
  }

  async getRouteDetails(routeId: string): Promise<Route | null> {
    await wait(200);
    return demoRoutes.find(route => route.id === routeId) ?? null;
  }

  async planTrip(origin: Location, destination: Location): Promise<Trip> {
    await wait(500);
    return buildTrip(origin, destination, demoRoutes, demoBoardingPoints);
  }
}
