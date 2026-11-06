import { useEffect, useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';
import { useAuthUIStore } from '@/stores/auth-ui.store';
import { useNotificationStore } from '@/stores/notification.store';
import type { ListNotificationsRequest, NotificationItem } from '@/types/notification';
import { getErrorMessage } from '@/utils/helper';
import { showToast } from '@/components/ui/Toaster';
import { isSessionExpired } from '@/lib/session-state';

const NOTIFICATIONS_QUERY_KEY = 'notifications';
export const UNREAD_COUNT_QUERY_KEY = 'notifications-unread-count';

const DEFAULT_PER_PAGE = 10;

function mergeNotifications(
  live: NotificationItem[],
  fromApi: NotificationItem[],
): NotificationItem[] {
  const byId = new Map<string, NotificationItem>();

  for (const item of fromApi) {
    byId.set(item.id, item);
  }
  for (const item of live) {
    if (byId.has(item.id)) continue;
    byId.set(item.id, item);
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function dedupeById(items: NotificationItem[]): NotificationItem[] {
  const byId = new Map<string, NotificationItem>();
  for (const item of items) {
    if (!byId.has(item.id)) byId.set(item.id, item);
  }
  return Array.from(byId.values());
}

function invalidateNotificationQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
  void queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
}

export function useNotifications(
  params?: Pick<ListNotificationsRequest, 'perPage'> & { enabled?: boolean },
) {
  const queryClient = useQueryClient();
  const accessToken = useAuthUIStore((state) => state.accessToken);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const liveNotifications = useNotificationStore((state) => state.liveNotifications);
  const listRefreshToken = useNotificationStore((state) => state.listRefreshToken);
  const patchLiveNotification = useNotificationStore((state) => state.patchLiveNotification);
  const markAllLiveAsRead = useNotificationStore((state) => state.markAllLiveAsRead);
  const pruneLiveInApi = useNotificationStore((state) => state.pruneLiveInApi);

  const perPage = params?.perPage ?? DEFAULT_PER_PAGE;
  const canFetch = !!accessToken && !isSessionExpired();
  const listEnabled = canFetch && (params?.enabled ?? true);

  const query = useInfiniteQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, 'infinite', perPage],
    queryFn: ({ pageParam }) =>
      notificationsService.getList({
        page: pageParam,
        perPage,
      }),
    enabled: listEnabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNextPage ? (lastPage.pagination.page ?? 1) + 1 : undefined,
  });

  const unreadCountQuery = useQuery({
    queryKey: [UNREAD_COUNT_QUERY_KEY],
    queryFn: () => notificationsService.getUnreadCount(),
    enabled: canFetch,
  });

  const apiNotifications = useMemo(
    () => dedupeById(query.data?.pages.flatMap((page) => page.result ?? []) ?? []),
    [query.data],
  );
  const apiUnreadCount = unreadCountQuery.data?.result?.count;

  useEffect(() => {
    if (!listRefreshToken || !listEnabled) return;
    invalidateNotificationQueries(queryClient);
  }, [listRefreshToken, listEnabled, queryClient]);

  useEffect(() => {
    if (typeof apiUnreadCount !== 'number') return;
    setUnreadCount(apiUnreadCount);
  }, [apiUnreadCount, setUnreadCount]);

  useEffect(() => {
    if (!apiNotifications.length) return;
    pruneLiveInApi(apiNotifications);
  }, [apiNotifications, pruneLiveInApi]);

  const notifications = useMemo(
    () => mergeNotifications(liveNotifications, apiNotifications),
    [liveNotifications, apiNotifications],
  );

  const markRead = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      notificationsService.markRead(id, { isRead }),
    onMutate: ({ id, isRead }) => {
      patchLiveNotification(id, {
        isRead,
        readAt: isRead ? new Date().toISOString() : null,
      });
    },
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
    onError: (error: unknown) => {
      invalidateNotificationQueries(queryClient);
      showToast('error', getErrorMessage(error, 'Cập nhật trạng thái thông báo thất bại'));
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsService.markAllRead({ isRead: true }),
    onMutate: () => {
      markAllLiveAsRead();
    },
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
    onError: (error: unknown) => {
      invalidateNotificationQueries(queryClient);
      showToast('error', getErrorMessage(error, 'Đánh dấu tất cả đã đọc thất bại'));
    },
  });

  const deleteNotification = useMutation({
    mutationFn: (id: string) => notificationsService.deleteNotification(id),
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
    onError: (error: unknown) => {
      showToast('error', getErrorMessage(error, 'Xóa thông báo thất bại'));
    },
  });

  const lastPage = query.data?.pages.at(-1);
  const pagination = lastPage?.pagination ?? {
    totalElements: 0,
    page: 1,
    perPage,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  return {
    notifications,
    unreadCount,
    pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    markRead,
    markAllRead,
    deleteNotification,
    isMarkingRead: markRead.isPending,
    isMarkingAllRead: markAllRead.isPending,
  };
}
