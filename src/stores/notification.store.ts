import { create } from 'zustand';
import type { NotificationItem, SocketNotificationPayload } from '@/types/notification';

const PROVISIONAL_ID_PREFIX = 'live:';

export function isProvisionalNotificationId(id: string): boolean {
  return id.startsWith(PROVISIONAL_ID_PREFIX);
}

function resolveReferenceId(payload: SocketNotificationPayload): string | undefined {
  if (payload.referenceId) return payload.referenceId;
  const fromMeta = payload.metadata?.referenceId;
  return typeof fromMeta === 'string' ? fromMeta : undefined;
}

function resolveCreatedAt(payload: SocketNotificationPayload): string {
  return payload.createdAt instanceof Date
    ? payload.createdAt.toISOString()
    : String(payload.createdAt);
}

function resolveNotificationId(payload: SocketNotificationPayload): string {
  if (payload.notificationId) return payload.notificationId;

  const referenceId = resolveReferenceId(payload) ?? '';
  return `${PROVISIONAL_ID_PREFIX}${payload.type}:${referenceId}:${resolveCreatedAt(payload)}`;
}

export function notificationFingerprint(
  item: Pick<NotificationItem, 'type' | 'createdAt' | 'title' | 'referenceId'>,
): string {
  // Prefer reference id alone so socket provisional rows match API rows even if `type` differs.
  if (item.referenceId) {
    return `ref:${item.referenceId}`;
  }
  return `${item.type}|${item.createdAt}|${item.title}`;
}

function socketPayloadToItem(_event: string, payload: SocketNotificationPayload): NotificationItem {
  return {
    id: resolveNotificationId(payload),
    type: payload.type as NotificationItem['type'],
    title: payload.title,
    body: payload.body,
    isRead: payload.isRead,
    readAt: null,
    createdAt: resolveCreatedAt(payload),
    referenceId: resolveReferenceId(payload),
    referenceType: payload.referenceType,
    metadata: payload.metadata,
  };
}

type NotificationState = {
  unreadCount: number;
  liveNotifications: NotificationItem[];
  /** Bumped to ask list hooks (inside QueryProvider) to refetch from API. */
  listRefreshToken: number;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  requestListRefresh: () => void;
  addLiveNotification: (event: string, payload: SocketNotificationPayload) => void;
  patchLiveNotification: (
    id: string,
    patch: Partial<Pick<NotificationItem, 'isRead' | 'readAt'>>,
  ) => void;
  markAllLiveAsRead: () => void;
  pruneLiveInApi: (apiItems: NotificationItem[]) => void;
  reset: () => void;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,
  liveNotifications: [],
  listRefreshToken: 0,

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnreadCount: () => set({ unreadCount: get().unreadCount + 1 }),

  requestListRefresh: () => set({ listRefreshToken: get().listRefreshToken + 1 }),

  addLiveNotification: (event, payload) => {
    const item = socketPayloadToItem(event, payload);
    const fingerprint = notificationFingerprint(item);
    const exists = get().liveNotifications.some(
      (n) => n.id === item.id || notificationFingerprint(n) === fingerprint,
    );
    if (exists) return;

    set((state) => ({
      liveNotifications: [item, ...state.liveNotifications],
    }));

    if (payload.isRead === false) {
      get().incrementUnreadCount();
    }

    // Provisional items need an API refetch to pick up the real notification id.
    if (isProvisionalNotificationId(item.id)) {
      get().requestListRefresh();
    }
  },

  patchLiveNotification: (id, patch) => {
    set((state) => ({
      liveNotifications: state.liveNotifications.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
  },

  markAllLiveAsRead: () => {
    set((state) => ({
      liveNotifications: state.liveNotifications.map((item) => ({
        ...item,
        isRead: true,
        readAt: item.readAt ?? new Date().toISOString(),
      })),
    }));
  },

  pruneLiveInApi: (apiItems) => {
    const apiIds = new Set(apiItems.map((item) => item.id));
    const apiFingerprints = new Set(apiItems.map(notificationFingerprint));

    set((state) => ({
      liveNotifications: state.liveNotifications.filter((item) => {
        if (apiIds.has(item.id)) return false;
        if (apiFingerprints.has(notificationFingerprint(item))) return false;
        return true;
      }),
    }));
  },

  reset: () => set({ unreadCount: 0, liveNotifications: [], listRefreshToken: 0 }),
}));
