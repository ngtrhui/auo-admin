import type { ReactNode } from 'react';

export interface ColumnDef<TData> {
  key: keyof TData | string;
  label: ReactNode;
  orderable?: boolean;
  render?: (row: TData) => ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  headerClassName?: string;
  /** Pin column to the left or right edge while horizontally scrolling. */
  pinned?: 'left' | 'right';
}

export interface TableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  isLoading?: boolean;
  selectedRows?: Set<string | number>;
  onOrderChange?: (orderBy: string, orderDirection: 'asc' | 'desc') => void;
  onRowClick?: (row: TData) => void;
  trClassName?: string;
  getRowClassName?: (row: TData) => string;
  /**
   * Bật vùng scroll nội bộ + header sticky.
   * Truyền Tailwind (vd. `max-h-[500px]`, `h-[calc(100vh-16rem)]`).
   */
  scrollContainerClassName?: string;
  /** Class chung cho mọi `<th>` (merge với default sticky header). */
  headerClassName?: string;
  /** Merged onto `<table>`. Default: `table-auto`. Pass e.g. `table-fixed` for column-width clamping. */
  tableClassName?: string;
  /** Merged onto each `<td>` (e.g. `min-w-0` when using `table-fixed`). */
  tableCellClassName?: string;
}
