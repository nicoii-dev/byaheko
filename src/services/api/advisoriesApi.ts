import { environment } from '../../config/environment';
import api from './client';
import { requireData } from '../../utils/apiData';
import { fetchAllPages } from './pagination';
import { demoAnnouncements } from '../mock/data';
import type { ApiAdvisory, ListParams } from './types';

export interface IAdvisoriesApi {
  getAdvisories(params?: ListParams): Promise<ApiAdvisory[]>;
  getAdvisory(id: string): Promise<ApiAdvisory>;
}

export class AdvisoriesApi implements IAdvisoriesApi {
  async getAdvisories(params: ListParams = {}): Promise<ApiAdvisory[]> {
    return fetchAllPages<ApiAdvisory>('/advisories', {
      isActive: 'true',
      ...params,
    });
  }

  async getAdvisory(id: string): Promise<ApiAdvisory> {
    const response = await api.get<ApiAdvisory>(`/advisories/${id}`);
    return requireData(response.data);
  }
}

class MockAdvisoriesApi implements IAdvisoriesApi {
  private advisories: ApiAdvisory[] = demoAnnouncements
    .filter(item => item.type === 'advisory')
    .map(item => ({
      id: item.id,
      routeId: null,
      severity: 'INFO',
      title: item.title,
      message: item.message,
      isActive: true,
      startsAt: item.publishedAt,
      endsAt: null,
      createdAt: item.publishedAt,
      updatedAt: item.publishedAt,
    }));

  async getAdvisories(): Promise<ApiAdvisory[]> {
    return this.advisories;
  }

  async getAdvisory(id: string): Promise<ApiAdvisory> {
    return requireData(this.advisories.find(item => item.id === id));
  }
}

export const advisoriesApi: IAdvisoriesApi = environment.enableMockServices
  ? new MockAdvisoriesApi()
  : new AdvisoriesApi();
