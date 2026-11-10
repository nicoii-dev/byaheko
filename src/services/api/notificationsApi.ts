import { Notification } from "../../types";

export interface INotificationsApi {
  getNotifications(): Promise<Notification[]>;
  markRead(id: string): Promise<void>;
}

export class NotificationsApi implements INotificationsApi {
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get("/notifications");
    return response.data;
  }

  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`, {});
  }
}

export class MockNotificationsApi implements INotificationsApi {
  private notifications: Notification[] = [
    {
      id: "notif_1",
      title: "Route Advisory",
      message: "Jeepney route CDO-01 will have temporary detours this weekend.",
      type: "advisory",
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: "notif_2",
      title: "Service Update",
      message: "Modern jeepney service now available on Centrio - SM City route.",
      type: "update",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
    },
  ];

  async getNotifications(): Promise<Notification[]> {
    await new Promise<void>((resolve) => setTimeout(resolve, 400));
    return this.notifications;
  }

  async markRead(id: string): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }
}

import api from "./index";
export const notificationsApi: INotificationsApi = new MockNotificationsApi();