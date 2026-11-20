import { environment } from '../../config/environment';
import api from './client';
import { requireData } from '../../utils/apiData';
import { fetchAllPages } from './pagination';
import { demoAnnouncements } from '../mock/data';
import type { ApiAnnouncement, ListParams } from './types';

export interface IAnnouncementsApi {
  getAnnouncements(params?: ListParams): Promise<ApiAnnouncement[]>;
  getAnnouncement(id: string): Promise<ApiAnnouncement>;
}

export class AnnouncementsApi implements IAnnouncementsApi {
  async getAnnouncements(params: ListParams = {}): Promise<ApiAnnouncement[]> {
    return fetchAllPages<ApiAnnouncement>('/announcements', {
      isPublished: 'true',
      ...params,
    });
  }

  async getAnnouncement(id: string): Promise<ApiAnnouncement> {
    const response = await api.get<ApiAnnouncement>(`/announcements/${id}`);
    return requireData(response.data);
  }
}

class MockAnnouncementsApi implements IAnnouncementsApi {
  private announcements: ApiAnnouncement[] = demoAnnouncements
    .filter(item => item.type === 'announcement')
    .map(item => ({
      id: item.id,
      title: item.title,
      body: item.message,
      authorId: null,
      isPublished: true,
      publishedAt: item.publishedAt,
      createdAt: item.publishedAt,
      updatedAt: item.publishedAt,
    }));

  async getAnnouncements(): Promise<ApiAnnouncement[]> {
    return this.announcements;
  }

  async getAnnouncement(id: string): Promise<ApiAnnouncement> {
    return requireData(this.announcements.find(item => item.id === id));
  }
}

export const announcementsApi: IAnnouncementsApi =
  environment.enableMockServices
    ? new MockAnnouncementsApi()
    : new AnnouncementsApi();
