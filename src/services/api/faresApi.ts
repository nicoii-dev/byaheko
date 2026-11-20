import { environment } from '../../config/environment';
import api from './client';
import { requireData } from '../../utils/apiData';
import { fetchAllPages } from './pagination';
import type { ApiFare, ListParams } from './types';

export interface IFaresApi {
  getFares(params?: ListParams): Promise<ApiFare[]>;
  getFare(id: string): Promise<ApiFare>;
}

export class FaresApi implements IFaresApi {
  async getFares(params: ListParams = {}): Promise<ApiFare[]> {
    return fetchAllPages<ApiFare>('/fares', params);
  }

  async getFare(id: string): Promise<ApiFare> {
    const response = await api.get<ApiFare>(`/fares/${id}`);
    return requireData(response.data);
  }
}

class MockFaresApi implements IFaresApi {
  async getFares(): Promise<ApiFare[]> {
    return [];
  }

  async getFare(): Promise<ApiFare> {
    throw new Error('Fare not found.');
  }
}

export const faresApi: IFaresApi = environment.enableMockServices
  ? new MockFaresApi()
  : new FaresApi();
