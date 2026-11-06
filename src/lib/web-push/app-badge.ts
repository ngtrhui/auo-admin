const BADGE_CACHE = 'hrcv-app-badge-v1';
const BADGE_URL = '/__hrcv_unread_count';

type NavigatorWithBadge = Navigator & {
  setAppBadge?: (contents?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

export function isAppBadgeSupported(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as NavigatorWithBadge;
  return typeof nav.setAppBadge === 'function';
}

export async function writeStoredUnreadCount(count: number): Promise<void> {
  if (typeof caches === 'undefined') return;
  try {
    const cache = await caches.open(BADGE_CACHE);
    await cache.put(
      BADGE_URL,
      new Response(String(Math.max(0, Math.floor(count))), {
        headers: { 'Content-Type': 'text/plain' },
      }),
    );
  } catch {
    // Non-fatal: badge still updates in the focused window path.
  }
}

export async function readStoredUnreadCount(): Promise<number | null> {
  if (typeof caches === 'undefined') return null;
  try {
    const cache = await caches.open(BADGE_CACHE);
    const response = await cache.match(BADGE_URL);
    if (!response) return null;
    const text = (await response.text()).trim();
    const value = Number(text);
    return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : null;
  } catch {
    return null;
  }
}

export async function syncAppBadge(count: number): Promise<void> {
  const safe = Math.max(0, Math.floor(count));
  await writeStoredUnreadCount(safe);

  if (!isAppBadgeSupported()) return;
  const nav = navigator as NavigatorWithBadge;

  try {
    if (safe > 0) {
      await nav.setAppBadge?.(safe);
    } else {
      await nav.clearAppBadge?.();
    }
  } catch (error) {
    console.error('[hrcv-badge] syncAppBadge failed', error);
  }
}

export async function clearAppBadge(): Promise<void> {
  await writeStoredUnreadCount(0);
  if (!isAppBadgeSupported()) return;
  try {
    await (navigator as NavigatorWithBadge).clearAppBadge?.();
  } catch (error) {
    console.error('[hrcv-badge] clearAppBadge failed', error);
  }
}
