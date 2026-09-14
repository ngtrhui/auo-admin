'use client';

import { useSyncExternalStore } from 'react';
import { TbSortAscending } from 'react-icons/tb';

import type { ColumnDef, TableProps } from '@/components/ui/table.types';
import { cn } from '@/utils/classNames';

import Loading from './Loading';

export type { ColumnDef, TableProps } from '@/components/ui/table.types';

function getColumnWidth(col: ColumnDef<unknown>): number {
  if (typeof col.width === 'number') return col.width;
  if (typeof col.width === 'string') {
    const parsed = Number.parseInt(col.width, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 120;
}

function buildPinnedOffsets(columns: ColumnDef<unknown>[]) {
  const leftOffsets = new Map<string, number>();
  const rightOffsets = new Map<string, number>();

  let leftOffset = 0;
  for (const col of columns) {
    if (col.pinned !== 'left') continue;
    leftOffsets.set(col.key as string, leftOffset);
    leftOffset += getColumnWidth(col);
  }

  let rightOffset = 0;
  for (let i = columns.length - 1; i >= 0; i -= 1) {
    const col = columns[i];
    if (col.pinned !== 'right') continue;
    rightOffsets.set(col.key as string, rightOffset);
    rightOffset += getColumnWidth(col);
  }

  return {
    leftOffsets,
    rightOffsets,
  };
}

function getPinnedStyle(
  col: ColumnDef<unknown>,
  offsets: ReturnType<typeof buildPinnedOffsets>,
): React.CSSProperties | undefined {
  const key = col.key as string;

  if (col.pinned === 'left') {
    return { left: offsets.leftOffsets.get(key) ?? 0 };
  }

  if (col.pinned === 'right') {
    return { right: offsets.rightOffsets.get(key) ?? 0 };
  }

  return undefined;
}

function getPinnedClassName(col: ColumnDef<unknown>, isHeader: boolean) {
  if (!col.pinned) return undefined;

  return cn('md:sticky z-20', isHeader && 'z-30 bg-primary-light');
}

function getBodyCellClassName(
  col: ColumnDef<unknown>,
  isSelected: boolean,
  alignClass: string,
  tableCellClassName?: string,
) {
  return cn(
    'px-3 py-1.5 align-middle transition-colors duration-150',
    alignClass,
    tableCellClassName,
    getPinnedClassName(col, false),
    isSelected ? 'bg-row-hover group-hover:bg-row-hover' : 'bg-white group-hover:bg-row-hover',
  );
}

function getRowId(row: unknown): string | number | undefined {
  if (row && typeof row === 'object' && 'id' in row) {
    const id = (row as { id: unknown }).id;
    if (typeof id === 'string') {
      const trimmed = id.trim();
      return trimmed ? trimmed : undefined;
    }
    if (typeof id === 'number') return id;
  }
  return undefined;
}

/** Khớp Tailwind `lg` (≥1024px): offset cột ghim chỉ áp trên desktop. */
const LG_VIEWPORT_MQ = '(min-width: 1024px)';

function subscribeLgViewport(onStoreChange: () => void) {
  const mq = window.matchMedia(LG_VIEWPORT_MQ);
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getLgViewportSnapshot() {
  return window.matchMedia(LG_VIEWPORT_MQ).matches;
}

function getLgViewportServerSnapshot() {
  return false;
}

const Table = <TData,>({
  columns,
  data,
  orderBy,
  orderDirection,
  selectedRows,
  onOrderChange,
  isLoading,
  onRowClick,
  trClassName,
  getRowClassName,
  scrollContainerClassName,
  headerClassName,
  tableClassName,
  tableCellClassName,
}: TableProps<TData>) => {
  const isLgViewport = useSyncExternalStore(
    subscribeLgViewport,
    getLgViewportSnapshot,
    getLgViewportServerSnapshot,
  );

  const pinnedOffsets = buildPinnedOffsets(columns as ColumnDef<unknown>[]);

  const pinnedStyleForCol = (col: ColumnDef<unknown>) =>
    isLgViewport ? getPinnedStyle(col, pinnedOffsets) : {};

  const handleOrder = (col: ColumnDef<TData>) => {
    if (!col.orderable) return;
    const isAsc = orderBy === col.key && orderDirection === 'asc';
    onOrderChange?.(col.key as string, isAsc ? 'desc' : 'asc');
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      case 'center':
      default:
        return 'text-center';
    }
  };

  const tableEl = (
    <table className={cn('w-full table-auto rounded-lg border-collapse', tableClassName)}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key as string}
              className={cn(
                'sticky top-0 z-10 px-5 py-3 text-center text-sm font-bold text-primary bg-primary-light whitespace-nowrap',
                col.orderable ? 'cursor-pointer' : '',
                headerClassName,
                col.headerClassName,
                getPinnedClassName(col as ColumnDef<unknown>, true),
              )}
              style={{
                minWidth: col.width,
                ...pinnedStyleForCol(col as ColumnDef<unknown>),
              }}
              onClick={() => (col.orderable ? handleOrder(col) : undefined)}
            >
              <span className="flex items-center gap-1.5 justify-center">
                {col.label}
                {col.orderable && (
                  <TbSortAscending
                    className={cn(
                      'size-5 shrink-0 transition-transform duration-200 ease-out',
                      orderBy === col.key
                        ? cn(
                            'text-black',
                            orderDirection === 'desc' ? 'rotate-180' : 'rotate-0',
                          )
                        : 'rotate-0 text-gray/80',
                    )}
                  />
                )}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td
              colSpan={columns.length}
              className="h-8"
            >
              <div className="flex items-center justify-center py-12">
                <Loading
                  size="md"
                  message="Đang tải dữ liệu..."
                />
              </div>
            </td>
          </tr>
        ) : data === null || data?.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="py-8 text-center text-sm font-medium text-gray/80 lg:text-base"
            >
              Không có dữ liệu
            </td>
          </tr>
        ) : (
          data?.map((row, idx) => {
            const rowId = getRowId(row);
            const isSelected = rowId !== undefined && selectedRows?.has(rowId);

            return (
              <tr
                key={rowId ?? idx}
                className={cn(
                  'group border-b border-[#E3E3E3] bg-white text-sm text-black transition-colors duration-150 lg:text-base',
                  onRowClick ? 'cursor-pointer' : '',
                  trClassName,
                  getRowClassName?.(row),
                  idx < data.length - 1 ? 'border-b border-gray/20' : '',
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key as string}
                    className={getBodyCellClassName(
                      col as ColumnDef<unknown>,
                      Boolean(isSelected),
                      getAlignClass(col.align),
                      tableCellClassName,
                    )}
                    style={{
                      minWidth: col.width,
                      ...pinnedStyleForCol(col as ColumnDef<unknown>),
                    }}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key as string] ?? '')}
                  </td>
                ))}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );

  if (scrollContainerClassName) {
    return (
      <div className={cn('min-h-0 overflow-auto scrollbar', scrollContainerClassName)}>
        {tableEl}
      </div>
    );
  }

  return tableEl;
};

export default Table;
export { Table as DataTable };
