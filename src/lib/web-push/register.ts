import { fetchVapidPublicKey, savePushSubscription } from './api';
import { isWebPushApiAvailable } from './environment';
import type { WebPushPermissionResult } from '../../types/web-push-notification';
import { urlBase64ToUint8Array } from '../../utils/vapid';

const VAPID_PUBLIC_KEY_STORAGE = 'hrcv.webPush.vapidPublicKey';
/** Bump to force clients to drop revoked/stale push endpoints and re-subscribe. */
const WEB_PUSH_SUBSCRIPTION_EPOCH_KEY = 'hrcv.webPush.subscriptionEpoch';
const WEB_PUSH_SUBSCRIPTION_EPOCH = '4';

/**
 * Call only in the browser after the user is authenticated.
 * Prefer a user gesture (button) for Notification.requestPermission on first ask.
 * Auth + device headers come from axiosInstance.
 *
 * If the backend VAPID public key rotated, the existing PushSubscription is
 * unsubscribed and recreated — otherwise sendNotification can fail with 403
 * while subscribe still appears to succeed (stale endpoint saved to API).
 */
export async function registerWebPush(): Promise<WebPushPermissionResult> {
  if (!isWebPushApiAvailable()) return 'unsupported';

  const permission =
    Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();

  if (permission !== 'granted') return permission;

  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/',
    updateViaCache: 'none',
  });
  // Pull the latest SW (title/showNotification fixes) before (re)subscribing.
  try {
    await registration.update();
  } catch {
    // Non-fatal: continue with whatever worker is ready.
  }
  await navigator.serviceWorker.ready;

  const publicKey = await fetchVapidPublicKey();
  const applicationServerKey = urlBase64ToUint8Array(publicKey);
  const previousKey = localStorage.getItem(VAPID_PUBLIC_KEY_STORAGE);
  const vapidRotated = Boolean(previousKey && previousKey !== publicKey);
  const epochStale =
    localStorage.getItem(WEB_PUSH_SUBSCRIPTION_EPOCH_KEY) !== WEB_PUSH_SUBSCRIPTION_EPOCH;

  let subscription = await registration.pushManager.getSubscription();
  let createdNewSubscription = false;

  if (subscription && (vapidRotated || epochStale)) {
    await subscription.unsubscribe();
    subscription = null;
  }

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as BufferSource,
    });
    createdNewSubscription = true;
  }

  await savePushSubscription(subscription.toJSON());
  localStorage.setItem(VAPID_PUBLIC_KEY_STORAGE, publicKey);
  localStorage.setItem(WEB_PUSH_SUBSCRIPTION_EPOCH_KEY, WEB_PUSH_SUBSCRIPTION_EPOCH);

  // After forced re-subscribe, prove OS banners work (Badges can work while Banners are off).
  if (createdNewSubscription) {
    try {
      await registration.showNotification('HRCV Admin', {
        body: 'Thông báo đã được bật. Nếu bạn thấy banner này, push sẽ hiển thị tương tự.',
        tag: 'hrcv-push-enabled',
      });
    } catch (error) {
      console.error('[hrcv-push] confirmation notification failed', error);
    }
  }

  return 'granted';
}
