import type { WebPushPermissionResult } from '@/types/web-push-notification';

export const WEB_PUSH_STATUS_HINT: Record<WebPushPermissionResult, string> = {
  granted: 'Đã bật thông báo trình duyệt',
  denied: 'Trình duyệt đã chặn thông báo',
  unsupported: 'Trình duyệt không hỗ trợ web push',
  default: 'Chưa cấp quyền thông báo',
};
