export type AdminPendingBadges = {
  job: number;
  company: number;
  deposit: number;
  order: number;
  support: number;
  total: number;
};

export type AdminPendingCategory = keyof Omit<AdminPendingBadges, 'total'>;

export type AdminPendingSocketPayload = {
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  metadata: {
    category: AdminPendingCategory;
    referenceId?: string;
    referenceType?: 'JOB' | 'COMPANY' | 'PAYMENT_TXN' | 'ORDER' | 'SUPPORT';
    badges: AdminPendingBadges;
    [key: string]: unknown;
  };
};

export const EMPTY_PENDING_BADGES: AdminPendingBadges = {
  job: 0,
  company: 0,
  deposit: 0,
  order: 0,
  support: 0,
  total: 0,
};

export function isAdminPendingBadges(value: unknown): value is AdminPendingBadges {
  if (!value || typeof value !== 'object') return false;
  const badges = value as Record<string, unknown>;
  return (
    typeof badges.job === 'number' &&
    typeof badges.company === 'number' &&
    typeof badges.deposit === 'number' &&
    typeof badges.order === 'number' &&
    typeof badges.support === 'number'
  );
}

export function normalizePendingBadges(badges: AdminPendingBadges): AdminPendingBadges {
  return {
    job: badges.job,
    company: badges.company,
    deposit: badges.deposit,
    order: badges.order,
    support: badges.support,
    total:
      typeof badges.total === 'number'
        ? badges.total
        : badges.job + badges.company + badges.deposit + badges.order + badges.support,
  };
}
