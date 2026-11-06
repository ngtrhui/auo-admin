const RECENT_TOAST_TTL_MS = 8_000;

const recentToastIds = new Map<string, number>();

function pruneExpired(now: number) {
  for (const [id, expiresAt] of recentToastIds) {
    if (expiresAt <= now) recentToastIds.delete(id);
  }
}

export function claimNotificationToastSlot(
  notificationId?: string | null,
  fallbackKey?: string | null,
): boolean {
  const now = Date.now();
  pruneExpired(now);

  const keys = [notificationId, fallbackKey].filter(
    (key): key is string => typeof key === 'string' && key.length > 0,
  );
  if (keys.length === 0) return true;

  if (keys.some((key) => recentToastIds.has(key))) return false;

  for (const key of keys) {
    recentToastIds.set(key, now + RECENT_TOAST_TTL_MS);
  }
  return true;
}
