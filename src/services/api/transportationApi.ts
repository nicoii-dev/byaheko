import type {
  Announcement,
  BoardingPoint,
  BoardingPointWithDistance,
  Location,
  PopularRoute,
  Transportation,
  TransportationCategory,
} from '../../types';
import { environment } from '../../config/environment';
import {
  NEARBY_RADIUS_KM,
  TRANSPORTATION_CATEGORY_LIST,
  TRANSPORTATION_META,
} from '../../config/constants';
import { haversineDistance } from '../../utils/geo';
import { announcementsApi } from './announcementsApi';
import { advisoriesApi } from './advisoriesApi';
import { boardingPointsApi } from './boardingPointsApi';
import type { ApiBoardingPoint, ApiBoardingPointType } from './types';
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

/**
 * The commuter API exposes a boarding point's physical type, not its operator
 * category. Derive the closest vehicle categories so category filters, map
 * pins, and badges keep working with live records.
 */
const CATEGORIES_FOR_TYPE: Record<
  ApiBoardingPointType,
  TransportationCategory[]
> = {
  JEEPNEY_STOP: ['jeepney', 'modern_jeepney'],
  BUS_STOP: ['bus'],
  TERMINAL: [
    'bus',
    'jeepney',
    'modern_jeepney',
    'multicab',
    'uv_express',
    'van',
  ],
  TRICYCLE_TERMINAL: ['tricycle'],
  FERRY_TERMINAL: ['ferry'],
  TRAIN_STATION: ['train'],
  OTHER: [],
};

const mapBoardingPoint = (row: ApiBoardingPoint): BoardingPoint => ({
  id: row.id,
  name: row.name,
  address: row.address ?? row.landmark ?? 'Address not provided',
  latitude: row.latitude ?? 0,
  longitude: row.longitude ?? 0,
  transportationTypes: CATEGORIES_FOR_TYPE[row.type] ?? [],
  routeIds: row.routeId ? [row.routeId] : [],
  description: row.landmark ?? undefined,
});

const categoryList = (): Transportation[] =>
  TRANSPORTATION_CATEGORY_LIST.map(category => {
    const meta = TRANSPORTATION_META[category];
    return {
      id: category,
      name: meta.label,
      category,
      icon: meta.icon,
      description: `${meta.label} services in the ByaheKo directory.`,
    };
  });

const toAnnouncement = (
  row: Awaited<ReturnType<typeof announcementsApi.getAnnouncements>>[number],
): Announcement => ({
  id: row.id,
  title: row.title,
  message: row.body,
  type: 'announcement',
  publishedAt: row.publishedAt ?? row.createdAt,
});

const toAdvisory = (
  row: Awaited<ReturnType<typeof advisoriesApi.getAdvisories>>[number],
): Announcement => ({
  id: row.id,
  title: row.title,
  message: row.message,
  type: 'advisory',
  publishedAt: row.startsAt ?? row.createdAt,
});

export class TransportationApi implements ITransportationApi {
  async getCategories(): Promise<Transportation[]> {
    // Transportation types are seeded outside the commuter API surface, so the
    // directory uses the app's canonical category list instead of the
    // admin-only `/transportation-types` endpoint.
    return categoryList();
  }

  async getBoardingPoints(): Promise<BoardingPoint[]> {
    const rows = await boardingPointsApi.getBoardingPoints();
    return rows.map(mapBoardingPoint);
  }

  async getBoardingPoint(id: string): Promise<BoardingPoint | null> {
    try {
      const row = await boardingPointsApi.getBoardingPoint(id);
      return mapBoardingPoint(row);
    } catch {
      return null;
    }
  }

  async getNearbyBoardingPoints(
    location: Location,
    radiusKm = NEARBY_RADIUS_KM,
  ): Promise<BoardingPointWithDistance[]> {
    const points = await boardingPointsApi.getBoardingPoints({
      isActive: 'true',
    });
    const radiusMeters = radiusKm * 1000;

    return points
      .map(mapBoardingPoint)
      .map(point => ({
        ...point,
        distanceMeters: haversineDistance(location, point),
      }))
      .filter(point => point.distanceMeters <= radiusMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  async getAnnouncements(): Promise<Announcement[]> {
    const [announcements, advisories] = await Promise.all([
      announcementsApi.getAnnouncements(),
      advisoriesApi.getAdvisories(),
    ]);

    return [
      ...announcements.map(toAnnouncement),
      ...advisories.map(toAdvisory),
    ].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  }

  async getPopularRoutes(): Promise<PopularRoute[]> {
    // Route listings are not part of the commuter API yet; fares and boarding
    // points provide the live route context until that module ships.
    return [];
  }
}

export const transportationApi: ITransportationApi =
  environment.enableMockServices
    ? new MockTransportationApi()
    : new TransportationApi();
