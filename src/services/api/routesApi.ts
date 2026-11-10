import { Route, RouteOption, Trip } from "../types";

export interface IRoutesApi {
  getRoutes(): Promise<Route[]>;
  getRouteDetails(routeId: string): Promise<Route | null>;
  planTrip(origin: any, destination: any): Promise<Trip>;
}

export class RoutesApi implements IRoutesApi {
  async getRoutes(): Promise<Route[]> {
    const response = await api.get("/routes");
    return response.data;
  }

  async getRouteDetails(routeId: string): Promise<Route | null> {
    const response = await api.get(`/routes/${routeId}`);
    return response.data;
  }

  async planTrip(origin: any, destination: any): Promise<Trip> {
    const response = await api.post("/trip/plan", { origin, destination });
    return response.data;
  }
}

export class MockRoutesApi implements IRoutesApi {
  private routes: Route[] = [
    {
      id: "route_cdo_01",
      routeCode: "CDO-01",
      routeName: "SM City - Centrio via City Hall",
      origin: "SM City CDO",
      destination: "Centrio Mall",
      transportationType: "jeepney",
      stops: [
        {
          id: "stop_001",
          name: "SM City CDO Terminal",
          latitude: 8.4542,
          longitude: 124.6319,
          sequence: 1,
          stopType: "boarding",
        },
        {
          id: "stop_002",
          name: "City Hall",
          latitude: 8.4541,
          longitude: 124.6356,
          sequence: 2,
          stopType: "transfer",
        },
        {
          id: "stop_003",
          name: "Centrio Mall",
          latitude: 8.4795,
          longitude: 124.6417,
          sequence: 3,
          stopType: "dropoff",
        },
      ],
      fare: 13,
      estimatedDuration: 25,
      status: "active",
    },
    {
      id: "route_cdo_02",
      routeCode: "CDO-02",
      routeName: "Centrio - SM City Express",
      origin: "Centrio Mall",
      destination: "SM City CDO",
      transportationType: "modern_jeepney",
      stops: [
        {
          id: "stop_004",
          name: "Centrio Mall",
          latitude: 8.4795,
          longitude: 124.6417,
          sequence: 1,
          stopType: "boarding",
        },
        {
          id: "stop_005",
          name: "SM City CDO Terminal",
          latitude: 8.4542,
          longitude: 124.6319,
          sequence: 2,
          stopType: "dropoff",
        },
      ],
      fare: 15,
      estimatedDuration: 20,
      status: "active",
    },
  ];

  async getRoutes(): Promise<Route[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return this.routes;
  }

  async getRouteDetails(routeId: string): Promise<Route | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.routes.find((r) => r.id === routeId) || null;
  }

  async planTrip(origin: any, destination: any): Promise<Trip> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const route = this.routes[0];
    const boardingPoint = {
      id: "bp_1",
      name: "SM City CDO Jeepney Terminal",
      latitude: 8.4542,
      longitude: 124.6319,
      address: "SM City Cagayan de Oro",
      transportationTypes: ["jeepney", "modern_jeepney"],
      routeIds: ["route_cdo_01"],
    };
    const dropoffPoint = {
      id: "bp_2",
      name: "Centrio Mall Jeepney Stop",
      latitude: 8.4795,
      longitude: 124.6417,
      address: "Centrio Mall, Uptown, CDO",
      transportationTypes: ["jeepney", "modern_jeepney"],
      routeIds: ["route_cdo_02"],
    };
    const routeOption: RouteOption = {
      id: "opt_1",
      summary: "Jeepney via City Hall",
      transportationTypes: ["jeepney"],
      boardingPoint,
      dropoffPoint,
      transferPoints: [],
      estimatedTravelTime: 25,
      estimatedFare: 13,
      walkingDistance: 400,
      transfers: 0,
      steps: [
        {
          id: "step_1",
          sequence: 1,
          instruction: "Walk to SM City CDO Jeepney Terminal",
          distance: 400,
          duration: 5,
        },
        {
          id: "step_2",
          sequence: 2,
          instruction: "Board a jeepney heading to Centrio Mall",
          transportationType: "jeepney",
          boardingPoint,
          duration: 20,
          fare: 13,
        },
        {
          id: "step_3",
          sequence: 3,
          instruction: "Get off at Centrio Mall Jeepney Stop and walk to destination",
          dropoffPoint,
          distance: 200,
          duration: 3,
        },
      ],
    };
    return {
      id: `trip_${Date.now()}`,
      origin,
      destination,
      routeOptions: [routeOption],
      estimatedFare: 13,
      estimatedDuration: 28,
      transfers: 0,
    };
  }
}

import api from "./index";
export const routesApi: IRoutesApi = new MockRoutesApi();