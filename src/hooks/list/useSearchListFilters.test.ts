import { act, renderHook } from '@testing-library/react';
import { useQueryStates } from 'nuqs';

import {
  createUseSearchListFilters,
  useSearchListFilters,
} from '@/hooks/list/useSearchListFilters';

jest.mock('nuqs', () => {
  const withDefault = <T>(defaultValue: T) => ({
    defaultValue,
    parseServerSide: (value: string | string[] | undefined): T => {
      if (value == null) return defaultValue;
      const raw = Array.isArray(value) ? value[0] : value;
      if (typeof defaultValue === 'number') {
        const parsed = Number.parseInt(raw, 10);
        return (Number.isNaN(parsed) ? defaultValue : parsed) as T;
      }
      return raw as T;
    },
  });

  return {
    parseAsInteger: { withDefault },
    parseAsString: { withDefault },
    useQueryStates: jest.fn(),
  };
});

const mockedUseQueryStates = useQueryStates as jest.MockedFunction<typeof useQueryStates>;
const PARSERS = { page: {}, perPage: {}, search: {} };

describe('useSearchListFilters', () => {
  const setFilters = jest.fn();

  beforeEach(() => {
    setFilters.mockReset();
  });

  it('builds listParams with trimmed search and omits blank search', () => {
    mockedUseQueryStates.mockReturnValue([
      { page: 2, perPage: 20, search: '  hanoi  ' },
      setFilters,
    ] as never);

    const { result } = renderHook(() => useSearchListFilters(PARSERS));

    expect(result.current.listParams).toEqual({
      page: 2,
      perPage: 20,
      search: 'hanoi',
    });
    expect(result.current.filters.search).toBe('  hanoi  ');
  });

  it('omits search from listParams when the keyword is blank', () => {
    mockedUseQueryStates.mockReturnValue([
      { page: 2, perPage: 20, search: '   ' },
      setFilters,
    ] as never);

    const { result } = renderHook(() => useSearchListFilters(PARSERS));

    expect(result.current.listParams).toEqual({ page: 2, perPage: 20 });
  });

  it('keeps search client-side when includeSearchInParams is false', () => {
    mockedUseQueryStates.mockReturnValue([
      { page: 1, perPage: 20, search: 'ticket' },
      setFilters,
    ] as never);

    const { result } = renderHook(() =>
      useSearchListFilters(PARSERS, { includeSearchInParams: false }),
    );

    expect(result.current.debouncedSearch).toBe('ticket');
    expect(result.current.listParams).toEqual({ page: 1, perPage: 20 });
  });

  it('resets page when search or page size changes', () => {
    mockedUseQueryStates.mockReturnValue([
      { page: 3, perPage: 20, search: '' },
      setFilters,
    ] as never);

    const { result } = renderHook(() => useSearchListFilters(PARSERS));

    act(() => {
      result.current.setSearch('da nang');
      result.current.setPageSize(50);
      result.current.setPage(4);
    });

    expect(setFilters).toHaveBeenCalledWith({ search: 'da nang', page: 1 });
    expect(setFilters).toHaveBeenCalledWith({ perPage: 50, page: 1 });
    expect(setFilters).toHaveBeenCalledWith({ page: 4 });
  });

  it('preserves the factory return shape used by list Management screens', () => {
    mockedUseQueryStates.mockReturnValue([
      { page: 1, perPage: 20, search: 'hue' },
      setFilters,
    ] as never);

    const useCityListFilters = createUseSearchListFilters(PARSERS);
    const { result } = renderHook(() => useCityListFilters());

    expect(result.current.filters).toEqual({ page: 1, perPage: 20, search: 'hue' });
    expect(result.current.listParams).toEqual({ page: 1, perPage: 20, search: 'hue' });
    expect(result.current.debouncedSearch).toBe('hue');
    expect(typeof result.current.setSearch).toBe('function');
    expect(typeof result.current.setPage).toBe('function');
    expect(typeof result.current.setPageSize).toBe('function');
  });
});
