'use client';

import type { ReactNode } from 'react';
import { FiRefreshCcw } from 'react-icons/fi';
import { HiOutlinePlus, HiOutlineXMark } from 'react-icons/hi2';
import { LuSearch } from 'react-icons/lu';

import { TOOLBAR_ACTION_BUTTON_CLASS } from '@/constants/list-toolbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/classNames';
import { shouldSplitListToolbarActions } from '@/utils/list-toolbar';

export interface ListSearchToolbarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onCreate?: () => void;
  createLabel?: string;
  refreshLabel?: string;
  isDisabled?: boolean;
  /** Extra filters rendered before the search input (selects, tabs, etc.). */
  children?: ReactNode;
  /** Extra actions after create/refresh. */
  trailing?: ReactNode;
  className?: string;
  hideSearch?: boolean;
  searchContainerClassName?: string;
}

/**
 * Shared list toolbar.
 * Search + up to four buttons stay on one desktop row and align right as a group.
 * A filter select with extra trailing actions (or more than four buttons) moves
 * the buttons onto a second right-aligned row. Mobile/tablet always stack.
 * Copy is normalized to “Thêm mới” / “Làm mới”.
 */
export default function ListSearchToolbar({
  search = '',
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  onRefresh,
  isRefreshing = false,
  onCreate,
  createLabel = 'Thêm mới',
  refreshLabel = 'Làm mới',
  isDisabled = false,
  children,
  trailing,
  className,
  hideSearch = false,
  searchContainerClassName,
}: ListSearchToolbarProps) {
  const showSearch = !hideSearch && Boolean(onSearchChange);
  const hasActions = Boolean(onCreate || onRefresh || trailing);
  const splitActions = shouldSplitListToolbarActions({
    children,
    onCreate,
    onRefresh,
    trailing,
  });

  const searchField =
    showSearch && onSearchChange ? (
      <Input
        placeholder={searchPlaceholder}
        variant="standard"
        leftIcon={<LuSearch />}
        rightIcon={
          search ? (
            <Button
              type="button"
              variant="transparent"
              size="sm"
              className="h-auto shrink-0 cursor-pointer p-0"
              disabled={isDisabled}
              onClick={() => onSearchChange('')}
              aria-label="Xóa tìm kiếm"
            >
              <HiOutlineXMark className="size-4.5 shrink-0" />
            </Button>
          ) : null
        }
        value={search}
        disabled={isDisabled}
        onChange={(e) => onSearchChange(e.target.value)}
        containerClassName={cn(
          'min-w-0 w-full max-lg:w-full',
          splitActions ? 'sm:min-w-52 sm:flex-1' : 'lg:w-64',
          searchContainerClassName,
        )}
        className="h-10 py-2 text-sm"
      />
    ) : null;

  const filterSlot = children ? (
    <div className="max-sm:w-full max-sm:basis-full sm:shrink-0">{children}</div>
  ) : null;

  const actionSlot = hasActions ? (
    <div
      className={cn(
        'list-toolbar-actions flex w-full flex-wrap items-center justify-end gap-2',
        !splitActions && 'lg:w-auto',
      )}
    >
      {onCreate ? (
        <Button
          leftIcon={<HiOutlinePlus className="size-5 shrink-0" />}
          variant="outline"
          className={cn('border text-black', TOOLBAR_ACTION_BUTTON_CLASS)}
          disabled={isDisabled}
          onClick={onCreate}
          aria-label={createLabel}
        >
          {createLabel}
        </Button>
      ) : null}

      {onRefresh ? (
        <Button
          leftIcon={<FiRefreshCcw className="size-5 shrink-0" />}
          variant="outline"
          className={cn('border text-black', TOOLBAR_ACTION_BUTTON_CLASS)}
          disabled={isRefreshing || isDisabled}
          loading={isRefreshing}
          onClick={onRefresh}
          aria-label={refreshLabel}
        >
          {refreshLabel}
        </Button>
      ) : null}

      {trailing}
    </div>
  ) : null;

  return (
    <div
      className={cn(
        'flex shrink-0 gap-2 border-b border-gray/10 px-4 py-3 sm:px-6 sm:py-4',
        splitActions
          ? 'flex-col items-stretch'
          : 'max-lg:flex-col max-lg:items-stretch lg:flex-row lg:items-center lg:justify-end',
        className,
      )}
    >
      <div
        className={cn(
          'list-toolbar-fields flex min-w-0 w-full flex-wrap items-center gap-2',
          !splitActions && 'lg:w-auto',
        )}
      >
        {filterSlot}
        {searchField}
      </div>
      {actionSlot}
    </div>
  );
}
