import type { ReactNode } from 'react';

import type { ColumnDef } from '@/components/ui/table.types';

type AccessorOptions<TData, TKey extends keyof TData> = Omit<ColumnDef<TData>, 'key' | 'render'> & {
  render?: (value: TData[TKey], row: TData) => ReactNode;
};

type DisplayOptions<TData> = Omit<ColumnDef<TData>, 'key'>;

type TextOptions<TData, TKey extends keyof TData> = Partial<
  Omit<ColumnDef<TData>, 'key' | 'label' | 'render'>
> & {
  render?: (value: TData[TKey], row: TData) => ReactNode;
};

/**
 * Typed builders for `ColumnDef<TData>`. Business columns stay outside Table.
 */
export function createColumnHelper<TData>() {
  return {
    accessor<TKey extends keyof TData & string>(
      key: TKey,
      options: AccessorOptions<TData, TKey>,
    ): ColumnDef<TData> {
      const { render, ...rest } = options;
      return {
        key,
        ...rest,
        render: render
          ? (row) => render(row[key], row)
          : (row) => {
              const value = row[key];
              if (value == null) return null;
              if (typeof value === 'string' || typeof value === 'number') {
                return String(value);
              }
              return null;
            },
      };
    },

    display(key: string, options: DisplayOptions<TData>): ColumnDef<TData> {
      return {
        key,
        ...options,
      };
    },

    /** Convenience for left-aligned text columns with shared header classes. */
    text<TKey extends keyof TData & string>(
      key: TKey,
      label: ReactNode,
      options?: TextOptions<TData, TKey>,
    ): ColumnDef<TData> {
      const { render, ...rest } = options ?? {};
      return {
        key,
        label,
        align: 'left' as const,
        headerClassName: 'text-left [&>span]:justify-start',
        ...rest,
        render: render
          ? (row) => render(row[key], row)
          : (row) => {
              const value = row[key];
              return String(value ?? '');
            },
      };
    },
  };
}
