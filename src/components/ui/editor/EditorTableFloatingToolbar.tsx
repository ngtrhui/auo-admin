'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { FiAlignCenter, FiAlignJustify, FiAlignLeft, FiAlignRight } from 'react-icons/fi';
import { MdTitle } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { useEditorTableToolbarPosition } from '@/hooks/useEditorTableToolbarPosition';
import { cn } from '@/utils/classNames';
import { isEditorAlive } from '@/utils/editor/editorGuard';
import {
  addTableColumnAfter,
  addTableColumnBefore,
  addTableRowAfter,
  addTableRowBefore,
  deleteEditorTable,
  deleteTableColumn,
  deleteTableRow,
  getTableToolbarState,
  mergeTableCells,
  splitTableCell,
  toggleTableHeaderRow,
} from '@/utils/editor/editorTable';
import { applyTextAlign } from '@/utils/editor/editorToolbar';
import EditorTableBorderControls from './EditorTableBorderControls';
import Icon from '../Icon';

interface EditorTableFloatingToolbarProps {
  editor: TiptapEditor;
  disabled?: boolean;
  elevatedOverlay?: boolean;
  layoutEpoch?: string;
}

interface ToolbarCoords {
  top: number;
  left: number;
}

const ToolbarDivider = () => (
  <div
    className="mx-0.5 h-5 w-px bg-gray/30"
    aria-hidden
  />
);

function FloatingToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button
            type="button"
            variant="transparent"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
              'h-auto rounded p-1.5 text-black enabled:hover:bg-gray/15',
              active && 'bg-primary-light text-primary',
            )}
          >
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{title}</TooltipContent>
    </Tooltip>
  );
}

