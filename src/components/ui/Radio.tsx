"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "@/utils/classNames";

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  error?: string;
  containerClassName?: string;
  /** Class cho vòng tròn viền (mặc định h-[18px] w-[18px]). Ví dụ nhỏ hơn: `h-4 w-4` */
  indicatorClassName?: string;
  /** Class cho chấm bên trong khi chọn (mặc định h-2 w-2). Nên scale theo indicator, ví dụ `h-1.5 w-1.5` */
  indicatorDotClassName?: string;
}

const Radio = forwardRef(function Radio(
  {
    id,
    label,
    error,
    className,
    containerClassName,
    indicatorClassName,
    indicatorDotClassName,
    disabled,
    checked,
    defaultChecked,
    ...props
  }: RadioProps,
  ref: Ref<HTMLInputElement>
) {
  const uid = useId();
  const inputId = id ?? uid;

  return (
    <div
      className={cn(
        "inline-flex flex-col gap-1",
        disabled && "opacity-60",
        containerClassName
      )}
    >
      <label
        htmlFor={inputId}
        className={cn(
          "group inline-flex cursor-pointer items-center gap-2.5",
          disabled && "cursor-not-allowed"
        )}
      >
        <span className="relative inline-flex shrink-0">
          <input
            ref={ref}
            id={inputId}
            type="radio"
            disabled={disabled}
            checked={checked}
            defaultChecked={defaultChecked}
            className={cn(
              "peer sr-only",
              "focus-visible:outline-none",
              className
            )}
            {...props}
          />
          <span
            aria-hidden
            className={cn(
              "flex h-[18px] w-[18px] items-center justify-center rounded-full border border-gray/40 bg-white transition-colors",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
              "peer-checked:border-primary",
              "peer-checked:[&>span]:opacity-100",
              error && "border-coral peer-checked:border-coral",
              indicatorClassName
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full opacity-0 transition-opacity",
                error ? "bg-coral" : "bg-primary",
                indicatorDotClassName
              )}
            />
          </span>
        </span>
        {label ? (
          <span
            className={cn(
              "min-w-0 text-sm font-medium leading-snug text-black",
              error && "text-coral"
            )}
          >
            {label}
          </span>
        ) : null}
      </label>
      {error ? <p className="text-xs text-coral">{error}</p> : null}
    </div>
  );
});

Radio.displayName = "Radio";

export { Radio };
