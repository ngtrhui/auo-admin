"use client";

import type { ChangeEvent } from "react";

interface PriceInputProps {
  value: string;
  label: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

export default function PriceInput({
  value,
  label,
  disabled,
  onChange,
}: PriceInputProps) {
  return (
    <label className="mx-auto flex w-24 items-center rounded-lg border border-slate-200 bg-white px-2.5 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
      <input
        aria-label={label}
        className="w-full min-w-0 bg-transparent py-2 text-right text-sm font-semibold tabular-nums text-slate-800 outline-none disabled:cursor-not-allowed disabled:text-slate-400"
        disabled={disabled}
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value.replace(/\D/g, ""))
        }
      />
      <span className="ml-1 text-xs font-medium text-slate-400">k</span>
    </label>
  );
}
