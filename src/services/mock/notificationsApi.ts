import type { AppNotification } from '../../types';
import { demoNotifications } from './data';

const wait = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export class MockNotificationsApi {
  private notifications: AppNotification[] = demoNotifications.map(item => ({
    ...item,
  }));

  async getNotifications(): Promise<AppNotification[]> {
    await wait(300);
    return this.notifications;
  }

  async getNotification(id: string): Promise<AppNotification> {
    await wait(150);
    const notification = this.notifications.find(item => item.id === id);
    if (!notification) {
      throw new Error('Notification not found.');
    }
    return notification;
  }

  async markRead(id: string): Promise<void> {
    await wait(150);
    this.notifications = this.notifications.map(item =>
      item.id === id ? { ...item, read: true } : item,
    );
  }

  async markAllRead(): Promise<void> {
    await wait(200);
    this.notifications = this.notifications.map(item => ({
      ...item,
      read: true,
    }));
  }
}
