import { renderHook } from '@testing-library/react';

import { useListColumns } from '@/hooks/list/useListColumns';

describe('useListColumns', () => {
  it('memoizes columns until dependencies change', () => {
    const factory = jest.fn(() => [{ key: 'name', label: 'Name' }]);

    const { result, rerender } = renderHook(
      ({ label }) => useListColumns(() => factory().map((col) => ({ ...col, label })), [label]),
      { initialProps: { label: 'Name' } },
    );

    const first = result.current;
    expect(factory).toHaveBeenCalledTimes(1);

    rerender({ label: 'Name' });
    expect(result.current).toBe(first);
    expect(factory).toHaveBeenCalledTimes(1);

    rerender({ label: 'Updated' });
    expect(result.current).not.toBe(first);
    expect(result.current[0].label).toBe('Updated');
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
