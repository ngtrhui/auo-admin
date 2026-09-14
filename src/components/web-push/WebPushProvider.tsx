// 'use client';

// import { useEffect, useRef } from 'react';
// import { canUseWebPushNow, isIosDevice } from '@/lib/web-push/environment';
// import { registerWebPush } from '@/lib/web-push/register';
// import { isSessionExpired } from '@/lib/session-state';
// import { useAuthUIStore } from '@/stores/auth-ui.store';
// import { handleFocusedPush } from '@/utils/web-push';

// type Props = {
//   children: React.ReactNode;
//   /**
//    * If true:
//    * - permission `granted` → silent re-subscribe
//    * - permission `default` → browser permission prompt after login (non-iOS only)
//    * Skipped on iOS Safari tabs; on iOS Home Screen PWA, permission must come from a user gesture.
//    */
//   autoSync?: boolean;
// };

// export function WebPushProvider({ children, autoSync = true }: Props) {
//   const accessToken = useAuthUIStore((state) => state.accessToken);
//   const promptedForDefaultRef = useRef(false);

//   useEffect(() => {
//     if (!accessToken || isSessionExpired() || !autoSync || !canUseWebPushNow()) return;

//     const permission = Notification.permission;

//     if (permission === 'denied') return;

//     // iOS requires a user gesture for the first permission ask (EnableNotificationsButton).
//     if (permission === 'default') {
//       if (isIosDevice() || promptedForDefaultRef.current) return;
//       promptedForDefaultRef.current = true;
//       void registerWebPush().catch(console.error);
//       return;
//     }

//     void registerWebPush().catch(console.error);
//   }, [accessToken, autoSync]);

//   useEffect(() => {
//     if (!('serviceWorker' in navigator)) return;

//     const onMessage = (event: MessageEvent) => {
//       if (event.data?.type === 'PUSH_RECEIVED_FOCUSED') {
//         handleFocusedPush(event.data.payload);
//       }
//       if (event.data?.type === 'NOTIFICATION_CLICK') {
//         // Optional: open inbox / navigate — SW already focuses + navigates
//       }
//     };

//     navigator.serviceWorker.addEventListener('message', onMessage);
//     return () => navigator.serviceWorker.removeEventListener('message', onMessage);
//   }, []);

//   return children;
// }
