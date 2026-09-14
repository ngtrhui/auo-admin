'use client';

import { useState } from 'react';

import { cn } from '@/utils/classNames';

const HEX_PATTERN = /^#([0-9a-fA-F]{6})$/;

interface EditorHexColorInputProps {
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
  className?: string;
}

/** Ô nhập mã hex (#RRGGBB) đồng bộ hai chiều với color picker. */
export default function EditorHexColorInput({
  value,
  onChange,
  disabled = false,
  className,
}: EditorHexColorInputProps) {
  const [draft, setDraft] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(value);
  }

  const commit = (raw: string) => {
    const normalized = raw.trim().startsWith('#') ? raw.trim() : `#${raw.trim()}`;
    if (HEX_PATTERN.test(normalized)) {
      onChange(normalized.toUpperCase());
    } else {
      setDraft(value);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border border-gray/25 px-2 py-1',
        disabled && 'opacity-50',
        className,
      )}
    >
      <span
        className="size-5 shrink-0 rounded border border-gray/20"
        style={{ backgroundColor: HEX_PATTERN.test(draft) ? draft : value }}
        aria-hidden
      />
      <input
        type="text"
        value={draft}
        disabled={disabled}
        spellCheck={false}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit((e.target as HTMLInputElement).value);
          }
        }}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="#000000"
        maxLength={7}
        className="w-full min-w-0 bg-transparent text-xs uppercase text-black outline-none placeholder:text-gray/60"
        aria-label="Mã màu hex"
      />
    </div>
  );
}
