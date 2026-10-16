'use client';

import {
  LIST_BASE_SEARCH_PARAMS,
  LIST_PAGINATION_SEARCH_PARAMS,
} from '@/constants/list-search-params';
import {
  useSearchListFilters,
  type UseSearchListFiltersOptions,
} from '@/hooks/list/useSearchListFilters';

export interface UseListQueryStateOptions {
  /** Include free-text `search` in URL state. Default true. */
  withSearch?: boolean;
  /** Debounce delay for search (ms). Default 500. */
  searchDebounceMs?: number;
  history?: UseSearchListFiltersOptions['history'];
}

/**
 * Convenience wrapper around `useSearchListFilters` for lists that use only
 * the shared `LIST_BASE_SEARCH_PARAMS` / `LIST_PAGINATION_SEARCH_PARAMS`.
 * Prefer `createUseSearchListFilters(DOMAIN_LIST_SEARCH_PARAMS)` when the
 * domain already has its own parser object.
 */
export function useListQueryState(options: UseListQueryStateOptions = {}) {
  const { withSearch = true, searchDebounceMs = 500, history = 'replace' } = options;

  return useSearchListFilters(
    withSearch ? LIST_BASE_SEARCH_PARAMS : LIST_PAGINATION_SEARCH_PARAMS,
    {
      debounceMs: searchDebounceMs,
      history,
      includeSearchInParams: withSearch,
    },
  );
}
