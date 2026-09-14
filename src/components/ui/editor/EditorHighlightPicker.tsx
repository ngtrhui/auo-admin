'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { Button } from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { cn } from '@/utils/classNames';
import { getToolbarState } from '@/utils/editor/editorToolbar';
import Icon from '../Icon';

const HIGHLIGHT_PRESETS = [
  { label: 'Vàng', color: '#FEF08A' },
  { label: 'Xanh lá', color: '#BBF7D0' },
  { label: 'Xanh dương', color: '#BFDBFE' },
  { label: 'Hồng', color: '#FBCFE8' },
  { label: 'Xám', color: '#E5E7EB' },
] as const;

interface EditorHighlightPickerProps {
  editor: TiptapEditor;
  disabled?: boolean;
  modalMode?: boolean;
}

export default function EditorHighlightPicker({
  editor,
  disabled = false,
  modalMode = false,
}: EditorHighlightPickerProps) {
  const toolbar = useEditorState({
    editor,
    selector: ({ editor: ed }) => getToolbarState(ed),
  });

  const [pickerColor, setPickerColor] = useState(
    toolbar.highlightColor ?? HIGHLIGHT_PRESETS[0].color,
  );

  const applyHighlight = (color: string) => {
    setPickerColor(color);
    editor.chain().focus().setHighlight({ color }).run();
  };

  const toggleHighlight = () => {
    if (toolbar.highlight && toolbar.highlightColor) {
      editor.chain().focus().toggleHighlight({ color: toolbar.highlightColor }).run();
      return;
    }
    editor.chain().focus().toggleHighlight({ color: pickerColor }).run();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Dropdown
            usePortal
            align="left"
            placement="bottom"
            containerClassName="shrink-0"
            className={cn('min-w-44 p-2', modalMode && 'z-110')}
            ariaLabel="Highlight văn bản"
            trigger={({ triggerProps }) => (
              <Button
                type="button"
                variant="transparent"
                disabled={disabled}
                onMouseDown={(e) => e.preventDefault()}
                {...triggerProps}
                onClick={(e) => {
                  if (toolbar.highlightColor) {
                    setPickerColor(toolbar.highlightColor);
                  }
                  triggerProps.onClick?.(e);
                }}
                title="Highlight"
                className={cn(
                  'h-auto rounded p-2 text-black enabled:hover:bg-gray/20',
                  toolbar.highlight && 'bg-primary-light text-primary',
                )}
              >
                <Icon
                  icon="/images/icons/icon_highlighter.webp"
                  className={cn('size-6 object-contain block', toolbar.highlight && 'bg-primary')}
                />
              </Button>
            )}
          >
            <div
              className="space-y-2"
              onMouseDown={(e) => e.preventDefault()}
            >
              <p className="px-1 text-xs font-medium text-gray">Màu highlight</p>
              <div className="flex flex-wrap gap-1.5 px-1">
                {HIGHLIGHT_PRESETS.map((preset) => (
                  <button
                    key={preset.color}
                    type="button"
                    title={preset.label}
                    aria-label={preset.label}
                    onClick={() => applyHighlight(preset.color)}
                    className={cn(
                      'size-7 rounded border border-gray/20 transition-shadow hover:ring-2 hover:ring-primary/30',
                      toolbar.highlightColor === preset.color && 'ring-2 ring-primary',
                    )}
                    style={{ backgroundColor: preset.color }}
                  />
                ))}
              </div>
              <div className="[&_.react-colorful]:h-32 [&_.react-colorful]:w-full">
                <HexColorPicker
                  color={pickerColor}
                  onChange={applyHighlight}
                />
              </div>
              <div className="flex gap-1 px-1">
                <Button
                  type="button"
                  variant="transparent"
                  className="h-auto flex-1 rounded px-2 py-1.5 text-xs enabled:hover:bg-gray/10"
                  onClick={toggleHighlight}
                >
                  {toolbar.highlight ? 'Bật/tắt' : 'Áp dụng'}
                </Button>
                <Button
                  type="button"
                  variant="transparent"
                  className="h-auto flex-1 rounded px-2 py-1.5 text-xs enabled:hover:bg-gray/10"
                  onClick={() => editor.chain().focus().unsetHighlight().run()}
                  disabled={!toolbar.highlight}
                >
                  Bỏ highlight
                </Button>
              </div>
            </div>
          </Dropdown>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">Highlight</TooltipContent>
    </Tooltip>
  );
}
