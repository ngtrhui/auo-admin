'use client';

import { cn } from '@/utils/classNames';
import { Button } from './Button';
import Dropdown from './Dropdown';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 500] as const;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalItems: number;
  pageSizeOptions?: readonly number[];
  className?: string;
  isLoading?: boolean;
}

const PAGE_WINDOW = 5;
const SIDE_LEFT_OF_CENTER = Math.floor(PAGE_WINDOW / 2);

function getPageItems(current: number, total: number): number[] {
  if (total < 1) return [];
  if (total === 1) return [1];

  let start = current - SIDE_LEFT_OF_CENTER;
  let end = start + PAGE_WINDOW - 1;

  if (start < 1) {
    start = 1;
    end = Math.min(PAGE_WINDOW, total);
  }
  if (end > total) {
    end = total;
    start = Math.max(1, end - PAGE_WINDOW + 1);
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
}

function getDisplayRange(
  page: number,
  pageSize: number,
  totalItems: number,
): { start: number; end: number } {
  if (totalItems === 0) return { start: 0, end: 0 };
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  return { start, end };
}

const navButtonClass =
  'rounded-xl border size-10 p-0 border-gray/20 hover:border-primary focus-visible:ring-2 focus-visible:ring-primary bg-white font-medium text-black shadow-none disabled:border-gray/20 disabled:bg-white disabled:text-gray';

const pageButtonBase =
  'h-10 w-10 rounded-xl border border-gray/20 hover:border-primary focus-visible:ring-2 focus-visible:ring-primary text-sm shadow-none';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
  isLoading = false,
}: PaginationProps) => {
  const safeTotal = Math.max(1, totalPages);
  const page = Math.min(Math.max(1, currentPage), safeTotal);

  const canGoPrev = page > 1;
  const canGoNext = page < safeTotal;

  const items = getPageItems(page, safeTotal);
  const { start, end } = getDisplayRange(page, pageSize, totalItems);

  return (
    <div
      className={cn(
        'flex w-full flex-col flex-wrap items-center gap-4',
        'md:flex-row md:items-center md:justify-between',
        className,
      )}
    >
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-sm text-gray">Hiển thị</span>
        <Dropdown
          usePortal
          placement="top"
          align="left"
          matchTriggerWidth
          containerClassName="w-[72px] shrink-0"
          className="z-100"
          ariaLabel="Số bản ghi mỗi trang"
          trigger={({ arrow, triggerProps }) => (
            <button
              type="button"
              disabled={isLoading}
              {...triggerProps}
              className={cn(
                'flex h-10 w-full cursor-pointer items-center justify-between gap-1 rounded-lg border border-gray/20 bg-white px-3 py-2 text-sm font-medium text-black transition-colors',
                'hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                isLoading && 'pointer-events-none opacity-60',
              )}
            >
              <span>{pageSize}</span>
              {arrow}
            </button>
          )}
        >
          {pageSizeOptions.map((size) => (
            <Button
              key={size}
              type="button"
              variant="transparent"
              role="menuitem"
              className={cn(
                'w-full cursor-pointer rounded-none font-medium h-auto px-3 py-2 text-sm',
                'hover:bg-gray/10',
                size === pageSize ? 'bg-primary-light font-semibold text-primary' : 'text-black',
              )}
              onClick={() => onPageSizeChange(size)}
            >
              {size}
            </Button>
          ))}
        </Dropdown>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="transparent"
          disabled={!canGoPrev || isLoading}
          onClick={() => onPageChange(page - 1)}
          className={navButtonClass}
          leftIcon={<MdKeyboardArrowLeft className="size-5" />}
        />

        {items.map((item) => (
          <Button
            key={item}
            type="button"
            variant="transparent"
            disabled={isLoading}
            onClick={() => onPageChange(item)}
            className={cn(
              pageButtonBase,
              item === page
                ? 'border-primary bg-primary font-semibold text-white hover:bg-primary hover:text-white'
                : 'border-gray/20 bg-white text-black',
            )}
          >
            {item}
          </Button>
        ))}

        <Button
          type="button"
          variant="transparent"
          disabled={!canGoNext || isLoading}
          onClick={() => onPageChange(page + 1)}
          className={navButtonClass}
          leftIcon={<MdKeyboardArrowRight className="size-5" />}
        />
      </div>

      <p className="text-center text-sm text-gray md:text-right">
        Hiển thị{' '}
        <span className="font-medium text-black">
          {start} - {end}
        </span>{' '}
        trong tổng <span className="font-medium text-black">{totalItems}</span>
      </p>
    </div>
  );
};

export { Pagination };
