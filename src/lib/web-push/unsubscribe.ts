// import { removePushSubscription } from './api';

// export async function unregisterWebPush(): Promise<void> {
//   if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

//   const registration = await navigator.serviceWorker.getRegistration('/');
//   if (!registration?.pushManager) return;

//   const subscription = await registration.pushManager.getSubscription();
//   if (!subscription) return;

//   try {
//     await removePushSubscription(subscription.endpoint);
//   } finally {
//     await subscription.unsubscribe();
//   }
// }
