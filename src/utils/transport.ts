import type { AppTheme } from '../config/theme';
import type {
  BoardingPoint,
  Route,
  TransportationCategory,
} from '../types';
import { formatFare } from './geo';

export const getCategoryColor = (
  theme: AppTheme,
  category: TransportationCategory,
): string => {
  switch (category) {
    case 'jeepney':
      return theme.colors.jeepney;
    case 'modern_jeepney':
      return theme.colors.modernJeepney;
    case 'multicab':
      return theme.colors.multicab;
    case 'tricycle':
      return theme.colors.tricycle;
    case 'bus':
      return theme.colors.bus;
    case 'uv_express':
      return theme.colors.uvExpress;
    case 'van':
      return theme.colors.van;
    case 'ferry':
      return theme.colors.ferry;
    case 'train':
      return theme.colors.train;
    default:
      return theme.colors.primary;
  }
};

export interface CategorySummary {
  routeCount: number;
  activeRouteCount: number;
  boardingPointCount: number;
  minFare: number | null;
  maxFare: number | null;
}

export const getRoutesForCategory = (
  routes: Route[],
  category: TransportationCategory,
): Route[] =>
  routes.filter(route => route.transportationType === category);

export const getBoardingPointsForCategory = (
  boardingPoints: BoardingPoint[],
  category: TransportationCategory,
): BoardingPoint[] =>
  boardingPoints.filter(point =>
    point.transportationTypes.includes(category),
  );

/**
 * Builds the counts and fare range shown in the transportation directory.
 * Fare ranges are derived only from the configured demonstration routes.
 */
export const getCategorySummary = (
  routes: Route[],
  boardingPoints: BoardingPoint[],
  category: TransportationCategory,
): CategorySummary => {
  const categoryRoutes = getRoutesForCategory(routes, category);
  const fares = categoryRoutes.map(route => route.fare);

  return {
    routeCount: categoryRoutes.length,
    activeRouteCount: categoryRoutes.filter(route => route.status === 'active')
      .length,
    boardingPointCount: getBoardingPointsForCategory(boardingPoints, category)
      .length,
    minFare: fares.length > 0 ? Math.min(...fares) : null,
    maxFare: fares.length > 0 ? Math.max(...fares) : null,
  };
};

export const formatFareRange = (
  minFare: number | null,
  maxFare: number | null,
): string | null => {
  if (minFare === null || maxFare === null) {
    return null;
  }
  if (minFare === maxFare) {
    return formatFare(minFare);
  }
  return `${formatFare(minFare)} – ${formatFare(maxFare)}`;
};
