import { renderHook } from '@testing-library/react';

import { useClientPagination } from '@/hooks/list/useClientPagination';

describe('useClientPagination', () => {
  const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

  it('slices the first page correctly', () => {
    const { result } = renderHook(() => useClientPagination(items, 1, 10));

    expect(result.current.totalItems).toBe(25);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.pageItems.map((item) => item.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });

  it('slices a middle page correctly', () => {
    const { result } = renderHook(() => useClientPagination(items, 2, 10));

    expect(result.current.pageItems.map((item) => item.id)).toEqual([
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ]);
  });

  it('slices the last partial page correctly', () => {
    const { result } = renderHook(() => useClientPagination(items, 3, 10));

    expect(result.current.pageItems.map((item) => item.id)).toEqual([21, 22, 23, 24, 25]);
  });

  it('clamps an out-of-range page to the last page', () => {
    const { result } = renderHook(() => useClientPagination(items, 99, 10));

    expect(result.current.pageItems.map((item) => item.id)).toEqual([21, 22, 23, 24, 25]);
  });

  it('returns one empty page for an empty list', () => {
    const { result } = renderHook(() => useClientPagination([], 1, 20));

    expect(result.current).toEqual({
      pageItems: [],
      totalItems: 0,
      totalPages: 1,
    });
  });

  it('updates when page or perPage changes', () => {
    const { result, rerender } = renderHook(
      ({ page, perPage }) => useClientPagination(items, page, perPage),
      { initialProps: { page: 1, perPage: 10 } },
    );

    expect(result.current.pageItems).toHaveLength(10);

    rerender({ page: 1, perPage: 20 });
    expect(result.current.pageItems).toHaveLength(20);
    expect(result.current.totalPages).toBe(2);
  });
});
