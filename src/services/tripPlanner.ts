import {
  MAX_BOARDING_WALK_METERS,
  MAX_TRANSFER_WALK_METERS,
  WALKING_SPEED_METERS_PER_MINUTE,
} from '../config/constants';
import type {
  BoardingPoint,
  BoardingPointWithDistance,
  Location,
  Route,
  RouteOption,
  RouteStop,
  TransportationCategory,
  Trip,
  TripStep,
} from '../types';
import { formatDistance, haversineDistance } from '../utils/geo';

const walkingMinutes = (meters: number): number =>
  Math.max(1, Math.round(meters / WALKING_SPEED_METERS_PER_MINUTE));

const unique = <T,>(values: T[]): T[] => Array.from(new Set(values));

const findClosestStop = (
  location: Location,
  stops: RouteStop[],
): { stop: RouteStop; distance: number } | null => {
  if (stops.length === 0) {
    return null;
  }
  return stops.reduce<{ stop: RouteStop; distance: number }>(
    (closest, current) => {
      const distance = haversineDistance(location, current);
      return distance < closest.distance
        ? { stop: current, distance }
        : closest;
    },
    { stop: stops[0], distance: haversineDistance(location, stops[0]) },
  );
};

const findBoardingStop = (
  origin: Location,
  stops: RouteStop[],
): { stop: RouteStop; distance: number } | null => {
  const closest = findClosestStop(origin, stops);
  if (!closest || closest.distance > MAX_BOARDING_WALK_METERS) {
    return null;
  }
  return closest;
};

const findDropoffStop = (
  destination: Location,
  stops: RouteStop[],
  afterSequence: number,
): { stop: RouteStop; distance: number } | null => {
  const eligible = stops.filter(stop => stop.sequence > afterSequence);
  const closest = findClosestStop(destination, eligible);
  if (!closest || closest.distance > MAX_BOARDING_WALK_METERS) {
    return null;
  }
  return closest;
};

const stopDistance = (from: RouteStop, to: RouteStop): number =>
  haversineDistance(from, to);

const segmentDuration = (
  route: Route,
  boarding: RouteStop,
  dropoff: RouteStop,
): number => {
  const stopCount = Math.max(1, route.stops.length - 1);
  const segmentCount = Math.max(1, dropoff.sequence - boarding.sequence);
  const share = Math.min(1, segmentCount / stopCount);
  return Math.max(1, Math.round(route.estimatedDuration * share));
};

const boardingPointForStop = (
  stop: RouteStop,
  boardingPoints: BoardingPoint[],
): BoardingPoint => {
  const match = boardingPoints.find(
    point => haversineDistance(point, stop) < 120,
  );
  if (match) {
    return match;
  }
  // A route stop can exist without a separately configured boarding point.
  // Build a read-only projection so the UI still has a consistent shape.
  return {
    id: `stop_point_${stop.id}`,
    name: stop.name,
    address: stop.name,
    latitude: stop.latitude,
    longitude: stop.longitude,
    transportationTypes: [],
    routeIds: [],
  };
};

const buildDirectOption = (
  route: Route,
  origin: Location,
  destination: Location,
  boarding: { stop: RouteStop; distance: number },
  dropoff: { stop: RouteStop; distance: number },
  boardingPoints: BoardingPoint[],
): RouteOption => {
  const boardingPoint = boardingPointForStop(boarding.stop, boardingPoints);
  const dropoffPoint = boardingPointForStop(dropoff.stop, boardingPoints);
  const rideDuration = segmentDuration(route, boarding.stop, dropoff.stop);
  const walkToMinutes = walkingMinutes(boarding.distance);
  const walkFromMinutes = walkingMinutes(dropoff.distance);
  const steps: TripStep[] = [
    {
      id: `${route.id}_walk_to`,
      sequence: 1,
      instruction: `Walk ${formatDistance(boarding.distance)} to ${boarding.stop.name}.`,
      distance: boarding.distance,
      duration: walkToMinutes,
    },
    {
      id: `${route.id}_ride`,
      sequence: 2,
      instruction: `Board the ${route.routeName} and get off at ${dropoff.stop.name}.`,
      transportationType: route.transportationType,
      boardingPoint,
      dropoffPoint,
      duration: rideDuration,
      fare: route.fare,
      routeId: route.id,
      routeName: route.routeName,
    },
    {
      id: `${route.id}_walk_from`,
      sequence: 3,
      instruction: `Walk ${formatDistance(dropoff.distance)} to your destination.`,
      distance: dropoff.distance,
      duration: walkFromMinutes,
    },
  ];

  return {
    id: `direct_${route.id}`,
    summary: route.routeName,
    transportationTypes: [route.transportationType],
    boardingPoint,
    dropoffPoint,
    transferPoints: [],
    estimatedTravelTime: walkToMinutes + rideDuration + walkFromMinutes,
    estimatedFare: route.fare,
    walkingDistance: boarding.distance + dropoff.distance,
    transfers: 0,
    steps,
    routeIds: [route.id],
    isDemoData: route.isDemoData,
  };
};

