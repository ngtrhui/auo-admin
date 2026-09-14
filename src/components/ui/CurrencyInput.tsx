"use client";

import {
  type ChangeEvent,
  type Ref,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Input, type InputProps } from "@/components/ui/Input";
import { formatNumber } from "@/utils/format";

const onlyDigits = (s: string) => s.replace(/\D/g, "");

const DEFAULT_MAX_DIGITS = 12;

function cursorAfterDigitCount(formatted: string, digitCount: number): number {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i]!)) {
      seen++;
      if (seen === digitCount) return i + 1;
    }
  }
  return formatted.length;
}

export type CurrencyInputProps = Omit<
  InputProps,
  "type" | "value" | "defaultValue" | "onChange" | "inputMode"
> & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  maxDigits?: number;
  ref?: Ref<HTMLInputElement>;
};

const CurrencyInput = ({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  maxDigits = DEFAULT_MAX_DIGITS,
  readOnly,
  disabled,
  placeholder = "0",
  ref,
  ...inputProps
}: CurrencyInputProps) => {
  const innerRef = useRef<HTMLInputElement | null>(null);
  const cursorRestore = useRef<number | null>(null);

  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  // Render-phase sync: khi parent đổi defaultValue ở chế độ uncontrolled,
  // reset state ngay trong render thay vì useEffect → tránh cascading render.
  // React sẽ huỷ render hiện tại và chạy lại ngay với state mới.
  // Ref: https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes
  const [prevDefaultValue, setPrevDefaultValue] = useState(defaultValue);
  if (!isControlled && defaultValue !== prevDefaultValue) {
    setPrevDefaultValue(defaultValue);
    setInternal(defaultValue);
  }
  const numeric = isControlled ? valueProp : internal;

  const setNumeric = useCallback(
    (n: number) => {
      if (!isControlled) setInternal(n);
      onValueChange?.(n);
    },
    [isControlled, onValueChange],
  );

  const displayValue =
    numeric === 0 && !readOnly ? "" : formatNumber(numeric);

  useLayoutEffect(() => {
    const el = innerRef.current;
    const pos = cursorRestore.current;
    if (el && pos !== null) {
      el.setSelectionRange(pos, pos);
      cursorRestore.current = null;
    }
  }, [displayValue]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (readOnly || disabled) return;

      const raw = e.target.value;
      const cursorPos = e.target.selectionStart ?? raw.length;

      const digitStr = onlyDigits(raw).slice(0, maxDigits);
      const next =
        digitStr === ""
          ? 0
          : Math.min(Number(digitStr), Number.MAX_SAFE_INTEGER);
      if (Number.isNaN(next)) return;

      const digitsLeftOfCursor = onlyDigits(raw.slice(0, cursorPos)).length;
      const formatted = next === 0 && digitStr === "" ? "" : formatNumber(next);
      cursorRestore.current = cursorAfterDigitCount(
        formatted,
        Math.min(digitsLeftOfCursor, onlyDigits(formatted).length),
      );

      setNumeric(next);
    },
    [readOnly, disabled, maxDigits, setNumeric],
  );

  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    },
    [ref],
  );

  return (
    <Input
      {...inputProps}
      ref={setRefs}
      type="text"
      inputMode="numeric"
      readOnly={readOnly}
      disabled={disabled}
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
    />
  );
};

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
