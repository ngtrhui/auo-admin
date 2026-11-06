export type WebPushNotificationPayload = {
  notificationId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string | Date;
  event: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, unknown>;
  unreadCount?: number;
};

export type WebPushPermissionResult = 'granted' | 'denied' | 'unsupported' | 'default';

export type WebPushUiPermission = NotificationPermission | 'unsupported' | 'needs-install';

export type WebPushSwMessage =
  | { type: 'PUSH_RECEIVED_FOCUSED'; payload: WebPushNotificationPayload }
  | { type: 'NOTIFICATION_CLICK'; payload: WebPushNotificationPayload };