const buildTransferOption = (
  firstRoute: Route,
  secondRoute: Route,
  origin: Location,
  destination: Location,
  firstBoarding: { stop: RouteStop; distance: number },
  firstDropoff: { stop: RouteStop; distance: number },
  secondBoarding: { stop: RouteStop; distance: number },
  secondDropoff: { stop: RouteStop; distance: number },
  boardingPoints: BoardingPoint[],
): RouteOption => {
  const firstBoardingPoint = boardingPointForStop(
    firstBoarding.stop,
    boardingPoints,
  );
  const transferPoint = boardingPointForStop(
    secondBoarding.stop,
    boardingPoints,
  );
  const finalDropoffPoint = boardingPointForStop(
    secondDropoff.stop,
    boardingPoints,
  );
  const firstRide = segmentDuration(
    firstRoute,
    firstBoarding.stop,
    firstDropoff.stop,
  );
  const secondRide = segmentDuration(
    secondRoute,
    secondBoarding.stop,
    secondDropoff.stop,
  );
  const walkToMinutes = walkingMinutes(firstBoarding.distance);
  const transferMinutes = walkingMinutes(secondBoarding.distance);
  const walkFromMinutes = walkingMinutes(secondDropoff.distance);
  const totalWalking =
    firstBoarding.distance + secondBoarding.distance + secondDropoff.distance;

  const steps: TripStep[] = [
    {
      id: `${firstRoute.id}_${secondRoute.id}_walk_to`,
      sequence: 1,
      instruction: `Walk ${formatDistance(
        firstBoarding.distance,
      )} to ${firstBoarding.stop.name}.`,
      distance: firstBoarding.distance,
      duration: walkToMinutes,
    },
    {
      id: `${firstRoute.id}_${secondRoute.id}_first_ride`,
      sequence: 2,
      instruction: `Board the ${firstRoute.routeName} and get off at ${firstDropoff.stop.name}.`,
      transportationType: firstRoute.transportationType,
      boardingPoint: firstBoardingPoint,
      dropoffPoint: transferPoint,
      duration: firstRide,
      fare: firstRoute.fare,
      routeId: firstRoute.id,
      routeName: firstRoute.routeName,
    },
    {
      id: `${firstRoute.id}_${secondRoute.id}_transfer`,
      sequence: 3,
      instruction: `Walk ${formatDistance(
        secondBoarding.distance,
      )} to ${secondBoarding.stop.name} for your transfer.`,
      distance: secondBoarding.distance,
      duration: transferMinutes,
    },
    {
      id: `${firstRoute.id}_${secondRoute.id}_second_ride`,
      sequence: 4,
      instruction: `Board the ${secondRoute.routeName} and get off at ${secondDropoff.stop.name}.`,
      transportationType: secondRoute.transportationType,
      boardingPoint: transferPoint,
      dropoffPoint: finalDropoffPoint,
      duration: secondRide,
      fare: secondRoute.fare,
      routeId: secondRoute.id,
      routeName: secondRoute.routeName,
    },
    {
      id: `${firstRoute.id}_${secondRoute.id}_walk_from`,
      sequence: 5,
      instruction: `Walk ${formatDistance(
        secondDropoff.distance,
      )} to your destination.`,
      distance: secondDropoff.distance,
      duration: walkFromMinutes,
    },
  ];

  return {
    id: `transfer_${firstRoute.id}_${secondRoute.id}`,
    summary: `${firstRoute.routeCode} + ${secondRoute.routeCode}`,
    transportationTypes: unique<TransportationCategory>([
      firstRoute.transportationType,
      secondRoute.transportationType,
    ]),
    boardingPoint: firstBoardingPoint,
    dropoffPoint: finalDropoffPoint,
    transferPoints: [transferPoint],
    estimatedTravelTime:
      walkToMinutes + firstRide + transferMinutes + secondRide + walkFromMinutes,
    estimatedFare: firstRoute.fare + secondRoute.fare,
    walkingDistance: totalWalking,
    transfers: 1,
    steps,
    routeIds: [firstRoute.id, secondRoute.id],
    isDemoData: firstRoute.isDemoData || secondRoute.isDemoData,
  };
};

const buildWalkingOnlyOption = (
  origin: Location,
  destination: Location,
  distance: number,
): RouteOption => {
  const pseudoBoarding: BoardingPoint = {
    id: 'walking_origin',
    name: origin.name ?? 'Starting point',
    address: origin.address ?? 'Starting point',
    latitude: origin.latitude,
    longitude: origin.longitude,
    transportationTypes: [],
    routeIds: [],
  };
  const pseudoDestination: BoardingPoint = {
    id: 'walking_destination',
    name: destination.name ?? 'Destination',
    address: destination.address ?? 'Destination',
    latitude: destination.latitude,
    longitude: destination.longitude,
    transportationTypes: [],
    routeIds: [],
  };
  const duration = walkingMinutes(distance);

  return {
    id: 'walking_only',
    summary: 'Walk directly to your destination',
    transportationTypes: [],
    boardingPoint: pseudoBoarding,
    dropoffPoint: pseudoDestination,
    transferPoints: [],
    estimatedTravelTime: duration,
    estimatedFare: 0,
    walkingDistance: distance,
    transfers: 0,
    steps: [
      {
        id: 'walking_only_step',
        sequence: 1,
        instruction: `Walk ${formatDistance(distance)} to ${
          destination.name ?? 'your destination'
        }.`,
        distance,
        duration,
      },
    ],
    routeIds: [],
    walkingOnly: true,
  };
};

