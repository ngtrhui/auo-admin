/**
 * Display / platform helpers for Web Push.
 * iOS Safari only exposes PushManager after Add to Home Screen (standalone).
 */

export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;

  const mediaStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone =
    'standalone' in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

  return mediaStandalone || iosStandalone;
}

export function isIosDevice(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent;
  const iPhoneOrIpod = /iPhone|iPod/i.test(ua);
  const iPad =
    /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  return iPhoneOrIpod || iPad;
}

/** True when PushManager + Notification APIs exist in this browsing context. */
export function isWebPushApiAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Safe to register / auto-sync push now.
 * On iOS, Web Push only works from an installed Home Screen PWA.
 */
export function canUseWebPushNow(): boolean {
  if (!isWebPushApiAvailable()) return false;
  if (isIosDevice() && !isStandaloneDisplay()) return false;
  return true;
}

/** iPhone/iPad Safari tab: needs Add to Home Screen before push works. */
export function needsIosHomeScreenInstall(): boolean {
  return isIosDevice() && !isStandaloneDisplay();
}
