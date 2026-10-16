'use client';

import { useQueryStates } from 'nuqs';
import { useCallback, useMemo } from 'react';

import { buildSearchListParams, type SearchListParams } from '@/constants/list-search-params';
import { useDebounce } from '@/hooks/useDebounce';

export interface UseSearchListFiltersOptions {
  /** Debounce delay for free-text search (ms). Default 500. */
  debounceMs?: number;
  history?: 'replace' | 'push';
  /**
   * When true (default), include trimmed search in `listParams`.
   * Set false when search is client-side only (e.g. support tickets).
   */
  includeSearchInParams?: boolean;
}

export type SearchListFilters<TExtra extends Record<string, string> = Record<never, never>> = {
  page: number;
  perPage: number;
  search: string;
} & TExtra;

type SetSearchListFilters<TExtra extends Record<string, string> = Record<never, never>> = (
  values: Partial<SearchListFilters<TExtra>>,
) => void;

/**
 * Shared URL list state: page / perPage / optional search + `listParams`.
 * Domain hooks should use this (or `createUseSearchListFilters`) instead of
 * copy-pasting `useQueryStates` + debounce + page reset setters.
 */
export function useSearchListFilters<TExtra extends Record<string, string> = Record<never, never>>(
  parsers: object,
  options: UseSearchListFiltersOptions = {},
) {
  const { debounceMs = 500, history = 'replace', includeSearchInParams = true } = options;

  const [filters, setFilters] = useQueryStates(parsers as never, { history });
  const typedFilters = filters as SearchListFilters<TExtra>;
  const updateFilters = setFilters as unknown as SetSearchListFilters<TExtra>;

  const searchValue = typeof typedFilters.search === 'string' ? typedFilters.search : '';
  const debouncedSearch = useDebounce(searchValue, debounceMs);

  const listParams = useMemo(
    (): SearchListParams =>
      buildSearchListParams(
        typedFilters.page,
        typedFilters.perPage,
        includeSearchInParams ? debouncedSearch : '',
      ),
    [typedFilters.page, typedFilters.perPage, debouncedSearch, includeSearchInParams],
  );

  const setPage = useCallback(
    (page: number) => {
      void updateFilters({ page } as Partial<SearchListFilters<TExtra>>);
    },
    [updateFilters],
  );

  const setPageSize = useCallback(
    (perPage: number) => {
      void updateFilters({ perPage, page: 1 } as Partial<SearchListFilters<TExtra>>);
    },
    [updateFilters],
  );

  const setSearch = useCallback(
    (search: string) => {
      void updateFilters({ search, page: 1 } as Partial<SearchListFilters<TExtra>>);
    },
    [updateFilters],
  );

  return {
    filters: typedFilters,
    setFilters: updateFilters,
    listParams,
    debouncedSearch,
    setSearch,
    setPage,
    setPageSize,
  };
}

/**
 * One-liner factory for search-only list pages (city, country, tags, …).
 *
 * @example
 * export const useCityListFilters = createUseSearchListFilters<ListCitiesRequest>(
 *   CITY_LIST_SEARCH_PARAMS,
 * );
 */
export function createUseSearchListFilters<TParams = SearchListParams>(
  parsers: object,
  options?: UseSearchListFiltersOptions,
) {
  return function useCreatedSearchListFilters() {
    const state = useSearchListFilters(parsers, options);
    return {
      ...state,
      listParams: state.listParams as TParams,
    };
  };
}