export interface TripPlannerInput {
  origin: Location;
  destination: Location;
  routes: Route[];
  boardingPoints: BoardingPoint[];
}

/**
 * Builds route suggestions strictly from the configured route graph.
 *
 * Supported patterns:
 * - direct ride on one configured route
 * - one transfer between two configured routes
 * - walking only when origin and destination are very close
 *
 * The planner never invents a route, stop, or fare. If the configured graph
 * cannot connect the two points it returns an empty list.
 */
export const planRoutes = ({
  origin,
  destination,
  routes,
  boardingPoints,
}: TripPlannerInput): RouteOption[] => {
  const options: RouteOption[] = [];
  const directDistance = haversineDistance(origin, destination);

  if (directDistance <= 900) {
    options.push(buildWalkingOnlyOption(origin, destination, directDistance));
  }

  for (const route of routes) {
    if (route.status !== 'active') {
      continue;
    }
    const boarding = findBoardingStop(origin, route.stops);
    if (!boarding) {
      continue;
    }
    const dropoff = findDropoffStop(
      destination,
      route.stops,
      boarding.stop.sequence,
    );
    if (!dropoff) {
      continue;
    }
    options.push(
      buildDirectOption(
        route,
        origin,
        destination,
        boarding,
        dropoff,
        boardingPoints,
      ),
    );
  }

  for (const firstRoute of routes) {
    if (firstRoute.status !== 'active') {
      continue;
    }
    const firstBoarding = findBoardingStop(origin, firstRoute.stops);
    if (!firstBoarding) {
      continue;
    }

    for (const secondRoute of routes) {
      if (secondRoute.id === firstRoute.id || secondRoute.status !== 'active') {
        continue;
      }

      const secondDropoff = findDropoffStop(
        destination,
        secondRoute.stops,
        -1,
      );
      if (!secondDropoff) {
        continue;
      }

      const firstCandidates = firstRoute.stops.filter(
        stop => stop.sequence > firstBoarding.stop.sequence,
      );
      const secondCandidates = secondRoute.stops.filter(
        stop => stop.sequence < secondDropoff.stop.sequence,
      );

      let bestTransfer:
        | {
            firstDropoff: RouteStop;
            secondBoarding: RouteStop;
            walk: number;
          }
        | undefined;

      for (const firstStop of firstCandidates) {
        for (const secondStop of secondCandidates) {
          const walk = stopDistance(firstStop, secondStop);
          if (walk > MAX_TRANSFER_WALK_METERS) {
            continue;
          }
          if (!bestTransfer || walk < bestTransfer.walk) {
            bestTransfer = {
              firstDropoff: firstStop,
              secondBoarding: secondStop,
              walk,
            };
          }
        }
      }

      if (!bestTransfer) {
        continue;
      }

      options.push(
        buildTransferOption(
          firstRoute,
          secondRoute,
          origin,
          destination,
          firstBoarding,
          {
            stop: bestTransfer.firstDropoff,
            distance: bestTransfer.walk,
          },
          {
            stop: bestTransfer.secondBoarding,
            distance: bestTransfer.walk,
          },
          secondDropoff,
          boardingPoints,
        ),
      );
    }
  }

  const deduped = new Map<string, RouteOption>();
  for (const option of options) {
    deduped.set(option.id, option);
  }

  return Array.from(deduped.values()).sort((a, b) => {
    if (a.transfers !== b.transfers) {
      return a.transfers - b.transfers;
    }
    if (a.estimatedTravelTime !== b.estimatedTravelTime) {
      return a.estimatedTravelTime - b.estimatedTravelTime;
    }
    return a.estimatedFare - b.estimatedFare;
  });
};

export const buildTrip = (
  origin: Location,
  destination: Location,
  routes: Route[],
  boardingPoints: BoardingPoint[],
): Trip => {
  const routeOptions = planRoutes({
    origin,
    destination,
    routes,
    boardingPoints,
  });
  const best = routeOptions[0];

  return {
    id: `trip_${Date.now()}`,
    origin,
    destination,
    routeOptions,
    estimatedFare: best?.estimatedFare ?? 0,
    estimatedDuration: best?.estimatedTravelTime ?? 0,
    transfers: best?.transfers ?? 0,
    isDemoData: routes.some(route => route.isDemoData),
  };
};

export const getNearbyBoardingPoints = (
  location: Location,
  boardingPoints: BoardingPoint[],
  radiusKm: number,
): BoardingPointWithDistance[] =>
  boardingPoints
    .map(point => ({
      ...point,
      distanceMeters: haversineDistance(location, point),
    }))
    .filter(point => point.distanceMeters <= radiusKm * 1000)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
