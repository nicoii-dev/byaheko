import type {
  Announcement,
  BoardingPoint,
  BoardingPointWithDistance,
  Location,
  PopularRoute,
  Transportation,
} from '../../types';
import { NEARBY_RADIUS_KM } from '../../config/constants';
import {
  demoAnnouncements,
  demoBoardingPoints,
  demoPopularRoutes,
  demoTransportationCategories,
} from './data';
import { getNearbyBoardingPoints } from '../tripPlanner';

const wait = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export class MockTransportationApi {
  async getCategories(): Promise<Transportation[]> {
    await wait(250);
    return demoTransportationCategories;
  }

  async getBoardingPoints(): Promise<BoardingPoint[]> {
    await wait(300);
    return demoBoardingPoints;
  }

  async getBoardingPoint(id: string): Promise<BoardingPoint | null> {
    await wait(200);
    return demoBoardingPoints.find(point => point.id === id) ?? null;
  }

  async getNearbyBoardingPoints(
    location: Location,
    radiusKm = NEARBY_RADIUS_KM,
  ): Promise<BoardingPointWithDistance[]> {
    await wait(350);
    return getNearbyBoardingPoints(location, demoBoardingPoints, radiusKm);
  }

  async getAnnouncements(): Promise<Announcement[]> {
    await wait(250);
    return demoAnnouncements;
  }

  async getPopularRoutes(): Promise<PopularRoute[]> {
    await wait(250);
    return demoPopularRoutes;
  }
}
