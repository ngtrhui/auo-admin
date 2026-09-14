'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';

import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Heading from '@tiptap/extension-heading';
import { TableKit } from '@tiptap/extension-table';
import { redoDepth, undoDepth } from '@tiptap/pm/history';
import { Button } from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import { Select } from '@/components/ui/Select';
import { FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify } from 'react-icons/fi';
import { HiCheck } from 'react-icons/hi';
import EditorImageInsert from './EditorImageInsert';
import EditorImageFloatingToolbar from './EditorImageFloatingToolbar';
import EditorLinkInsert from './EditorLinkInsert';
import EditorHighlightPicker from './EditorHighlightPicker';
import EditorBorderControls from './EditorBorderControls';
import EditorTableInsert from './EditorTableInsert';
import EditorTableFloatingToolbar from './EditorTableFloatingToolbar';
import { EditorLink, EditorLinkUi } from '@/utils/editor/editorLinkExtension';
import { EDITOR_LINK_HTML_ATTRIBUTES } from '@/utils/editor/editorLink';
import { EditorImage } from '@/utils/editor/editorImage';
import { MdFormatLineSpacing, MdZoomInMap, MdZoomOutMap } from 'react-icons/md';
import { cn } from '@/utils/classNames';
import { BlockBorder } from '@/utils/editor/editorBlockBorder';
import { EditorTableView, TableCellBorder } from '@/utils/editor/editorTableCellBorder';
import { applyBlockType, applyTextAlign, getToolbarState } from '@/utils/editor/editorToolbar';
import { formatEditorHtml } from '@/utils/editor/editorHtmlFormat';
import {
  applyLineHeight,
  LINE_HEIGHT_OPTIONS,
  BlockLineHeight,
} from '@/utils/editor/editorSpacing';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import {
  BiBold,
  BiItalic,
  BiListUl,
  BiListOl,
  BiUndo,
  BiRedo,
  BiUnderline,
  BiCode,
} from 'react-icons/bi';
import { BsBlockquoteLeft } from 'react-icons/bs';
import {
  extractImageFilesFromDataTransfer,
  stripImagesFromHtml,
} from '@/utils/editor/editorPastePolicy';
import { getEditorOverlayZIndex } from '@/utils/editor/editorOverlayLayers';

const EditorHtmlSource = dynamic(() => import('./EditorHtmlSource'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-white px-4 text-sm text-gray">
      Đang tải trình soạn mã nguồn...
    </div>
  ),
});

const ToolbarDivider = () => (
  <div
    className="h-6 w-px bg-gray mx-1"
    aria-hidden
  />
);

