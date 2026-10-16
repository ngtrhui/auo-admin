'use client';

import { useMemo } from 'react';

export interface ClientPaginationResult<T> {
  pageItems: T[];
  totalItems: number;
  totalPages: number;
}

/**
 * Client-side slice for APIs that return full lists.
 */
export function useClientPagination<T>(
  items: T[],
  page: number,
  perPage: number,
): ClientPaginationResult<T> {
  return useMemo(() => {
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage) || 1);
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * perPage;
    return {
      pageItems: items.slice(start, start + perPage),
      totalItems,
      totalPages,
    };
  }, [items, page, perPage]);
}
