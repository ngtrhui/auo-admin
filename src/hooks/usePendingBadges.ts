'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { pendingBadgesService } from '@/services/pending-badges.service';
import { useAuthUIStore } from '@/stores/auth-ui.store';
import {
  usePendingBadgesStore,
  type PendingListsRefreshTarget,
} from '@/stores/pending-badges.store';
import { isSessionExpired } from '@/lib/session-state';
import type { AdminPendingBadges, AdminPendingCategory } from '@/types/pending-badges';

export const PENDING_BADGES_QUERY_KEY = 'pending-badges';

/** Prefix keys — invalidateQueries matches all nested list/detail/tab caches. */
const PENDING_CATEGORY_QUERY_KEYS: Record<AdminPendingCategory, readonly string[]> = {
  job: ['jobs'],
  company: ['companies'],
  deposit: ['deposits'],
  order: ['package-orders'],
  support: ['support'],
};

export function invalidatePendingBadges(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: [PENDING_BADGES_QUERY_KEY] });
}

export function invalidatePendingRelatedLists(
  queryClient: QueryClient,
  target: PendingListsRefreshTarget,
) {
  const categories: AdminPendingCategory[] =
    target === 'all'
      ? (Object.keys(PENDING_CATEGORY_QUERY_KEYS) as AdminPendingCategory[])
      : [target];

  for (const category of categories) {
    void queryClient.invalidateQueries({
      queryKey: PENDING_CATEGORY_QUERY_KEYS[category],
    });
  }
}

export function usePendingBadges() {
  const queryClient = useQueryClient();
  const accessToken = useAuthUIStore((state) => state.accessToken);
  const badges = usePendingBadgesStore((state) => state.badges);
  const listsRefresh = usePendingBadgesStore((state) => state.listsRefresh);
  const setBadges = usePendingBadgesStore((state) => state.setBadges);
  const canFetch = !!accessToken && !isSessionExpired();

  const query = useQuery({
    queryKey: [PENDING_BADGES_QUERY_KEY],
    queryFn: () => pendingBadgesService.getPendingBadges(),
    enabled: canFetch,
  });

  useEffect(() => {
    const result = query.data?.result;
    if (!result) return;
    setBadges(result);
  }, [query.data?.result, setBadges]);

  useEffect(() => {
    if (canFetch) return;
    usePendingBadgesStore.getState().reset();
  }, [canFetch]);

  useEffect(() => {
    if (!listsRefresh || !canFetch) return;
    invalidatePendingRelatedLists(queryClient, listsRefresh.target);
  }, [listsRefresh, canFetch, queryClient]);

  return {
    badges,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}

export function getBadgeCount(
  badges: AdminPendingBadges,
  key: AdminPendingCategory | AdminPendingCategory[],
): number {
  if (Array.isArray(key)) {
    return key.reduce((sum, item) => sum + (badges[item] ?? 0), 0);
  }
  return badges[key] ?? 0;
}

export function formatBadgeLabel(count: number): string | null {
  if (count <= 0) return null;
  return count > 99 ? '99+' : String(count);
}
