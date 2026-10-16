'use client';

import { useMemo } from 'react';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

import { Button } from '@/components/ui/Button';
import type { ColumnDef } from '@/components/ui/table.types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';

export interface UseActionColumnParams<TData> {
  onEdit?: (item: TData) => void;
  onDelete?: (item: TData) => void;
  isDisabled?: boolean;
  label?: string;
  key?: string;
  editTooltip?: string;
  deleteTooltip?: string;
}

/**
 * Shared edit/delete action column used across list pages.
 */
export function useActionColumn<TData>({
  onEdit,
  onDelete,
  isDisabled = false,
  label = 'Hoạt động',
  key = 'actions',
  editTooltip = 'Chỉnh sửa',
  deleteTooltip = 'Xóa',
}: UseActionColumnParams<TData>): ColumnDef<TData> {
  return useMemo(
    () => ({
      key,
      label,
      render: (row: TData) => (
        <div className="flex items-center justify-center gap-6">
          {onEdit ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button
                    onClick={() => onEdit(row)}
                    className="text-primary hover:text-primary/80 h-auto p-0"
                    disabled={isDisabled}
                    variant="transparent"
                    aria-label={editTooltip}
                  >
                    <HiOutlinePencil className="size-5" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">{editTooltip}</TooltipContent>
            </Tooltip>
          ) : null}
          {onDelete ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button
                    variant="transparent"
                    disabled={isDisabled}
                    className="text-coral hover:text-coral/80 h-auto p-0"
                    onClick={() => onDelete(row)}
                    aria-label={deleteTooltip}
                  >
                    <HiOutlineTrash className="size-5 shrink-0" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">{deleteTooltip}</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      ),
    }),
    [onEdit, onDelete, isDisabled, label, key, editTooltip, deleteTooltip],
  );
}
