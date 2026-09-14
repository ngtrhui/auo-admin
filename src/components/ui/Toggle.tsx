"use client";

import React from "react";
import { cn } from "@/utils/classNames";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  labelClassName?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  className,
  labelClassName,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        /* w-fit: không giãn full hàng trong flex column — chỉ bấm được trên track + chữ label */
        "inline-flex w-fit max-w-full shrink-0 gap-3 items-center cursor-pointer text-left",
        disabled && "opacity-60 cursor-not-allowed",
        className,
      )}
    >
      <span
        className={cn(
          "relative inline-flex h-6 w-12 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          checked ? "bg-primary" : "bg-[#E3E3E3]",
          disabled && "cursor-not-allowed",
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute top-px size-[18px] rounded-full bg-white shadow ring-0 transition-transform",
            checked ? "translate-x-[25px] left-0" : "translate-x-0.5 left-0",
          )}
        />
      </span>
      {label && (
        <span className={cn("text-xs font-bold text-left text-black", labelClassName)}>{label}</span>
      )}
    </button>
  );
};

Toggle.displayName = "Toggle";
