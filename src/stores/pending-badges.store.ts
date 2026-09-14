import { create } from 'zustand';
import {
  EMPTY_PENDING_BADGES,
  isAdminPendingBadges,
  normalizePendingBadges,
  type AdminPendingBadges,
  type AdminPendingCategory,
} from '@/types/pending-badges';

export type PendingListsRefreshTarget = AdminPendingCategory | 'all';

type PendingListsRefresh = {
  token: number;
  target: PendingListsRefreshTarget;
};

type PendingBadgesState = {
  badges: AdminPendingBadges;
  listsRefresh: PendingListsRefresh | null;
  setBadges: (badges: AdminPendingBadges) => void;
  applyBadgesFromPayload: (payload: unknown) => boolean;
  requestRelatedListsRefresh: (target: PendingListsRefreshTarget) => void;
  reset: () => void;
};

function resolveCategoryFromPayload(payload: unknown): AdminPendingCategory | null {
  const metadata =
    payload && typeof payload === 'object' && 'metadata' in payload
      ? (payload as { metadata?: unknown }).metadata
      : undefined;
  const category =
    metadata && typeof metadata === 'object' && 'category' in metadata
      ? (metadata as { category?: unknown }).category
      : undefined;

  if (
    category === 'job' ||
    category === 'company' ||
    category === 'deposit' ||
    category === 'order' ||
    category === 'support'
  ) {
    return category;
  }

  return null;
}

export const usePendingBadgesStore = create<PendingBadgesState>((set, get) => ({
  badges: EMPTY_PENDING_BADGES,
  listsRefresh: null,

  setBadges: (badges) => set({ badges: normalizePendingBadges(badges) }),

  applyBadgesFromPayload: (payload) => {
    const metadata =
      payload && typeof payload === 'object' && 'metadata' in payload
        ? (payload as { metadata?: unknown }).metadata
        : undefined;
    const rawBadges =
      metadata && typeof metadata === 'object' && 'badges' in metadata
        ? (metadata as { badges?: unknown }).badges
        : undefined;

    if (!isAdminPendingBadges(rawBadges)) return false;

    set({ badges: normalizePendingBadges(rawBadges) });
    return true;
  },

  requestRelatedListsRefresh: (target) =>
    set({
      listsRefresh: {
        token: (get().listsRefresh?.token ?? 0) + 1,
        target,
      },
    }),

  reset: () => set({ badges: EMPTY_PENDING_BADGES, listsRefresh: null }),
}));

export function getPendingCategoryFromPayload(payload: unknown): AdminPendingCategory | null {
  return resolveCategoryFromPayload(payload);
}