const ToolbarButton = ({
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
}) => (
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
            'h-auto rounded p-2 text-black enabled:hover:bg-gray/20',
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

export interface EditorProps {
  value?: string;
  onChange?: (value: string) => void;
  onPendingContentImage?: (blobUrl: string, file: File) => void;
  minHeight?: string;
  maxHeight?: string;
  disabled?: boolean;
  className?: string;
  modalMode?: boolean;
}

type EditorViewProps = EditorProps & {
  editor: TiptapEditor;
};

function EditorView({
  editor,
  onChange,
  minHeight = '600px',
  maxHeight = '600px',
  disabled = false,
  modalMode = false,
  className,
}: EditorViewProps) {
  const toolbar = useEditorState({
    editor,
    selector: ({ editor: ed }) => getToolbarState(ed),
  });

  const [pickerColor, setPickerColor] = useState('#000000');
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  const elevated = modalMode || isFullscreen;
  const elevatedPopoverZIndex = getEditorOverlayZIndex(elevated);
  const elevatedOverlayClass = elevated ? 'z-110' : undefined;
  const layoutEpoch = isFullscreen ? 'fullscreen' : 'embedded';

  useEffect(() => {
    if (!isFullscreen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsFullscreen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  const toggleSourceMode = () => {
    if (isSourceMode) {
      editor.commands.setContent(sourceHtml, { emitUpdate: true });
      setIsSourceMode(false);
      return;
    }

    setSourceHtml(formatEditorHtml(editor.getHTML()));
    setIsSourceMode(true);
  };

  const handleSourceChange = (html: string) => {
    setSourceHtml(html);
    onChange?.(html);
  };

  const applyTextColor = (color: string) => {
    setPickerColor(color);
    editor.chain().focus().setColor(color).run();
  };

  const canUndo = undoDepth(editor.state) > 0;
  const canRedo = redoDepth(editor.state) > 0;

  return (
    <div
      className={cn(
        'flex w-full min-w-0 max-w-full flex-col overflow-hidden rounded-lg border border-gray/20 bg-transparent transition-all',
        'focus-within:border-primary focus-within:ring-1 focus-within:ring-primary focus-within:shadow-[2px_2px_4px_0px_#0063FF33]',
        disabled && 'cursor-not-allowed opacity-50',
        isFullscreen && 'fixed inset-0 z-100 max-h-none rounded-none border-gray/20 bg-white',
        className,
      )}
      style={isFullscreen ? { minHeight: '100dvh', maxHeight: '100dvh' } : { minHeight, maxHeight }}
    >
      <div className="sticky top-0 z-20 shrink-0 bg-white">
        <div className="flex flex-wrap items-center gap-x-0.5 gap-y-1 border-b border-gray/20 bg-gray-50 px-2 py-1">
          <Select
            value={toolbar.blockType}
            options={[
              { label: 'Đoạn', value: 'paragraph' },
              { label: 'Tiêu đề 2', value: 'h2' },
              { label: 'Tiêu đề 3', value: 'h3' },
              { label: 'Tiêu đề 4', value: 'h4' },
              { label: 'Tiêu đề 5', value: 'h5' },
            ]}
            onChange={(value) => applyBlockType(editor, value as typeof toolbar.blockType)}
            className="h-10"
            containerClassName="max-w-40"
            popoverZIndex={elevatedPopoverZIndex}
          />

          <ToolbarDivider />

          <ToolbarButton
            onClick={toggleSourceMode}
            active={isSourceMode}
            disabled={disabled}
            title={isSourceMode ? 'Chuyển sang trình soạn thảo' : 'Chuyển sang chế độ mã nguồn'}
          >
            <BiCode className="size-5" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={disabled || !canUndo}
            title="Hoàn tác"
          >
            <BiUndo className="size-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={disabled || !canRedo}
            title="Làm lại (sau khi đã hoàn tác)"
          >
            <BiRedo className="size-5" />
          </ToolbarButton>

          <ToolbarDivider />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={toolbar.bold}
            disabled={disabled}
            title="In đậm"
          >
            <BiBold className="size-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={toolbar.italic}
            disabled={disabled}
            title="In nghiêng"
          >
            <BiItalic className="size-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={toolbar.underline}
            disabled={disabled}
            title="Gạch dưới"
          >
            <BiUnderline className="size-5" />
          </ToolbarButton>

          <ToolbarDivider />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={toolbar.bulletList}
            disabled={disabled}
            title="Danh sách gạch đầu dòng"
          >
            <BiListUl className="size-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={toolbar.orderedList}
            disabled={disabled}
            title="Danh sách đánh số"
          >
            <BiListOl className="size-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={toolbar.blockquote}
            disabled={disabled}
            title="Blockquote"
          >
            <BsBlockquoteLeft className="size-5" />
          </ToolbarButton>

          <ToolbarDivider />
          <ToolbarButton
            onClick={() => applyTextAlign(editor, 'left')}
            active={toolbar.textAlign === 'left'}
            disabled={disabled}
            title="Căn lề trái"
          >
            <FiAlignLeft className="size-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => applyTextAlign(editor, 'center')}
            active={toolbar.textAlign === 'center'}
            disabled={disabled}
            title="Căn giữa"
          >
            <FiAlignCenter className="size-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => applyTextAlign(editor, 'right')}
            active={toolbar.textAlign === 'right'}
            disabled={disabled}
            title="Căn lề phải"
          >
            <FiAlignRight className="size-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => applyTextAlign(editor, 'justify')}
            active={toolbar.textAlign === 'justify'}
            disabled={disabled || toolbar.isImageActive}
            title="Căn đều"
          >
            <FiAlignJustify className="size-5" />
          </ToolbarButton>

          <ToolbarDivider />

          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Dropdown
                  usePortal
                  align="left"
                  placement="bottom"
                  containerClassName="shrink-0"
                  className={cn('min-w-32', elevatedOverlayClass)}
                  ariaLabel="Khoảng cách dòng"
                  trigger={({ triggerProps }) => (
                    <Button
                      type="button"
                      variant="transparent"
                      disabled={disabled}
                      onMouseDown={(e) => e.preventDefault()}
                      {...triggerProps}
                      title="Khoảng cách dòng"
                      className={cn(
                        'h-auto rounded p-2 text-black enabled:hover:bg-gray/20',
                        toolbar.lineHeight !== 'default' && 'bg-primary-light text-primary',
                      )}
                    >
                      <MdFormatLineSpacing className="size-5" />
                    </Button>
                  )}
                >
                  {LINE_HEIGHT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitem"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyLineHeight(editor, option.value)}
                      className={cn(
                        'flex w-full cursor-pointer font-medium items-center justify-between gap-3 px-3 py-2 text-sm text-black hover:bg-gray/10',
                        toolbar.lineHeight === option.value && 'bg-primary-light text-primary',
                      )}
                    >
                      <span>{option.label}</span>
                      {toolbar.lineHeight === option.value ? (
                        <HiCheck
                          className="size-4 shrink-0"
                          aria-hidden
                        />
                      ) : null}
                    </button>
                  ))}
                </Dropdown>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">Khoảng cách dòng</TooltipContent>
          </Tooltip>

          <ToolbarDivider />

          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Dropdown
                  usePortal
                  align="left"
                  placement="bottom"
                  containerClassName="shrink-0"
                  className={cn('p-3', elevatedOverlayClass)}
                  ariaLabel="Chọn màu chữ"
                  trigger={({ triggerProps }) => (
                    <button
                      type="button"
                      disabled={disabled}
                      onMouseDown={(e) => e.preventDefault()}
                      {...triggerProps}
                      onClick={(e) => {
                        setPickerColor(toolbar.textColor);
                        triggerProps.onClick?.(e);
                      }}
                      title="Màu sắc"
                      aria-label="Chọn màu chữ"
                      className={cn(
                        'h-8 w-8 shrink-0 cursor-pointer rounded border border-gray/20 shadow-sm transition-shadow',
                        'hover:ring-2 hover:ring-primary/30 focus:outline-none focus:ring-2 focus:ring-primary',
                        disabled && 'cursor-not-allowed opacity-40',
                      )}
                      style={{ backgroundColor: toolbar.textColor }}
                    />
                  )}
                >
                  <div
                    className="[&_.react-colorful]:h-40 [&_.react-colorful]:w-50"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <HexColorPicker
                      color={pickerColor}
                      onChange={applyTextColor}
                    />
                  </div>
                </Dropdown>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">Màu sắc</TooltipContent>
          </Tooltip>

          <EditorHighlightPicker
            editor={editor}
            disabled={disabled}
            modalMode={elevated}
          />

          <ToolbarDivider />

          <EditorBorderControls
            editor={editor}
            disabled={disabled}
            modalMode={elevated}
          />

          <EditorTableInsert
            editor={editor}
            disabled={disabled}
            modalMode={elevated}
          />

          <ToolbarDivider />

          <EditorLinkInsert
            editor={editor}
            disabled={disabled}
          />
          <EditorImageInsert
            editor={editor}
            disabled={disabled}
            elevatedOverlay={elevated}
          />

          <ToolbarButton
            onClick={() => setIsFullscreen((prev) => !prev)}
            active={isFullscreen}
            disabled={disabled}
            title={isFullscreen ? 'Thu nhỏ editor (Esc)' : 'Phóng to toàn màn hình'}
          >
            {isFullscreen ? (
              <MdZoomInMap className="size-5" />
            ) : (
              <MdZoomOutMap className="size-5" />
            )}
          </ToolbarButton>
        </div>
      </div>

      <div
        ref={contentScrollRef}
        data-editor-scroll
        className={cn(
          'min-h-0 min-w-0 w-full flex-1 overscroll-contain',
          isSourceMode
            ? 'flex flex-col overflow-hidden'
            : 'overflow-auto overflow-x-auto scrollbar',
        )}
      >
        {isSourceMode ? (
          <EditorHtmlSource
            value={sourceHtml}
            onChange={handleSourceChange}
            disabled={disabled}
          />
        ) : (
          <>
            <EditorContent editor={editor} />
            <EditorImageFloatingToolbar
              editor={editor}
              disabled={disabled}
              modalMode={elevated}
              layoutEpoch={layoutEpoch}
            />
            <EditorTableFloatingToolbar
              editor={editor}
              disabled={disabled}
              elevatedOverlay={elevated}
              layoutEpoch={layoutEpoch}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function Editor({
  value = '',
  onChange,
  onPendingContentImage: _onPendingContentImage,
  ...rest
}: EditorProps) {
  // Giữ prop API cho BlogForm; paste/drop ảnh không còn tạo blob pending.
  void _onPendingContentImage;

  // Debounce serialize: getHTML() nặng khi nội dung dài/ảnh base64. Chỉ serialize
  // tối đa 1 lần mỗi cửa sổ ~300ms thay vì mỗi keystroke, giảm cả chi phí serialize
  // lẫn cascade re-render qua RHF Controller.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const pendingEditorRef = useRef<TiptapEditor | null>(null);
  const changeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushChange = useCallback(() => {
    if (changeTimerRef.current) {
      clearTimeout(changeTimerRef.current);
      changeTimerRef.current = null;
    }
    const ed = pendingEditorRef.current;
    pendingEditorRef.current = null;
    if (ed && !ed.isDestroyed) onChangeRef.current?.(ed.getHTML());
  }, []);

  const scheduleChange = useCallback(
    (ed: TiptapEditor) => {
      pendingEditorRef.current = ed;
      if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
      changeTimerRef.current = setTimeout(flushChange, 300);
    },
    [flushChange],
  );

  useEffect(
    () => () => {
      if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
    },
    [],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        link: false,
        underline: false,
      }),
      EditorLink.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { ...EDITOR_LINK_HTML_ATTRIBUTES },
      }),
      EditorLinkUi,
      EditorImage,
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Heading,
      BlockLineHeight,
      BlockBorder,
      TableKit.configure({
        table: {
          resizable: true,
          View: EditorTableView,
          renderWrapper: true,
          cellMinWidth: 50,
          handleWidth: 6,
          lastColumnResizable: true,
          HTMLAttributes: {
            class: 'rc-table border-separate border-spacing-0',
          },
        },
        tableCell: {
          HTMLAttributes: {
            class: 'rc-table-cell border-b border-r border-[#E3E3E3] px-3 py-2',
          },
        },
        tableHeader: {
          HTMLAttributes: {
            class:
              'rc-table-header border-b border-r border-[#E3E3E3] bg-primary-light px-3 py-2 font-medium text-primary',
          },
        },
      }),
      TableCellBorder,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'blockquote', 'tableCell', 'tableHeader'],
      }),
    ],
    immediatelyRender: true,
    content: value,
    onUpdate: ({ editor: ed }) => {
      scheduleChange(ed);
    },
    onBlur: ({ editor: ed }) => {
      pendingEditorRef.current = ed;
      flushChange();
    },
    editorProps: {
      transformPastedHTML: (html) => stripImagesFromHtml(html),
      handlePaste: (_view, event) => {
        const files = extractImageFilesFromDataTransfer(event.clipboardData);
        if (!files.length) return false;

        event.preventDefault();
        return true;
      },
      handleDrop: (_view, event) => {
        const files = extractImageFilesFromDataTransfer(event.dataTransfer);
        if (!files.length) return false;

        event.preventDefault();
        return true;
      },
      attributes: {
        class: cn(
          'tiptap min-h-[120px] min-w-0 max-w-full break-words px-4 py-3 text-base text-black outline-none',
          '[&_p.is-editor-empty:first-child::before]:text-gray [&_p.is-editor-empty:first-child::before]:pointer-events-none',
          '[&_strong]:font-bold [&_em]:italic [&_u]:underline',
          '[&_code]:bg-gray/80 [&_code]:break-all [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:bg-gray/80 [&_pre]:p-3 [&_pre]:rounded',
          '[&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-primary',
          '[&_h3]:text-base [&_h3]:font-bold',
          '[&_p]:text-sm [&_p]:leading-relaxed',
          '[&_ul]:my-2 [&_ul]:text-sm [&_ul]:list-disc [&_ul]:pl-6',
          '[&_ol]:my-2 [&_ol]:text-sm [&_ol]:list-decimal [&_ol]:pl-6',
          '[&_li]:my-0.5',
          '[&_li>p]:m-0',
          '[&_li]:pl-1',
          '[&_ul_ul]:list-[circle] [&_ul_ul_ul]:list-[square]',
          '[&_blockquote]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:text-gray [&_blockquote]:italic',
          '[&_mark]:rounded-sm [&_mark]:px-0.5',
          '[&_.tableWrapper]:my-3 [&_.tableWrapper]:w-full [&_.tableWrapper]:max-w-full [&_.tableWrapper]:overflow-x-auto [&_.tableWrapper]:rounded-lg [&_.tableWrapper]:border [&_.tableWrapper]:border-[#E3E3E3]',
          '[&_td]:relative [&_th]:relative',
          '[&_.column-resize-handle]:pointer-events-none [&_.column-resize-handle]:!bg-transparent [&_.column-resize-handle]:!opacity-0',
          '[&.resize-cursor]:cursor-col-resize',
          '[&.resize-cursor_td]:cursor-col-resize [&.resize-cursor_th]:cursor-col-resize',
          '[&_table]:w-full [&_table]:min-w-full [&_table]:table-fixed [&_table]:border-separate [&_table]:border-spacing-0',
          '[&_th]:border-b [&_th]:border-r [&_th]:border-[#E3E3E3] [&_th]:bg-primary-light [&_th]:px-3 [&_th]:py-2 [&_th]:font-medium [&_th]:text-primary',
          '[&_th.selectedCell]:!bg-primary-light [&_th.column-resize-dragging]:!bg-primary-light',
          '[&.resize-cursor_th.selectedCell]:!bg-primary-light',
          '[&_td]:border-b [&_td]:border-r [&_td]:border-[#E3E3E3] [&_td]:px-3 [&_td]:py-2',
          '[&_td.selectedCell]:bg-black/10 [&_td.column-resize-dragging]:bg-transparent',
          '[&_th.rc-table-no-r]:!border-r-0 [&_td.rc-table-no-r]:!border-r-0',
          '[&_th.rc-table-no-b]:!border-b-0 [&_td.rc-table-no-b]:!border-b-0',
          '[&_.rc-table-corner-tl]:overflow-hidden [&_.rc-table-corner-tl]:rounded-tl-lg',
          '[&_.rc-table-corner-tr]:overflow-hidden [&_.rc-table-corner-tr]:rounded-tr-lg',
          '[&_.rc-table-corner-bl]:overflow-hidden [&_.rc-table-corner-bl]:rounded-bl-lg',
          '[&_.rc-table-corner-br]:overflow-hidden [&_.rc-table-corner-br]:rounded-br-lg',
          '[&_.selectedCell:after]:hidden',
          '[&_a]:text-primary [&_a]:underline',
          '[&_.rc-link-active]:rounded-sm [&_.rc-link-active]:bg-primary/10 [&_.rc-link-active]:ring-1 [&_.rc-link-active]:ring-primary/30',
          '[&_.rc-image-wrapper]:max-w-full',
          '[&_.rc-image-node]:pointer-events-none',
          '[&_.rc-image-frame]:cursor-pointer [&_.rc-image-frame_img]:cursor-pointer',
          '[&_.rc-image-node.ProseMirror-selectednode]:outline-none',
        ),
      },
    },
  });

  if (!editor) return null;

  return (
    <EditorView
      editor={editor}
      onChange={onChange}
      {...rest}
    />
  );
}
