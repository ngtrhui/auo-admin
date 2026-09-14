import { getSession } from 'next-auth/react';
import { useAuthUIStore } from '@/stores/auth-ui.store';
import { isSessionExpired } from '@/lib/session-state';

type RefreshQueueEntry = {
  resolve: (token: string | null) => void;
};

let isResolvingAccessToken = false;
let refreshQueue: RefreshQueueEntry[] = [];

/**
 * Resolve a fresh access token via NextAuth session (triggers JWT refresh when expired).
 * Returns null when the session cannot be refreshed — callers should force logout.
 */
export async function resolveFreshAccessToken(): Promise<string | null> {
  if (isSessionExpired()) {
    return null;
  }

  if (isResolvingAccessToken) {
    return new Promise<string | null>((resolve) => {
      refreshQueue.push({ resolve });
    });
  }

  isResolvingAccessToken = true;

  try {
    const session = await getSession();
    const newToken = session?.token?.accessToken ?? null;

    if (session?.error === 'RefreshAccessTokenError' || !newToken) {
      refreshQueue.forEach((entry) => entry.resolve(null));
      refreshQueue = [];
      return null;
    }

    useAuthUIStore.getState().setAccessToken(newToken);
    refreshQueue.forEach((entry) => entry.resolve(newToken));
    refreshQueue = [];
    return newToken;
  } catch {
    refreshQueue.forEach((entry) => entry.resolve(null));
    refreshQueue = [];
    return null;
  } finally {
    isResolvingAccessToken = false;
  }
}

export function resetAccessTokenRefreshState() {
  isResolvingAccessToken = false;
  refreshQueue = [];
}