function getScrollParent(element: HTMLElement | null): HTMLElement | null {
  let node = element?.parentElement ?? null;
  while (node) {
    const style = getComputedStyle(node);
    if (/(auto|scroll|overlay)/.test(style.overflow + style.overflowY + style.overflowX)) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

export default function EditorTableFloatingToolbar({
  editor,
  disabled = false,
  elevatedOverlay = false,
  layoutEpoch = 'embedded',
}: EditorTableFloatingToolbarProps) {
  const { tableElement, visible } = useEditorTableToolbarPosition(editor, disabled);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<ToolbarCoords | null>(null);
  const [offscreen, setOffscreen] = useState(false);
  const rafRef = useRef<number | null>(null);

  const tableState = useEditorState({
    editor,
    selector: ({ editor: ed }) => getTableToolbarState(ed),
  });

  const textAlign = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      if (!isEditorAlive(ed)) return 'left';
      if (ed.isActive({ textAlign: 'center' })) return 'center';
      if (ed.isActive({ textAlign: 'right' })) return 'right';
      if (ed.isActive({ textAlign: 'justify' })) return 'justify';
      return 'left';
    },
  });

  const recompute = useCallback(() => {
    if (!tableElement || !toolbarRef.current) return;

    const tableRect = tableElement.getBoundingClientRect();
    const scroll =
      (tableElement.closest('[data-editor-scroll]') as HTMLElement | null) ??
      getScrollParent(tableElement);
    const scrollRect = scroll
      ? scroll.getBoundingClientRect()
      : ({
          top: 0,
          left: 0,
          right: window.innerWidth,
          bottom: window.innerHeight,
        } as DOMRect);

    const tbWidth = toolbarRef.current.offsetWidth;
    const tbHeight = toolbarRef.current.offsetHeight;

    const visibleTop = Math.max(tableRect.top, scrollRect.top);
    const visibleBottom = Math.min(tableRect.bottom, scrollRect.bottom);
    const isOffscreen = visibleBottom <= scrollRect.top + 4 || visibleTop >= scrollRect.bottom - 4;
    setOffscreen(isOffscreen);

    let top: number;
    if (visibleTop - scrollRect.top >= tbHeight + 8) {
      top = visibleTop - tbHeight - 6;
    } else if (scrollRect.bottom - visibleBottom >= tbHeight + 8) {
      top = visibleBottom + 6;
    } else {
      top = scrollRect.top + 4;
    }
    top = Math.max(scrollRect.top + 4, Math.min(top, scrollRect.bottom - tbHeight - 4));

    const minLeft = scrollRect.left + 4;
    const maxLeft = scrollRect.right - tbWidth - 4;
    const centered = tableRect.left + tableRect.width / 2 - tbWidth / 2;
    const left = Math.max(minLeft, Math.min(centered, maxLeft));

    setCoords((prev) =>
      prev && Math.abs(prev.top - top) < 0.5 && Math.abs(prev.left - left) < 0.5
        ? prev
        : { top, left },
    );
  }, [tableElement]);

  const scheduleRecompute = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      recompute();
    });
  }, [recompute]);

  useLayoutEffect(() => {
    recompute();
  }, [recompute, tableState, textAlign, visible]);

  useLayoutEffect(() => {
    recompute();
    const raf = requestAnimationFrame(() => {
      recompute();
    });
    return () => cancelAnimationFrame(raf);
  }, [layoutEpoch, recompute]);

  useEffect(() => {
    if (!tableElement) return;

    window.addEventListener('scroll', scheduleRecompute, true);
    window.addEventListener('resize', scheduleRecompute);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', scheduleRecompute, true);
      window.removeEventListener('resize', scheduleRecompute);
    };
  }, [tableElement, scheduleRecompute]);

  if (!isEditorAlive(editor) || !tableState.isInTable || !tableElement) return null;

  const toolbar = (
    <div
      ref={toolbarRef}
      data-editor-table-floating-toolbar
      className={cn(
        'fixed z-60 flex max-w-[min(96vw,680px)] flex-wrap items-center gap-0.5 rounded-lg border border-gray/15 bg-white px-1 py-0.5 shadow-md transition-opacity',
        elevatedOverlay && 'z-110',
        !visible || !coords || offscreen ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
      style={{
        top: coords?.top ?? -9999,
        left: coords?.left ?? -9999,
      }}
      role="toolbar"
      aria-label="Thao tác bảng"
      onMouseDown={(e) => e.preventDefault()}
    >
      <FloatingToolbarButton
        onClick={() => addTableRowBefore(editor)}
        disabled={disabled}
        title="Thêm hàng phía trên"
      >
        <Icon
          icon="/images/icons/icon_insert_above.webp"
          className="size-6 object-contain block"
        />
      </FloatingToolbarButton>
      <FloatingToolbarButton
        onClick={() => addTableRowAfter(editor)}
        disabled={disabled}
        title="Thêm hàng phía dưới"
      >
        <Icon
          icon="/images/icons/icon_insert_below.webp"
          className="size-6 object-contain block"
        />
      </FloatingToolbarButton>
      <FloatingToolbarButton
        onClick={() => deleteTableRow(editor)}
        disabled={disabled}
        title="Xóa hàng"
      >
        <Icon
          icon="/images/icons/icon_delete_row.webp"
          className="size-6 object-contain block"
        />
      </FloatingToolbarButton>

      <ToolbarDivider />

      <FloatingToolbarButton
        onClick={() => addTableColumnBefore(editor)}
        disabled={disabled}
        title="Thêm cột bên trái"
      >
        <Icon
          icon="/images/icons/icon_insert_column_left.webp"
          className="size-6 object-contain block"
        />
      </FloatingToolbarButton>
      <FloatingToolbarButton
        onClick={() => addTableColumnAfter(editor)}
        disabled={disabled}
        title="Thêm cột bên phải"
      >
        <Icon
          icon="/images/icons/icon_insert_column_right.webp"
          className="size-6 object-contain block"
        />
      </FloatingToolbarButton>
      <FloatingToolbarButton
        onClick={() => deleteTableColumn(editor)}
        disabled={disabled}
        title="Xóa cột"
      >
        <Icon
          icon="/images/icons/icon_delete-column.webp"
          className="size-6 object-contain block"
        />
      </FloatingToolbarButton>

      <ToolbarDivider />

      <FloatingToolbarButton
        onClick={() => mergeTableCells(editor)}
        disabled={disabled || !tableState.canMerge}
        title="Gộp ô"
      >
        <Icon
          icon="/images/icons/icon_merge.webp"
          className={cn(
            'size-6 object-contain block transition-opacity duration-300',
            disabled || (!tableState.canMerge && 'opacity-50'),
          )}
        />
      </FloatingToolbarButton>
      <FloatingToolbarButton
        onClick={() => splitTableCell(editor)}
        disabled={disabled || !tableState.canSplit}
        title="Tách ô"
      >
        <Icon
          icon="/images/icons/icon_split.webp"
          className={cn(
            'size-6 object-contain block transition-opacity duration-300',
            disabled || (!tableState.canSplit && 'opacity-50'),
          )}
        />
      </FloatingToolbarButton>

      <ToolbarDivider />

      <FloatingToolbarButton
        onClick={() => toggleTableHeaderRow(editor)}
        active={tableState.isHeaderRow}
        disabled={disabled}
        title="Hàng tiêu đề"
      >
        <MdTitle className="size-5" />
      </FloatingToolbarButton>

      <ToolbarDivider />

      <EditorTableBorderControls
        editor={editor}
        disabled={disabled}
        elevatedOverlay={elevatedOverlay}
      />

      <ToolbarDivider />

      <FloatingToolbarButton
        onClick={() => applyTextAlign(editor, 'left')}
        active={textAlign === 'left'}
        disabled={disabled}
        title="Căn trái"
      >
        <FiAlignLeft className="size-5" />
      </FloatingToolbarButton>
      <FloatingToolbarButton
        onClick={() => applyTextAlign(editor, 'center')}
        active={textAlign === 'center'}
        disabled={disabled}
        title="Căn giữa"
      >
        <FiAlignCenter className="size-5" />
      </FloatingToolbarButton>
      <FloatingToolbarButton
        onClick={() => applyTextAlign(editor, 'right')}
        active={textAlign === 'right'}
        disabled={disabled}
        title="Căn phải"
      >
        <FiAlignRight className="size-5" />
      </FloatingToolbarButton>
      <FloatingToolbarButton
        onClick={() => applyTextAlign(editor, 'justify')}
        active={textAlign === 'justify'}
        disabled={disabled}
        title="Căn đều"
      >
        <FiAlignJustify className="size-5" />
      </FloatingToolbarButton>

      <ToolbarDivider />

      <FloatingToolbarButton
        onClick={() => deleteEditorTable(editor)}
        disabled={disabled}
        title="Xóa bảng"
      >
        <Icon
          icon="/images/icons/icon_eraser.webp"
          className="size-5 object-contain block bg-coral"
        />
      </FloatingToolbarButton>
    </div>
  );

  return createPortal(toolbar, document.body);
}
