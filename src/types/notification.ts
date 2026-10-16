
export type NotificationType =
  // Đơn hàng
  | 'ORDER_CREATED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_PROCESSING'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'ORDER_COMPLETED'
  | 'ORDER_CANCELLED'
  | 'ORDER_STATUS_CHANGED'

  // Thanh toán
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REFUNDED'
  | 'PAYMENT_PENDING'

  // Khuyến mãi và sản phẩm
  | 'PROMOTION'
  | 'PRODUCT_BACK_IN_STOCK'
  | 'PRICE_DROP'

  // Tài khoản khách hàng
  | 'ACCOUNT_SECURITY'
  | 'ACCOUNT_UPDATE'

  // Hệ thống
  | 'SYSTEM_ANNOUNCEMENT';

export type NotificationReferenceType =
  | 'ORDER'
  | 'PRODUCT'
  | 'PAYMENT'
  | 'PROMOTION';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  referenceId?: string;
  referenceType?: NotificationReferenceType;
  metadata?: Record<string, unknown>;
}

export interface ListNotificationsRequest {
  page?: number;
  perPage?: number;
}

export interface MarkReadRequest {
  isRead: boolean;
}

export interface UnreadCountResult {
  count: number;
}

export interface MarkAllReadResult {
  modifiedCount: number;
}

export interface DeleteNotificationResult {
  success: boolean;
}

export type SocketNotificationPayload = {
  notificationId?: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string | Date;
  referenceId?: string;
  referenceType?: NotificationReferenceType;
  metadata?: Record<string, unknown>;
};

export type SocketExceptionPayload = {
  status: 'error';
  event: 'error_acknowledged';
  message: string | string[];
  timestamp: string;
};
