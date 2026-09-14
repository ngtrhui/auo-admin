// 'use client';

// import { useEffect, useRef } from 'react';
// import { useQueryClient } from '@tanstack/react-query';
// import { UNREAD_COUNT_QUERY_KEY } from '@/hooks/useNotifications';
// import { clearAppBadge, syncAppBadge } from '@/lib/web-push/app-badge';
// import { isSessionExpired } from '@/lib/session-state';
// import { notificationsService } from '@/services/notifications.service';
// import { useAuthUIStore } from '@/stores/auth-ui.store';
// import { useNotificationStore } from '@/stores/notification.store';

// /**
//  * Keeps the PWA Home Screen / dock badge in sync with notification unread count.
//  *
//  * - Focused: mirror zustand unreadCount (socket + UI mutations)
//  * - Focus / visible again: refetch `/notifications/unread-count` then apply badge
//  * - Unfocused: service worker updates badge optimistically; this corrects on focus
//  */
// export function AppBadgeSync() {
//   const queryClient = useQueryClient();
//   const accessToken = useAuthUIStore((state) => state.accessToken);
//   const unreadCount = useNotificationStore((state) => state.unreadCount);
//   const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
//   const refetchingRef = useRef(false);

//   // Mirror live unread count → OS badge while the app is open.
//   useEffect(() => {
//     if (!accessToken || isSessionExpired()) {
//       void clearAppBadge();
//       return;
//     }
//     void syncAppBadge(unreadCount);
//   }, [accessToken, unreadCount]);

//   // On focus / become visible: refetch API for the authoritative unread count.
//   useEffect(() => {
//     if (!accessToken || isSessionExpired()) {
//       void clearAppBadge();
//       return;
//     }

//     const refetchUnreadAndBadge = async () => {
//       if (refetchingRef.current || isSessionExpired()) return;
//       refetchingRef.current = true;
//       try {
//         const response = await notificationsService.getUnreadCount();
//         const count = response.result?.count;
//         if (typeof count !== 'number') return;

//         setUnreadCount(count);
//         queryClient.setQueryData([UNREAD_COUNT_QUERY_KEY], response);
//         await syncAppBadge(count);
//       } catch (error) {
//         console.error('[hrcv-badge] unread refetch failed', error);
//       } finally {
//         refetchingRef.current = false;
//       }
//     };

//     const onFocus = () => {
//       void refetchUnreadAndBadge();
//     };

//     const onVisibilityChange = () => {
//       if (document.visibilityState === 'visible') {
//         void refetchUnreadAndBadge();
//       }
//     };

//     void refetchUnreadAndBadge();

//     window.addEventListener('focus', onFocus);
//     document.addEventListener('visibilitychange', onVisibilityChange);

//     return () => {
//       window.removeEventListener('focus', onFocus);
//       document.removeEventListener('visibilitychange', onVisibilityChange);
//     };
//   }, [accessToken, queryClient, setUnreadCount]);

//   return null;
// }
