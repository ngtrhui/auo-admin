import { parseAsInteger, parseAsString } from 'nuqs';

import type { Pagination } from '@/types/pagination';

export const DEFAULT_LIST_PAGE = 1;
export const DEFAULT_LIST_PER_PAGE = 20;

export const EMPTY_LIST_PAGINATION: Pagination = {
  totalElements: 0,
  page: DEFAULT_LIST_PAGE,
  perPage: DEFAULT_LIST_PER_PAGE,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export const LIST_PAGINATION_SEARCH_PARAMS = {
  page: parseAsInteger.withDefault(DEFAULT_LIST_PAGE),
  perPage: parseAsInteger.withDefault(DEFAULT_LIST_PER_PAGE),
} as const;

/** Shared URL parsers for list pages that also have a free-text search. */
export const LIST_BASE_SEARCH_PARAMS = {
  ...LIST_PAGINATION_SEARCH_PARAMS,
  search: parseAsString.withDefault(''),
} as const;

export type SearchListParams = {
  page: number;
  perPage: number;
  search?: string;
};

/** Build `{ page, perPage, search? }` for list APIs. Omits empty search. */
export function buildSearchListParams(
  page: number,
  perPage: number,
  debouncedSearch = '',
): SearchListParams {
  const params: SearchListParams = { page, perPage };
  const search = debouncedSearch.trim();
  if (search) {
    params.search = search;
  }
  return params;
}
