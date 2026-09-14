'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import type { Editor as TiptapEditor } from '@tiptap/core';

import { Button } from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { cn } from '@/utils/classNames';
import {
  BORDER_STYLE_OPTIONS,
  DEFAULT_BORDER_COLOR,
  type BorderStyleValue,
} from '@/utils/editor/editorBlockBorder';
import { applyCellBorders, type CellBorderMode } from '@/utils/editor/editorTableCellBorder';
import EditorHexColorInput from './EditorHexColorInput';
import Icon from '../Icon';

interface EditorTableBorderControlsProps {
  editor: TiptapEditor;
  disabled?: boolean;
  elevatedOverlay?: boolean;
}

const WIDTH_OPTIONS = [1, 2, 3, 4] as const;

const BORDER_MODES: { mode: CellBorderMode; label: string; src: string }[] = [
  { mode: 'top', label: 'Viền trên', src: '/images/icons/icon_border_top.webp' },
  { mode: 'bottom', label: 'Viền dưới', src: '/images/icons/icon_border_bottom.webp' },
  { mode: 'left', label: 'Viền trái', src: '/images/icons/icon_border_left.webp' },
  { mode: 'right', label: 'Viền phải', src: '/images/icons/icon_border_right.webp' },
  { mode: 'none', label: 'Không viền', src: '/images/icons/icon_no_border.webp' },
  { mode: 'all', label: 'Tất cả viền', src: '/images/icons/icon_border_all.webp' },
  { mode: 'outside', label: 'Viền ngoài', src: '/images/icons/icon_border_outsite.webp' },
  { mode: 'inside', label: 'Viền trong', src: '/images/icons/icon_border_inside.webp' },
  { mode: 'insideH', label: 'Viền ngang trong', src: '/images/icons/icon_border_horizontal.webp' },
  { mode: 'insideV', label: 'Viền dọc trong', src: '/images/icons/icon_border_vertical.webp' },
];

export default function EditorTableBorderControls({
  editor,
  disabled = false,
  elevatedOverlay = false,
}: EditorTableBorderControlsProps) {
  const [width, setWidth] = useState<number>(1);
  const [style, setStyle] = useState<BorderStyleValue>('solid');
  const [color, setColor] = useState<string>(DEFAULT_BORDER_COLOR);

  const apply = (mode: CellBorderMode) => {
    applyCellBorders(editor, mode, { width, style, color });
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
            className={cn('z-70 min-w-64 p-4', elevatedOverlay && 'z-110')}
            ariaLabel="Viền bảng"
            trigger={({ triggerProps }) => (
              <Button
                type="button"
                variant="transparent"
                disabled={disabled}
                onMouseDown={(e) => e.preventDefault()}
                {...triggerProps}
                title="Viền bảng"
                className="h-auto rounded p-1.5 text-black enabled:hover:bg-gray/15"
              >
                <Icon
                  icon="/images/icons/icon_border.webp"
                  className="size-6 object-contain block"
                />
              </Button>
            )}
          >
            <div
              className="space-y-4"
              onMouseDown={(e) => e.preventDefault()}
            >
              <div>
                <p className="mb-1.5 text-xs font-medium text-gray">Áp dụng viền</p>
                <div className="grid grid-cols-5 gap-1">
                  {BORDER_MODES.map(({ mode, label, src }) => (
                    <Button
                      key={mode}
                      type="button"
                      variant="transparent"
                      title={label}
                      aria-label={label}
                      onClick={() => apply(mode)}
                      className="flex items-center justify-center rounded p-1 h-auto text-black hover:bg-primary-light hover:text-primary"
                    >
                      <Icon
                        icon={src}
                        className={cn(
                          'size-6 object-contain block transition-opacity duration-300',
                        )}
                      />
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium text-gray">Độ dày</p>
                <div className="flex flex-wrap gap-1">
                  {WIDTH_OPTIONS.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWidth(w)}
                      className={cn(
                        'rounded px-2 py-1 text-xs hover:bg-gray/10',
                        width === w ? 'bg-primary-light text-primary' : 'text-black',
                      )}
                    >
                      {w} px
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
                      onClick={() => setStyle(option.value)}
                      className={cn(
                        'rounded px-2 py-1 text-xs hover:bg-gray/10',
                        style === option.value ? 'bg-primary-light text-primary' : 'text-black',
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
                    color={color}
                    onChange={setColor}
                  />
                </div>
                <EditorHexColorInput
                  value={color}
                  onChange={setColor}
                  className="mt-2"
                />
              </div>
            </div>
          </Dropdown>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">Viền bảng</TooltipContent>
    </Tooltip>
  );
}
