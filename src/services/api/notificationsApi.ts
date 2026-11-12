import type { AppNotification } from '../../types';
import { environment } from '../../config/environment';
import api from './client';
import { MockNotificationsApi } from '../mock/notificationsApi';

export interface INotificationsApi {
  getNotifications(): Promise<AppNotification[]>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
}

export class NotificationsApi implements INotificationsApi {
  async getNotifications(): Promise<AppNotification[]> {
    const response = await api.get<AppNotification[]>('/notifications');
    return response.data;
  }

  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`, {});
  }

  async markAllRead(): Promise<void> {
    await api.patch('/notifications/read-all', {});
  }
}

export const notificationsApi: INotificationsApi =
  environment.enableMockServices
    ? new MockNotificationsApi()
    : new NotificationsApi();
