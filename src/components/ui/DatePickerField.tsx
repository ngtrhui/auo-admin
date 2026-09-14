'use client';

import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import type { DateValue } from '@internationalized/date';
import { useContext, useId, useMemo, type ReactNode } from 'react';
import { HiChevronDown } from 'react-icons/hi';
import {
  Button,
  Dialog,
  DialogTrigger,
  OverlayTriggerStateContext,
  Popover,
  type DateRange,
} from 'react-aria-components';
import { Calendar, RangeCalendar } from './calendar-rac';
import { formatYmdToDisplay } from '@/utils/format';
import { cn } from '@/utils/classNames';
import { IoCalendarOutline } from 'react-icons/io5';

function ymdFromDateValue(d: DateValue | null): string {
  if (!d || !('year' in d)) return '';
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
}

function DatePickerTriggerChevron() {
  const state = useContext(OverlayTriggerStateContext);
  const isOpen = Boolean(state?.isOpen);
  return (
    <HiChevronDown
      className={cn(
        'h-6 w-6 shrink-0 text-gray transition-transform duration-200 ease-out',
        isOpen && 'rotate-180',
      )}
      aria-hidden
    />
  );
}

export type DatePickerBoundsProps = {
  /**
   * Tuổi tối thiểu (vd. 18) — `maxValue` lịch = hôm nay trừ `minAge` (không chọn
   * ngày sinh khiến chưa đủ tuổi).
   */
  minAge?: number;
  /**
   * Tuổi tối đa (vd. 120) — `minValue` lịch = hôm nay trừ `maxAge` (không chọn
   * ngày sinh khiến vượt quá tuổi này). Bỏ qua nếu không gửi; nếu có `minAge` mà
   * không có `maxAge`, vẫn dùng `maxSpanYears` (mặc 120) như cũ.
   */
  maxAge?: number;
  /**
   * Khi chỉ có `minAge` (không có `maxAge`): cận dưới lịch = hôm nay −
   * (`minAge` + `maxSpanYears`) — tương đương trần hợp lý; mặc 120.
   */
  maxSpanYears?: number;
  /** Không chọn ngày sau hôm nay — merge `maxValue` với cận từ `minAge`/`maxAge`. */
  disableFutureDates?: boolean;
  /** Không chọn ngày trước hôm nay — tương đương `earliestSelectable="today"`. */
  disablePastDates?: boolean;
  /**
   * Ngày sớm nhất được chọn: `today` (từ hôm nay) hoặc `tomorrow` (từ ngày mai, chặn hôm nay).
   * Ưu tiên hơn `disablePastDates` khi được chỉ định.
   */
  earliestSelectable?: 'today' | 'tomorrow';
  /** Ngày sớm nhất được chọn (inclusive), `yyyy-MM-dd`. */
  minDateYmd?: string;
  /** Ngày muộn nhất được chọn (inclusive), `yyyy-MM-dd`. */
  maxDateYmd?: string;
};

