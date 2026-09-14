'use client';

import { useState } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import Dropdown from '@/components/ui/Dropdown';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { cn } from '@/utils/classNames';
import {
  getTableToolbarState,
  insertEditorTable,
  TABLE_GRID_MAX_COLS,
  TABLE_GRID_MAX_ROWS,
} from '@/utils/editor/editorTable';
import Image from 'next/image';

interface EditorTableInsertProps {
  editor: TiptapEditor;
  disabled?: boolean;
  modalMode?: boolean;
}

const ROWS = Array.from({ length: TABLE_GRID_MAX_ROWS }, (_, i) => i + 1);
const COLS = Array.from({ length: TABLE_GRID_MAX_COLS }, (_, i) => i + 1);

export default function EditorTableInsert({
  editor,
  disabled = false,
  modalMode = false,
}: EditorTableInsertProps) {
  const tableState = useEditorState({
    editor,
    selector: ({ editor: ed }) => getTableToolbarState(ed),
  });

  const [hover, setHover] = useState<{ rows: number; cols: number }>({ rows: 0, cols: 0 });
  const [withHeader, setWithHeader] = useState(true);

  const handleInsert = (rows: number, cols: number) => {
    insertEditorTable(editor, rows, cols, withHeader);
    setHover({ rows: 0, cols: 0 });
  };

  const label =
    hover.rows > 0 && hover.cols > 0 ? `${hover.cols} × ${hover.rows}` : 'Chọn kích thước';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Dropdown
            usePortal
            align="left"
            placement="bottom"
            containerClassName="shrink-0"
            className={cn('p-3', modalMode && 'z-110')}
            ariaLabel="Chèn bảng"
            trigger={({ triggerProps }) => (
              <Button
                type="button"
                variant="transparent"
                disabled={disabled}
                onMouseDown={(e) => e.preventDefault()}
                {...triggerProps}
                title="Chèn bảng"
                className={cn(
                  'h-auto rounded p-2 text-black enabled:hover:bg-gray/20',
                  tableState.isInTable && 'bg-primary-light text-primary',
                )}
              >
                <Image
                  src="/images/icons/icon_cells.webp"
                  alt="icon_table"
                  width={24}
                  height={24}
                  className="size-6 object-contain"
                />
              </Button>
            )}
          >
            <div onMouseDown={(e) => e.preventDefault()}>
              <p className="mb-2 text-center text-xs font-medium text-black">{label}</p>
              <div
                className="flex flex-col gap-1"
                onMouseLeave={() => setHover({ rows: 0, cols: 0 })}
              >
                {ROWS.map((r) => (
                  <div
                    key={r}
                    className="flex gap-1"
                  >
                    {COLS.map((c) => {
                      const active = r <= hover.rows && c <= hover.cols;
                      return (
                        <button
                          key={c}
                          type="button"
                          aria-label={`${c} × ${r}`}
                          onMouseEnter={() => setHover({ rows: r, cols: c })}
                          onClick={() => handleInsert(r, c)}
                          className={cn(
                            'size-5 rounded-[3px] border transition-colors',
                            active
                              ? 'border-primary bg-primary-light'
                              : 'border-gray/30 bg-white hover:border-primary/40',
                          )}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-black">
                <Checkbox
                  checked={withHeader}
                  onChange={(e) => setWithHeader(e.target.checked)}
                />
                Hàng tiêu đề
              </label>
            </div>
          </Dropdown>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">Chèn bảng</TooltipContent>
    </Tooltip>
  );
}
