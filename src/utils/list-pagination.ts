import type { Pagination } from '@/types/pagination';

/**
 * Prefer API pagination when the response included it; otherwise derive from
 * the current result length (legacy master-data often returned a full list).
 */
export function resolveListPagination(
  hasServerPagination: boolean,
  pagination: Pagination,
  resultLength: number,
  perPage: number,
): { totalPages: number; totalItems: number } {
  if (hasServerPagination) {
    return {
      totalPages: Math.max(1, pagination.totalPages || 1),
      totalItems: pagination.totalElements,
    };
  }

  return {
    totalPages: Math.max(1, Math.ceil(resultLength / perPage) || 1),
    totalItems: resultLength,
  };
}