export function getCalendarBounds({
  minAge,
  maxAge,
  maxSpanYears = 120,
  disableFutureDates,
  disablePastDates,
  earliestSelectable,
  minDateYmd,
  maxDateYmd,
}: DatePickerBoundsProps = {}) {
  const tz = getLocalTimeZone();
  const t = today(tz);

  let minValue: ReturnType<typeof today> | undefined;
  let maxValue: ReturnType<typeof today> | undefined;

  if (minAge != null || maxAge != null) {
    const maxFromAge = minAge != null && minAge >= 0 ? t.subtract({ years: minAge }) : undefined;
    let minFromAge: ReturnType<typeof today> | undefined;
    if (maxAge != null && maxAge > 0) {
      minFromAge = t.subtract({ years: maxAge });
    } else if (minAge != null && minAge >= 0) {
      minFromAge = t.subtract({ years: minAge + maxSpanYears });
    }
    if (minFromAge && maxFromAge && minFromAge.compare(maxFromAge) > 0) {
      minValue = maxFromAge;
      maxValue = minFromAge;
    } else if (minAge == null && maxAge != null) {
      minValue = t.subtract({ years: maxAge });
      maxValue = t;
    } else {
      minValue = minFromAge;
      maxValue = maxFromAge;
    }
  }

  if (disableFutureDates) {
    maxValue = maxValue == null ? t : maxValue.compare(t) <= 0 ? maxValue : t;
  }

  const earliestFromToday =
    earliestSelectable === 'tomorrow'
      ? t.add({ days: 1 })
      : earliestSelectable === 'today' || disablePastDates
        ? t
        : undefined;

  if (earliestFromToday) {
    minValue =
      minValue == null
        ? earliestFromToday
        : minValue.compare(earliestFromToday) >= 0
          ? minValue
          : earliestFromToday;
  }

  const mergeMin = (candidate: ReturnType<typeof today> | undefined) => {
    if (!candidate) return minValue;
    if (!minValue) return candidate;
    return minValue.compare(candidate) >= 0 ? minValue : candidate;
  };

  const mergeMax = (candidate: ReturnType<typeof today> | undefined) => {
    if (!candidate) return maxValue;
    if (!maxValue) return candidate;
    return maxValue.compare(candidate) <= 0 ? maxValue : candidate;
  };

  if (minDateYmd?.trim()) {
    try {
      minValue = mergeMin(parseDate(minDateYmd.trim()));
    } catch {
      /* ignore invalid bound */
    }
  }

  if (maxDateYmd?.trim()) {
    try {
      maxValue = mergeMax(parseDate(maxDateYmd.trim()));
    } catch {
      /* ignore invalid bound */
    }
  }

  if (minValue && maxValue && minValue.compare(maxValue) > 0) {
    if (earliestFromToday) {
      minValue = earliestFromToday;
      if (maxValue.compare(minValue) < 0) {
        maxValue = minValue;
      }
    } else {
      return { minValue: maxValue, maxValue: minValue };
    }
  }

  if (earliestFromToday && minValue && minValue.compare(earliestFromToday) < 0) {
    minValue = earliestFromToday;
  }

  return { minValue, maxValue };
}

export type DatePickerFieldProps = DatePickerBoundsProps & {
  label: ReactNode;
  labelClassName?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  containerClassName?: string;
  error?: string;
  /** Khi chưa chọn ngày */
  placeholder?: string;
  id?: string;
  disabled?: boolean;
};

/**
 * Ô ngày sinh: trigger dạng input, mở popover có lịch (React Aria Calendar).
 * Form value: `yyyy-MM-dd` hoặc `""` — đồng bộ với Zod `profile.schema` + `date-fns` hiển thị.
 */
export function DatePickerField({
  label,
  labelClassName,
  value,
  onChange,
  error,
  placeholder = 'Chọn ngày',
  id: idProp,
  minAge,
  maxAge,
  maxSpanYears = 120,
  disableFutureDates,
  disablePastDates,
  earliestSelectable,
  minDateYmd,
  maxDateYmd,
  className,
  containerClassName,
  disabled = false,
}: DatePickerFieldProps) {
  const genId = useId();
  const fieldId = idProp ?? genId;
  const display = formatYmdToDisplay(value);
  const calendarBounds = useMemo(
    () =>
      getCalendarBounds({
        minAge,
        maxAge,
        maxSpanYears,
        disableFutureDates,
        disablePastDates,
        earliestSelectable,
        minDateYmd,
        maxDateYmd,
      }),
    [
      minAge,
      maxAge,
      maxSpanYears,
      disableFutureDates,
      disablePastDates,
      earliestSelectable,
      minDateYmd,
      maxDateYmd,
    ],
  );

  const calValue = value.trim()
    ? (() => {
        try {
          return parseDate(value.trim());
        } catch {
          return null;
        }
      })()
    : null;

  return (
    <div className={cn('flex w-full flex-col gap-1.5', containerClassName)}>
      {label ? (
        <label
          htmlFor={fieldId}
          className={cn('text-sm font-bold text-black', labelClassName)}
        >
          {label}
        </label>
      ) : null}
      <DialogTrigger>
        <Button
          type="button"
          id={fieldId}
          isDisabled={disabled}
          className={cn(
            'flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-gray/20 bg-transparent px-4 py-3 text-left text-sm outline-none transition-all',
            'text-black focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[2px_2px_4px_0px_#0063FF33] disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-coral focus:border-coral focus:ring-coral' : undefined,
            className,
          )}
        >
          <IoCalendarOutline className="size-5 shrink-0" />

          <span className={cn('min-w-0 flex-1 truncate', !display && 'text-gray')}>
            {display || placeholder}
          </span>
          <DatePickerTriggerChevron />
        </Button>
        <Popover
          placement="bottom start"
          offset={8}
          className="z-110 max-w-[calc(100vw-2rem)] p-0"
        >
          <Dialog className="outline-hidden">
            {({ close }) => (
              <Calendar
                value={calValue}
                minValue={calendarBounds.minValue}
                maxValue={calendarBounds.maxValue}
                onChange={(d: DateValue | null) => {
                  onChange(d ? ymdFromDateValue(d) : '');
                  close();
                }}
              />
            )}
          </Dialog>
        </Popover>
      </DialogTrigger>
      {error ? <p className="text-xs font-semibold text-coral">{error}</p> : null}
    </div>
  );
}

