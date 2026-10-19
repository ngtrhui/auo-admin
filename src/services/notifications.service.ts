import axiosInstance from '@/lib/axiosInstance';
import { API_CONFIG } from '@/config/api-config';
import { SuccessResponse } from '@/types/api';
import {
  DeleteNotificationResult,
  ListNotificationsRequest,
  MarkAllReadResult,
  MarkReadRequest,
  NotificationItem,
  UnreadCountResult,
} from '@/types/notification';

export const notificationsService = {
  getList: async (
    params?: ListNotificationsRequest,
  ): Promise<SuccessResponse<NotificationItem[]>> => {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST, {
      params: params ?? {},
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<SuccessResponse<UnreadCountResult>> => {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return response.data;
  },

  markRead: async (
    id: string,
    data: MarkReadRequest,
  ): Promise<SuccessResponse<NotificationItem>> => {
    const response = await axiosInstance.patch(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(id),
      data,
    );
    return response.data;
  },

  markAllRead: async (data: MarkReadRequest): Promise<SuccessResponse<MarkAllReadResult>> => {
    const response = await axiosInstance.patch(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
      data,
    );
    return response.data;
  },

  deleteNotification: async (id: string): Promise<SuccessResponse<DeleteNotificationResult>> => {
    const response = await axiosInstance.delete(API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE(id));
    return response.data;
  },

  getVapidPublicKey: async (): Promise<SuccessResponse<{ publicKey: string }>> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS.PUSH_VAPID_PUBLIC_KEY,
    );
    return response.data;
  },

  subscribePush: async (subscription: PushSubscriptionJSON): Promise<SuccessResponse<unknown>> => {
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.NOTIFICATIONS.PUSH_SUBSCRIBE, {
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime ?? null,
      keys: {
        p256dh: subscription.keys?.p256dh,
        auth: subscription.keys?.auth,
      },
    });
    return response.data;
  },

  unsubscribePush: async (endpoint: string): Promise<SuccessResponse<unknown>> => {
    const response = await axiosInstance.delete(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS.PUSH_UNSUBSCRIBE,
      { data: { endpoint } },
    );
    return response.data;
  },
};
