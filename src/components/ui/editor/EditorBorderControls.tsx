'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';

import { Button } from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { cn } from '@/utils/classNames';
import {
  applyBlockBorder,
  BORDER_RADIUS_OPTIONS,
  BORDER_STYLE_OPTIONS,
  BORDER_WIDTH_OPTIONS,
  clearBlockBorder,
  DEFAULT_BORDER_COLOR,
  getActiveBlockBorder,
  hasActiveBorder,
  type BorderRadiusValue,
  type BorderStyleValue,
  type BorderWidthValue,
} from '@/utils/editor/editorBlockBorder';
import { applyImageBorder, clearImageBorder } from '@/utils/editor/editorImageManipulations';
import { getToolbarState } from '@/utils/editor/editorToolbar';
import EditorHexColorInput from './EditorHexColorInput';
import Icon from '../Icon';

interface EditorBorderControlsProps {
  editor: TiptapEditor;
  disabled?: boolean;
  modalMode?: boolean;
}

export default function EditorBorderControls({
  editor,
  disabled = false,
  modalMode = false,
}: EditorBorderControlsProps) {
  const toolbar = useEditorState({
    editor,
    selector: ({ editor: ed }) => getToolbarState(ed),
  });

  const [pickerColor, setPickerColor] = useState(toolbar.borderColor ?? DEFAULT_BORDER_COLOR);

  const isDisabled = disabled || toolbar.isInTable;

  const applyBorder = (partial: {
    borderWidth?: BorderWidthValue | null;
    borderStyle?: BorderStyleValue | null;
    borderColor?: string | null;
    borderRadius?: BorderRadiusValue | null;
  }) => {
    if (toolbar.isImageActive) {
      applyImageBorder(editor, partial);
      return;
    }
    applyBlockBorder(editor, partial);
  };

  const clearBorder = () => {
    if (toolbar.isImageActive) {
      clearImageBorder(editor);
      return;
    }
    clearBlockBorder(editor);
  };

  const activeBorder = toolbar.isImageActive
    ? {
        borderWidth: toolbar.borderWidth,
        borderStyle: toolbar.borderStyle,
        borderColor: toolbar.borderColor,
        borderRadius: toolbar.borderRadius,
      }
    : getActiveBlockBorder(editor);

  const borderActive = hasActiveBorder(activeBorder);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Dropdown
            usePortal
            align="left"
            placement="bottom"
            containerClassName="shrink-0"
            className={cn('min-w-60 p-4', modalMode && 'z-110')}
            ariaLabel="Viền và bo góc"
            trigger={({ triggerProps }) => (
              <Button
                type="button"
                variant="transparent"
                disabled={isDisabled}
                onMouseDown={(e) => e.preventDefault()}
                {...triggerProps}
                onClick={(e) => {
                  setPickerColor(toolbar.borderColor ?? DEFAULT_BORDER_COLOR);
                  triggerProps.onClick?.(e);
                }}
                title="Viền và bo góc"
                className={cn(
                  'h-auto rounded p-2 text-black enabled:hover:bg-gray/20 disabled:opacity-50',
                  borderActive && 'bg-primary-light text-primary',
                )}
              >
                <Icon
                  icon="/images/icons/icon_border.webp"
                  className={cn(
                    'size-6 object-contain block transition-opacity duration-300',
                    borderActive && 'bg-primary',
                  )}
                />
              </Button>
            )}
          >
            <div
              className="space-y-4"
              onMouseDown={(e) => e.preventDefault()}
            >
              <div>
                <p className="mb-1.5 text-xs font-medium text-gray">Độ dày viền</p>
                <div className="flex flex-wrap gap-1">
                  {BORDER_WIDTH_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        applyBorder({
                          borderWidth: option.value === 'none' ? null : option.value,
                          borderStyle:
                            option.value === 'none' ? null : (activeBorder.borderStyle ?? 'solid'),
                          borderColor:
                            option.value === 'none'
                              ? null
                              : (activeBorder.borderColor ?? pickerColor),
                        })
                      }
                      className={cn(
                        'rounded px-2 py-1 text-xs hover:bg-gray/10',
                        (activeBorder.borderWidth ?? 'none') === option.value ||
                          (!activeBorder.borderWidth && option.value === 'none')
                          ? 'bg-primary-light text-primary'
                          : 'text-black',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium text-gray">Kiểu viền</p>
                <div className="flex flex-wrap gap-1">
                  {BORDER_STYLE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        applyBorder({
                          borderStyle: option.value,
                          borderWidth: activeBorder.borderWidth ?? '1',
                          borderColor: activeBorder.borderColor ?? pickerColor,
                        })
                      }
                      className={cn(
                        'rounded px-2 py-1 text-xs hover:bg-gray/10',
                        (activeBorder.borderStyle ?? 'solid') === option.value
                          ? 'bg-primary-light text-primary'
                          : 'text-black',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium text-gray">Màu viền</p>
                <div className="[&_.react-colorful]:h-28 [&_.react-colorful]:w-full">
                  <HexColorPicker
                    color={pickerColor}
                    onChange={(color) => {
                      setPickerColor(color);
                      if (activeBorder.borderWidth) {
                        applyBorder({ borderColor: color });
                      }
                    }}
                  />
                </div>
                <EditorHexColorInput
                  value={pickerColor}
                  onChange={(hex) => {
                    setPickerColor(hex);
                    if (activeBorder.borderWidth) {
                      applyBorder({ borderColor: hex });
                    }
                  }}
                  className="mt-2"
                />
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium text-gray">Bo góc</p>
                <div className="flex flex-wrap gap-1">
                  {BORDER_RADIUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        applyBorder({
                          borderRadius: option.value === 'none' ? null : option.value,
                        })
                      }
                      className={cn(
                        'rounded px-2 py-1 text-xs hover:bg-gray/10',
                        (activeBorder.borderRadius ?? 'none') === option.value ||
                          (!activeBorder.borderRadius && option.value === 'none')
                          ? 'bg-primary-light text-primary'
                          : 'text-black',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                variant="transparent"
                className="h-auto w-full rounded px-2 py-1.5 text-xs enabled:hover:bg-gray/10"
                onClick={clearBorder}
                disabled={!borderActive}
              >
                Xóa viền
              </Button>
            </div>
          </Dropdown>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">Viền và bo góc</TooltipContent>
    </Tooltip>
  );
}