export type DateRangePickerFieldProps = DatePickerBoundsProps & {
  label?: ReactNode;
  labelClassName?: string;
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
  className?: string;
  containerClassName?: string;
  error?: string;
  placeholder?: string;
  id?: string;
};

function ymdRangeToCalendarValue(from: string, to: string): DateRange | null {
  const f = from.trim();
  const t = to.trim();
  if (!f) return null;
  try {
    const start = parseDate(f);
    if (!t) {
      return { start, end: start };
    }
    const end = parseDate(t);
    if (end.compare(start) < 0) {
      return { start, end: start };
    }
    return { start, end };
  } catch {
    return null;
  }
}

/** Chọn khoảng ngày (một popover, lịch dạng range) — giá trị `yyyy-MM-dd` giống `DatePickerField`. */
export function DateRangePickerField({
  label,
  labelClassName,
  from,
  to,
  onChange,
  error,
  placeholder = 'Chọn khoảng ngày',
  id: idProp,
  minAge,
  maxAge,
  maxSpanYears = 120,
  disableFutureDates,
  disablePastDates,
  earliestSelectable,
  minDateYmd,
  maxDateYmd,
  className,
  containerClassName,
}: DateRangePickerFieldProps) {
  const genId = useId();
  const fieldId = idProp ?? genId;

  const calendarBounds = useMemo(
    () =>
      getCalendarBounds({
        minAge,
        maxAge,
        maxSpanYears,
        disableFutureDates,
        disablePastDates,
        earliestSelectable,
        minDateYmd,
        maxDateYmd,
      }),
    [
      minAge,
      maxAge,
      maxSpanYears,
      disableFutureDates,
      disablePastDates,
      earliestSelectable,
      minDateYmd,
      maxDateYmd,
    ],
  );

  const display = useMemo(() => {
    const f = from.trim();
    const t = to.trim();
    if (!f) return '';
    const a = formatYmdToDisplay(f);
    if (!t || t === f) return a;
    return `${a} – ${formatYmdToDisplay(t)}`;
  }, [from, to]);

  const rangeValue = useMemo(() => ymdRangeToCalendarValue(from, to), [from, to]);

  return (
    <div className={cn('flex w-full flex-col gap-1.5', containerClassName)}>
      {label ? (
        <label
          htmlFor={fieldId}
          className={cn('text-sm font-bold text-black', labelClassName)}
        >
          {label}
        </label>
      ) : null}
      <DialogTrigger>
        <Button
          type="button"
          id={fieldId}
          className={cn(
            'flex w-full min-h-0 cursor-pointer items-center justify-between gap-2 rounded-lg border border-gray/20 bg-white px-3 py-2.5 text-left text-sm outline-none transition-all',
            'text-black focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[2px_2px_4px_0px_#0063FF33] disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-coral focus:border-coral focus:ring-coral' : undefined,
            className,
          )}
        >
          <IoCalendarOutline className="size-5 shrink-0" />

          <span className={cn('min-w-0 flex-1 truncate', !display && 'text-gray')}>
            {display || placeholder}
          </span>
          <DatePickerTriggerChevron />
        </Button>
        <Popover
          placement="bottom start"
          offset={8}
          className="z-110 max-w-[calc(100vw-2rem)] p-0"
        >
          <Dialog className="outline-hidden">
            {({ close }) => (
              <RangeCalendar
                value={rangeValue}
                minValue={calendarBounds.minValue}
                maxValue={calendarBounds.maxValue}
                onChange={(range: DateRange | null) => {
                  if (!range?.start) {
                    onChange({ from: '', to: '' });
                    return;
                  }
                  const fromStr = ymdFromDateValue(range.start as DateValue);
                  const endVal = range.end;
                  if (endVal == null) {
                    onChange({ from: fromStr, to: '' });
                    return;
                  }
                  const toStr = ymdFromDateValue(endVal as DateValue);
                  onChange({ from: fromStr, to: toStr });
                  close();
                }}
              />
            )}
          </Dialog>
        </Popover>
      </DialogTrigger>
      {error ? <p className="text-xs font-semibold text-coral">{error}</p> : null}
    </div>
  );
}
