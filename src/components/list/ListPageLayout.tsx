'use client';

import type { ReactNode } from 'react';

import { cn } from '@/utils/classNames';

interface ListPageLayoutProps {
  /** Optional page header rendered above the card (title, breadcrumbs, etc.). */
  header?: ReactNode;
  /** Filter / toolbar row inside the card. */
  filters?: ReactNode;
  /** Main table (or grid) content; grows to fill remaining height. */
  table: ReactNode;
  /** Extra classes for the table slot. */
  tableClassName?: string;
  /** Pagination footer; omit when the list has no paging. */
  pagination?: ReactNode;
  className?: string;
  cardClassName?: string;
}

/**
 * Standard list page shell: header + white card with filters, table, pagination.
 */
export default function ListPageLayout({
  header,
  filters,
  table,
  tableClassName,
  pagination,
  className,
  cardClassName,
}: ListPageLayoutProps) {
  return (
    <div className={cn('flex h-full min-h-0 flex-1 flex-col overflow-hidden', className)}>
      {header != null ? <div className="shrink-0">{header}</div> : null}

      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-white shadow-[0px_3px_8px_#0063FF33]',
          cardClassName,
        )}
      >
        {filters != null ? <div className="shrink-0">{filters}</div> : null}

        <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden', tableClassName)}>
          {table}
        </div>

        {pagination != null ? (
          <div className="border-gray/10 shrink-0 border-t px-6 py-4">{pagination}</div>
        ) : null}
      </div>
    </div>
  );
}
