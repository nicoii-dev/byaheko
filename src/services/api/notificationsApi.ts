import type { AppNotification, NotificationType } from '../../types';
import { environment } from '../../config/environment';
import api from './client';
import { requireData } from '../../utils/apiData';
import { fetchAllPages } from './pagination';
import { MockNotificationsApi } from '../mock/notificationsApi';
import type { ApiNotification, ListParams } from './types';

export interface INotificationsApi {
  getNotifications(params?: ListParams): Promise<AppNotification[]>;
  getNotification(id: string): Promise<AppNotification>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
}

const NOTIFICATION_TYPES: Record<string, NotificationType> = {
  advisory: 'advisory',
  announcement: 'announcement',
  update: 'update',
  saved_route: 'saved_route',
};

const mapType = (type: string | null): NotificationType => {
  if (!type) {
    return 'update';
  }
  return NOTIFICATION_TYPES[type.toLowerCase()] ?? 'update';
};

const mapNotification = (row: ApiNotification): AppNotification => ({
  id: row.id,
  title: row.title,
  message: row.body,
  type: mapType(row.type),
  timestamp: row.createdAt,
  read: row.isRead,
});

export class NotificationsApi implements INotificationsApi {
  async getNotifications(params: ListParams = {}): Promise<AppNotification[]> {
    const rows = await fetchAllPages<ApiNotification>('/notifications', params);
    return rows.map(mapNotification);
  }

  async getNotification(id: string): Promise<AppNotification> {
    const response = await api.get<ApiNotification>(`/notifications/${id}`);
    return mapNotification(requireData(response.data));
  }

  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}`, { isRead: true });
  }

  async markAllRead(): Promise<void> {
    const rows = await fetchAllPages<ApiNotification>('/notifications', {
      isRead: 'false',
    });
    const unread = rows.filter(row => !row.isRead);
    await Promise.all(
      unread.map(row =>
        api.patch(`/notifications/${row.id}`, { isRead: true }),
      ),
    );
  }
}

export const notificationsApi: INotificationsApi =
  environment.enableMockServices
    ? new MockNotificationsApi()
    : new NotificationsApi();
