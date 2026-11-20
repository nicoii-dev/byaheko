import { environment } from '../../config/environment';
import api from './client';
import { asList, requireData } from '../../utils/apiData';
import { fetchAllPages } from './pagination';
import { demoBoardingPoints } from '../mock/data';
import type { ApiBoardingPoint, ListParams } from './types';

export interface IBoardingPointsApi {
  getBoardingPoints(params?: ListParams): Promise<ApiBoardingPoint[]>;
  getBoardingPoint(id: string): Promise<ApiBoardingPoint>;
}

export class BoardingPointsApi implements IBoardingPointsApi {
  async getBoardingPoints(
    params: ListParams = {},
  ): Promise<ApiBoardingPoint[]> {
    return fetchAllPages<ApiBoardingPoint>('/boarding-points', params);
  }

  async getBoardingPoint(id: string): Promise<ApiBoardingPoint> {
    const response = await api.get<ApiBoardingPoint>(`/boarding-points/${id}`);
    return requireData(response.data);
  }
}

class MockBoardingPointsApi implements IBoardingPointsApi {
  private points: ApiBoardingPoint[] = demoBoardingPoints.map(point => ({
    id: point.id,
    routeId: point.routeIds[0] ?? '',
    name: point.name,
    type: 'OTHER',
    address: point.address ?? null,
    landmark: point.description ?? null,
    latitude: point.latitude,
    longitude: point.longitude,
    sequence: null,
    isActive: true,
    isVerified: false,
    sourceName: null,
    sourceUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  async getBoardingPoints(): Promise<ApiBoardingPoint[]> {
    return asList(this.points);
  }

  async getBoardingPoint(id: string): Promise<ApiBoardingPoint> {
    return requireData(this.points.find(point => point.id === id));
  }
}

export const boardingPointsApi: IBoardingPointsApi =
  environment.enableMockServices
    ? new MockBoardingPointsApi()
    : new BoardingPointsApi();
