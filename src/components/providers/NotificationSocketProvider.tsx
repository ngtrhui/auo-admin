// 'use client';

// import { useCallback, useEffect, useRef } from 'react';
// import type { Socket } from 'socket.io-client';
// import { resolveFreshAccessToken } from '@/lib/access-token';
// import { forceLogoutDueToExpiredSession } from '@/lib/axiosInstance';
// import {
//   bindNotificationSocket,
//   createNotificationSocket,
//   destroyNotificationSocket,
//   isSocketAuthError,
// } from '@/lib/notification-socket';
// import { isSessionExpired } from '@/lib/session-state';
// import { showNotificationToast } from '@/components/ui/NotificationToast';
// import { claimNotificationToastSlot } from '@/lib/web-push/toast-dedupe';
// import {
//   ADMIN_PENDING_CATEGORY_BY_EVENT,
//   isAdminPendingSocketEvent,
// } from '@/constants/notification-socket';
// import { pendingBadgesService } from '@/services/pending-badges.service';
// import { useAuthUIStore } from '@/stores/auth-ui.store';
// import { useNotificationStore } from '@/stores/notification.store';
// import {
//   getPendingCategoryFromPayload,
//   usePendingBadgesStore,
// } from '@/stores/pending-badges.store';
// import { useSoundStore } from '@/stores/sound.store';

// const AUTH_RECOVERY_MAX_ATTEMPTS = 3;
// const AUTH_RECOVERY_WINDOW_MS = 30_000;

// async function refetchPendingBadgesFromServer() {
//   try {
//     const response = await pendingBadgesService.getPendingBadges();
//     if (response.result) {
//       usePendingBadgesStore.getState().setBadges(response.result);
//     }
//   } catch {
//     // Keep last known counts if the fallback fetch fails.
//   }
// }

// function refreshListsForPendingEvent(event: string, payload: unknown) {
//   const fromPayload = getPendingCategoryFromPayload(payload);
//   const fromEvent = isAdminPendingSocketEvent(event)
//     ? ADMIN_PENDING_CATEGORY_BY_EVENT[event]
//     : null;

//   usePendingBadgesStore.getState().requestRelatedListsRefresh(fromPayload ?? fromEvent ?? 'all');
// }

// export function NotificationSocketProvider({ children }: { children: React.ReactNode }) {
//   const accessToken = useAuthUIStore((state) => state.accessToken);
//   const socketRef = useRef<Socket | null>(null);
//   const tokenRef = useRef<string | null>(null);
//   const authRecoveryAttemptsRef = useRef(0);
//   const authRecoveryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const isRecoveringAuthRef = useRef(false);
//   const handleAuthFailureRef = useRef<() => Promise<void>>(async () => undefined);

//   const resetAuthRecoveryAttempts = useCallback(() => {
//     authRecoveryAttemptsRef.current = 0;
//     if (authRecoveryTimerRef.current) {
//       clearTimeout(authRecoveryTimerRef.current);
//       authRecoveryTimerRef.current = null;
//     }
//   }, []);

//   const teardownSocket = useCallback(() => {
//     destroyNotificationSocket(socketRef.current);
//     socketRef.current = null;
//     tokenRef.current = null;
//   }, []);

//   const connectWithToken = useCallback(
//     (token: string) => {
//       if (isSessionExpired() || !token) return;

//       teardownSocket();

//       const socket = createNotificationSocket(token);

//       bindNotificationSocket(socket, {
//         onUnreadCount: (count) => {
//           resetAuthRecoveryAttempts();
//           useNotificationStore.getState().setUnreadCount(count);
//         },
//         onNotification: (event, payload) => {
//           useNotificationStore.getState().addLiveNotification(event, payload);
//           const referenceId =
//             payload.referenceId ??
//             (typeof payload.metadata?.referenceId === 'string' ? payload.metadata.referenceId : '');
//           const toastKey = [
//             payload.type,
//             payload.title,
//             String(payload.createdAt),
//             referenceId,
//           ].join('|');
//           if (claimNotificationToastSlot(payload.notificationId, toastKey)) {
//             showNotificationToast(payload);
//             useSoundStore.getState().play('notification');
//           }
//         },
//         onAdminPending: (event, payload) => {
//           const applied = usePendingBadgesStore.getState().applyBadgesFromPayload(payload);
//           if (!applied) {
//             void refetchPendingBadgesFromServer();
//           }
//           refreshListsForPendingEvent(event, payload);
//         },
//         onReconnect: () => {
//           void refetchPendingBadgesFromServer();
//           usePendingBadgesStore.getState().requestRelatedListsRefresh('all');
//         },
//         onException: () => {
//           void handleAuthFailureRef.current();
//         },
//         onConnectError: (err) => {
//           if (isSocketAuthError(err)) {
//             void handleAuthFailureRef.current();
//           }
//         },
//         onServerDisconnect: () => {
//           void handleAuthFailureRef.current();
//         },
//       });

//       socketRef.current = socket;
//       tokenRef.current = token;
//     },
//     [resetAuthRecoveryAttempts, teardownSocket],
//   );

//   const handleAuthFailure = useCallback(async () => {
//     if (isSessionExpired() || isRecoveringAuthRef.current) return;

//     authRecoveryAttemptsRef.current += 1;
//     if (authRecoveryAttemptsRef.current > AUTH_RECOVERY_MAX_ATTEMPTS) {
//       teardownSocket();
//       useNotificationStore.getState().reset();
//       usePendingBadgesStore.getState().reset();
//       await forceLogoutDueToExpiredSession();
//       return;
//     }

//     if (!authRecoveryTimerRef.current) {
//       authRecoveryTimerRef.current = setTimeout(() => {
//         resetAuthRecoveryAttempts();
//       }, AUTH_RECOVERY_WINDOW_MS);
//     }

//     isRecoveringAuthRef.current = true;
//     teardownSocket();

//     try {
//       const newToken = await resolveFreshAccessToken();

//       if (!newToken || isSessionExpired() || !useAuthUIStore.getState().accessToken) {
//         useNotificationStore.getState().reset();
//         usePendingBadgesStore.getState().reset();
//         await forceLogoutDueToExpiredSession();
//         return;
//       }

//       connectWithToken(newToken);
//     } finally {
//       isRecoveringAuthRef.current = false;
//     }
//   }, [connectWithToken, resetAuthRecoveryAttempts, teardownSocket]);

//   useEffect(() => {
//     handleAuthFailureRef.current = handleAuthFailure;
//   }, [handleAuthFailure]);

//   useEffect(() => {
//     if (isRecoveringAuthRef.current) return;

//     if (!accessToken || isSessionExpired()) {
//       teardownSocket();
//       useNotificationStore.getState().reset();
//       usePendingBadgesStore.getState().reset();
//       resetAuthRecoveryAttempts();
//       return;
//     }

//     if (socketRef.current?.connected && tokenRef.current === accessToken) {
//       return;
//     }

//     connectWithToken(accessToken);
//   }, [accessToken, connectWithToken, resetAuthRecoveryAttempts, teardownSocket]);

//   useEffect(() => {
//     return () => {
//       teardownSocket();
//       resetAuthRecoveryAttempts();
//     };
//   }, [resetAuthRecoveryAttempts, teardownSocket]);

//   return children;
// }
