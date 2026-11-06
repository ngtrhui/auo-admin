import { showNotificationToast } from '@/components/ui/NotificationToast';
import { isWebPushApiAvailable, needsIosHomeScreenInstall } from '@/lib/web-push/environment';
import { claimNotificationToastSlot } from '@/lib/web-push/toast-dedupe';
import { useNotificationStore } from '@/stores/notification.store';
import type { NotificationReferenceType } from '@/types/notification';
import type {
  WebPushNotificationPayload,
  WebPushUiPermission,
} from '@/types/web-push-notification';

export function getInitialWebPushPermission(): WebPushUiPermission {
  if (typeof window === 'undefined') return 'unsupported';
  if (needsIosHomeScreenInstall()) return 'needs-install';
  if (!isWebPushApiAvailable()) return 'unsupported';
  return Notification.permission;
}

export function handleFocusedPush(payload: WebPushNotificationPayload) {
  if (!payload) return;

  if (payload.notificationId) {
    useNotificationStore.getState().addLiveNotification(payload.event || 'notification:new', {
      notificationId: payload.notificationId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      isRead: payload.isRead,
      createdAt: payload.createdAt,
      referenceId: payload.referenceId,
      referenceType: payload.referenceType as NotificationReferenceType | undefined,
      metadata: payload.metadata,
    });
  }

  const referenceId =
    payload.referenceId ??
    (typeof payload.metadata?.referenceId === 'string' ? payload.metadata.referenceId : '');

  if (
    claimNotificationToastSlot(
      payload.notificationId,
      [payload.type, payload.title, String(payload.createdAt), referenceId].join('|'),
    )
  ) {
    showNotificationToast(payload);
  }
}
