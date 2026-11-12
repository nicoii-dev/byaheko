import type {
  Announcement,
  BoardingPoint,
  BoardingPointWithDistance,
  Location,
  PopularRoute,
  Transportation,
} from '../../types';
import { environment } from '../../config/environment';
import { NEARBY_RADIUS_KM } from '../../config/constants';
import api from './client';
import { MockTransportationApi } from '../mock/transportationApi';

export interface ITransportationApi {
  getCategories(): Promise<Transportation[]>;
  getBoardingPoints(): Promise<BoardingPoint[]>;
  getBoardingPoint(id: string): Promise<BoardingPoint | null>;
  getNearbyBoardingPoints(
    location: Location,
    radiusKm?: number,
  ): Promise<BoardingPointWithDistance[]>;
  getAnnouncements(): Promise<Announcement[]>;
  getPopularRoutes(): Promise<PopularRoute[]>;
}

export class TransportationApi implements ITransportationApi {
  async getCategories(): Promise<Transportation[]> {
    const response = await api.get<Transportation[]>(
      '/transportation/categories',
    );
    return response.data;
  }

  async getBoardingPoints(): Promise<BoardingPoint[]> {
    const response = await api.get<BoardingPoint[]>(
      '/transportation/boarding-points',
    );
    return response.data;
  }

  async getBoardingPoint(id: string): Promise<BoardingPoint | null> {
    const response = await api.get<BoardingPoint | null>(
      `/transportation/boarding-points/${id}`,
    );
    return response.data;
  }

  async getNearbyBoardingPoints(
    location: Location,
    radiusKm = NEARBY_RADIUS_KM,
  ): Promise<BoardingPointWithDistance[]> {
    const response = await api.get<BoardingPointWithDistance[]>(
      '/transportation/boarding-points/nearby',
      {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          radiusKm,
        },
      },
    );
    return response.data;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    const response = await api.get<Announcement[]>('/announcements');
    return response.data;
  }

  async getPopularRoutes(): Promise<PopularRoute[]> {
    const response = await api.get<PopularRoute[]>('/routes/popular');
    return response.data;
  }
}

export const transportationApi: ITransportationApi =
  environment.enableMockServices
    ? new MockTransportationApi()
    : new TransportationApi();
