import { Transportation, BoardingPoint } from "../../types";

export interface ITransportationApi {
  getCategories(): Promise<Transportation[]>;
  getBoardingPoints(): Promise<BoardingPoint[]>;
  getNearbyBoardingPoints(
    latitude: number,
    longitude: number,
    radiusKm?: number
  ): Promise<BoardingPoint[]>;
  getBoardingPoint(id: string): Promise<BoardingPoint | null>;
}

export class TransportationApi implements ITransportationApi {
  async getCategories(): Promise<Transportation[]> {
    const response = await api.get("/transportation/categories");
    return response.data;
  }

  async getBoardingPoints(): Promise<BoardingPoint[]> {
    const response = await api.get("/transportation/boarding-points");
    return response.data;
  }

  async getNearbyBoardingPoints(
    latitude: number,
    longitude: number,
    radiusKm: number = 2
  ): Promise<BoardingPoint[]> {
    const response = await api.get("/transportation/boarding-points/nearby", {
      params: { latitude, longitude, radiusKm },
    });
    return response.data;
  }

  async getBoardingPoint(id: string): Promise<BoardingPoint | null> {
    const response = await api.get(`/transportation/boarding-points/${id}`);
    return response.data;
  }
}

export class MockTransportationApi implements ITransportationApi {
  private categories: Transportation[] = [
    {
      id: "cat_jeepney",
      name: "Jeepney",
      category: "jeepney",
      icon: "jeepney",
      description: "Traditional Philippine jeepney",
    },
    {
      id: "cat_modern_jeepney",
      name: "Modern Jeepney",
      category: "modern_jeepney",
      icon: "bus",
      description: "Eco-friendly modern jeepney",
    },
    {
      id: "cat_multicab",
      name: "Multicab",
      category: "multicab",
      icon: "car",
      description: "Multi-passenger cab",
    },
    {
      id: "cat_tricycle",
      name: "Tricycle",
      category: "tricycle",
      icon: "motorcycle",
      description: "Motorcycle with sidecar",
    },
    {
      id: "cat_bus",
      name: "Bus",
      category: "bus",
      icon: "bus",
      description: "Large public bus",
    },
    {
      id: "cat_uv_express",
      name: "UV Express",
      category: "uv_express",
      icon: "car",
      description: "Air-conditioned van",
    },
    {
      id: "cat_van",
      name: "Van",
      category: "van",
      icon: "car",
      description: "Public utility van",
    },
    {
      id: "cat_ferry",
      name: "Ferry",
      category: "ferry",
      icon: "ship",
      description: "Water transport",
    },
    {
      id: "cat_train",
      name: "Train",
      category: "train",
      icon: "train",
      description: "Rail transport",
    },
  ];

  private boardingPoints: BoardingPoint[] = [
    {
      id: "bp_1",
      name: "SM CDO Jeepney Terminal",
      latitude: 8.4542,
      longitude: 124.6319,
      address: "SM City Cagayan de Oro, Uptown, CDO",
      transportationTypes: ["jeepney", "modern_jeepney"],
      routeIds: ["route_cdo_01", "route_cdo_02"],
    },
    {
      id: "bp_2",
      name: "Centrio Mall Jeepney Stop",
      latitude: 8.4795,
      longitude: 124.6417,
      address: "Centrio Mall, Uptown, CDO",
      transportationTypes: ["jeepney", "modern_jeepney"],
      routeIds: ["route_cdo_02"],
    },
    {
      id: "bp_3",
      name: "CDO City Hall Bus Stop",
      latitude: 8.4541,
      longitude: 124.6356,
      address: "City Hall, CDO",
      transportationTypes: ["bus", "jeepney"],
      routeIds: ["route_cdo_03"],
    },
    {
      id: "bp_4",
      name: "Limketkai UV Express Terminal",
      latitude: 8.4744,
      longitude: 124.6493,
      address: "Limketkai Center, Uptown, CDO",
      transportationTypes: ["uv_express", "van"],
      routeIds: ["route_cdo_04"],
    },
    {
      id: "bp_5",
      name: "MacArthur Highway Tricycle Stand",
      latitude: 8.4812,
      longitude: 124.6541,
      address: "MacArthur Highway, CDO",
      transportationTypes: ["tricycle"],
      routeIds: [],
    },
  ];

  async getCategories(): Promise<Transportation[]> {
    await new Promise<void>((resolve) => setTimeout(resolve, 300));
    return this.categories;
  }

  async getBoardingPoints(): Promise<BoardingPoint[]> {
    await new Promise<void>((resolve) => setTimeout(resolve, 400));
    return this.boardingPoints;
  }

  async getNearbyBoardingPoints(
    latitude: number,
    longitude: number,
    radiusKm: number = 2
  ): Promise<BoardingPoint[]> {
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
    return this.boardingPoints.filter((bp) => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        bp.latitude,
        bp.longitude
      );
      return distance <= radiusKm;
    });
  }

  async getBoardingPoint(id: string): Promise<BoardingPoint | null> {
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
    return this.boardingPoints.find((bp) => bp.id === id) || null;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

import api from "./index";
export const transportationApi: ITransportationApi = new MockTransportationApi();