'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { FiAlignCenter, FiAlignLeft, FiAlignRight } from 'react-icons/fi';
import { HiOutlinePhotograph } from 'react-icons/hi';
import { MdCrop, MdRotateLeft, MdRotateRight } from 'react-icons/md';

import { Button } from '@/components/ui/Button';
import EditorImageCropModal from './EditorImageCropModal';
import EditorImageSettingsModal from './EditorImageSettingsModal';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { useEditorImageToolbarPosition } from '@/hooks/useEditorImageToolbarPosition';
import { cn } from '@/utils/classNames';
import { isEditorAlive } from '@/utils/editor/editorGuard';
import { resolveEditorImageCropSource } from '@/utils/editor/editorImage';
import {
  flipImage,
  getSelectedImageAttrs,
  rotateImage,
  type SelectedImageAttrs,
} from '@/utils/editor/editorImageManipulations';
import { applyTextAlign } from '@/utils/editor/editorToolbar';
import { LuFlipHorizontal, LuFlipVertical } from 'react-icons/lu';

interface EditorImageFloatingToolbarProps {
  editor: TiptapEditor;
  disabled?: boolean;
  modalMode?: boolean;
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

export default function EditorImageFloatingToolbar({
  editor,
  disabled = false,
  modalMode = false,
  layoutEpoch = 'embedded',
}: EditorImageFloatingToolbarProps) {
  const [cropOpen, setCropOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savedImageAttrs, setSavedImageAttrs] = useState<SelectedImageAttrs | null>(null);
  const savedSelectionRef = useRef<number | null>(null);
  const editorRef = useRef(editor);
  const isMountedRef = useRef(true);
  const restoreRafRef = useRef<number | null>(null);

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (restoreRafRef.current != null) {
        cancelAnimationFrame(restoreRafRef.current);
      }
    };
  }, []);

  const { container, visible } = useEditorImageToolbarPosition(editor, disabled);

  const toolbarRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<ToolbarCoords | null>(null);
  const [offscreen, setOffscreen] = useState(false);
  const rafRef = useRef<number | null>(null);

  const imageState = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      if (!isEditorAlive(ed) || !ed.isActive('image')) return null;
      return getSelectedImageAttrs(ed);
    },
  });

  const recompute = useCallback(() => {
    if (!container || !toolbarRef.current) return;

    // `container` có thể là `.rc-image-toolbar-host` (div rỗng ở đáy frame) →
    // lấy đúng khung ảnh để làm mốc, tránh toolbar luôn bám đáy.
    const anchor =
      (container.closest('.rc-image-frame') as HTMLElement | null) ??
      (container.querySelector('.rc-image-frame') as HTMLElement | null) ??
      container;

    const rect = anchor.getBoundingClientRect();
    const scroll =
      (anchor.closest('[data-editor-scroll]') as HTMLElement | null) ?? getScrollParent(anchor);
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

    const visibleTop = Math.max(rect.top, scrollRect.top);
    const visibleBottom = Math.min(rect.bottom, scrollRect.bottom);
    const isOffscreen = visibleBottom <= scrollRect.top + 4 || visibleTop >= scrollRect.bottom - 4;
    setOffscreen(isOffscreen);

    let top: number;
    if (visibleTop - scrollRect.top >= tbHeight + 8) {
      top = visibleTop - tbHeight - 6;
    } else {
      top = scrollRect.top + 4;
    }
    top = Math.max(scrollRect.top + 4, Math.min(top, scrollRect.bottom - tbHeight - 4));

    const minLeft = scrollRect.left + 4;
    const maxLeft = scrollRect.right - tbWidth - 4;
    const centered = rect.left + rect.width / 2 - tbWidth / 2;
    const left = Math.max(minLeft, Math.min(centered, maxLeft));

    setCoords((prev) =>
      prev && Math.abs(prev.top - top) < 0.5 && Math.abs(prev.left - left) < 0.5
        ? prev
        : { top, left },
    );
  }, [container]);

  const scheduleRecompute = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      recompute();
    });
  }, [recompute]);

  useLayoutEffect(() => {
    recompute();
  }, [recompute, imageState, visible]);

  useLayoutEffect(() => {
    recompute();
    const raf = requestAnimationFrame(() => {
      recompute();
    });
    return () => cancelAnimationFrame(raf);
  }, [layoutEpoch, recompute]);

  useEffect(() => {
    if (!container) return;

    window.addEventListener('scroll', scheduleRecompute, true);
    window.addEventListener('resize', scheduleRecompute);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', scheduleRecompute, true);
      window.removeEventListener('resize', scheduleRecompute);
    };
  }, [container, scheduleRecompute]);

  const saveSelection = () => {
    const currentEditor = editorRef.current;
    if (!isEditorAlive(currentEditor)) return;

    savedSelectionRef.current = currentEditor.state.selection.from;
    setSavedImageAttrs(getSelectedImageAttrs(currentEditor));
  };

  const restoreSelection = () => {
    const currentEditor = editorRef.current;
    const from = savedSelectionRef.current;

    if (!isMountedRef.current || from == null || !isEditorAlive(currentEditor)) return;

    const node = currentEditor.state.doc.nodeAt(from);
    if (!node || node.type.name !== 'image') {
      savedSelectionRef.current = null;
      setSavedImageAttrs(null);
      return;
    }

    currentEditor.commands.setNodeSelection(from);
  };

  const openCropModal = () => {
    saveSelection();
    setCropOpen(true);
  };

  const openSettingsModal = () => {
    saveSelection();
    setSettingsOpen(true);
  };

  const handleModalClose = (setter: (open: boolean) => void) => {
    setter(false);

    if (restoreRafRef.current != null) {
      cancelAnimationFrame(restoreRafRef.current);
    }

    restoreRafRef.current = requestAnimationFrame(() => {
      restoreRafRef.current = null;
      restoreSelection();
    });
  };

  if (!isEditorAlive(editor) && !cropOpen && !settingsOpen) return null;

  const showToolbarHost = Boolean(container && imageState) || cropOpen || settingsOpen;
  if (!showToolbarHost) return null;

  const toolbarMounted = Boolean(container && imageState);

  const toolbar =
    toolbarMounted && imageState ? (
      <div
        ref={toolbarRef}
        data-editor-image-floating-toolbar
        className={cn(
          'fixed z-60 flex items-center gap-0.5 rounded-lg border border-gray/15 bg-white px-1 py-0.5 shadow-md transition-opacity',
          modalMode && 'z-110',
          !visible || !coords || offscreen ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
        style={{
          top: coords?.top ?? -9999,
          left: coords?.left ?? -9999,
        }}
        role="toolbar"
        aria-label="Thao tác ảnh"
        onMouseDown={(e) => e.preventDefault()}
      >
        <FloatingToolbarButton
          onClick={() => rotateImage(editor, 'left')}
          disabled={disabled}
          title="Xoay trái"
        >
          <MdRotateLeft className="size-5" />
        </FloatingToolbarButton>
        <FloatingToolbarButton
          onClick={() => rotateImage(editor, 'right')}
          disabled={disabled}
          title="Xoay phải"
        >
          <MdRotateRight className="size-5" />
        </FloatingToolbarButton>

        <ToolbarDivider />

        <FloatingToolbarButton
          onClick={() => flipImage(editor, 'vertical')}
          disabled={disabled}
          title="Lật dọc"
        >
          <LuFlipVertical className="size-5" />
        </FloatingToolbarButton>
        <FloatingToolbarButton
          onClick={() => flipImage(editor, 'horizontal')}
          disabled={disabled}
          title="Lật ngang"
        >
          <LuFlipHorizontal className="size-5" />
        </FloatingToolbarButton>

        <ToolbarDivider />

        <FloatingToolbarButton
          onClick={openCropModal}
          disabled={disabled || !imageState.src}
          title="Cắt ảnh"
        >
          <MdCrop className="size-5" />
        </FloatingToolbarButton>
        <FloatingToolbarButton
          onClick={openSettingsModal}
          disabled={disabled}
          title="Cài đặt ảnh"
        >
          <HiOutlinePhotograph className="size-5" />
        </FloatingToolbarButton>

        <ToolbarDivider />

        <FloatingToolbarButton
          onClick={() => applyTextAlign(editor, 'left')}
          active={imageState.align === 'left'}
          disabled={disabled}
          title="Căn trái"
        >
          <FiAlignLeft className="size-5" />
        </FloatingToolbarButton>
        <FloatingToolbarButton
          onClick={() => applyTextAlign(editor, 'center')}
          active={imageState.align === 'center'}
          disabled={disabled}
          title="Căn giữa"
        >
          <FiAlignCenter className="size-5" />
        </FloatingToolbarButton>
        <FloatingToolbarButton
          onClick={() => applyTextAlign(editor, 'right')}
          active={imageState.align === 'right'}
          disabled={disabled}
          title="Căn phải"
        >
          <FiAlignRight className="size-5" />
        </FloatingToolbarButton>
      </div>
    ) : null;

  const activeImageAttrs = savedImageAttrs ?? imageState;
  const cropSourceSrc = activeImageAttrs
    ? resolveEditorImageCropSource(activeImageAttrs.src, activeImageAttrs.originalSrc)
    : '';

  return (
    <>
      {container && toolbar ? createPortal(toolbar, document.body) : null}

      <EditorImageCropModal
        open={cropOpen}
        onClose={() => handleModalClose(setCropOpen)}
        editor={editor}
        cropSourceSrc={cropSourceSrc}
        initialCropRect={activeImageAttrs?.cropRect ?? null}
      />

      <EditorImageSettingsModal
        open={settingsOpen}
        onClose={() => handleModalClose(setSettingsOpen)}
        editor={editor}
        imageAttrs={activeImageAttrs}
        modalMode={modalMode}
      />
    </>
  );
}
