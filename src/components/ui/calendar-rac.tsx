'use client';

import { cn } from '@/utils/classNames';
import { CalendarDate, endOfMonth, getLocalTimeZone, today } from '@internationalized/date';
import { type ComponentProps, useEffect, useRef, useState } from 'react';
import {
  Button,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Calendar as CalendarRac,
  RangeCalendar as RangeCalendarRac,
  composeRenderProps,
} from 'react-aria-components';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import type { DateRange, DateValue } from 'react-aria-components';

const MONTHS_VI = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
] as const;

const WEEKDAYS_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

type PickerMode = 'month' | 'year' | null;

const navBtnClass =
  'flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray outline-offset-2 transition-colors hover:bg-primary-light/60 hover:text-black focus:outline-none data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-primary/40';

const triggerBtnClass =
  'cursor-pointer rounded-md px-2 py-1 text-sm font-medium text-black hover:bg-primary-light/40 focus:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-primary/40';

const triggerBtnActiveClass = 'bg-primary-light/60';

const gridPickerBtnClass =
  'min-h-9 w-full cursor-pointer rounded-lg px-1 text-sm text-black outline-hidden transition-colors hover:bg-primary-light/50 focus:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-primary/40 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-35 data-[disabled]:hover:bg-transparent';

const gridPickerSelectedClass = 'bg-primary text-white hover:bg-primary/90';

const monthPickerPanelClass =
  'absolute left-1/2 top-11 z-10 w-[min(100%,15rem)] -translate-x-1/2 overflow-hidden rounded-lg border-2 border-[#E3E3E3] bg-white p-1 shadow-md';

const yearPickerPanelClass =
  'absolute left-1/2 top-11 z-10 w-[min(100%,12.5rem)] -translate-x-1/2 overflow-hidden rounded-lg border-2 border-[#E3E3E3] bg-white p-1 shadow-md';

function toCalendarDate(d: DateValue | null | undefined): CalendarDate | null {
  if (!d) return null;
  if ('day' in d && 'year' in d && 'month' in d) {
    return d as CalendarDate;
  }
  return null;
}

/** Có ít nhất một ngày trong tháng (y, m) nằm trong [min, max] (cả hai có thể null = không giới hạn). */
function monthOverlapsMinMax(
  y: number,
  m: number,
  min: CalendarDate | null,
  max: CalendarDate | null,
): boolean {
  if (!min && !max) return true;
  const first = new CalendarDate(y, m, 1);
  const last = endOfMonth(first);
  if (min && last.compare(min) < 0) return false;
  if (max && first.compare(max) > 0) return false;
  return true;
}

/** Có ít nhất một ngày trong năm y nằm trong [min, max]. */
function yearOverlapsMinMax(
  y: number,
  min: CalendarDate | null,
  max: CalendarDate | null,
): boolean {
  if (!min && !max) return true;
  const first = new CalendarDate(y, 1, 1);
  const last = new CalendarDate(y, 12, 31);
  if (min && last.compare(min) < 0) return false;
  if (max && first.compare(max) > 0) return false;
  return true;
}

function anyMonthSelectableInYear(
  y: number,
  min: CalendarDate | null,
  max: CalendarDate | null,
): boolean {
  for (let m = 1; m <= 12; m += 1) {
    if (monthOverlapsMinMax(y, m, min, max)) return true;
  }
  return false;
}

function anyYearSelectableInDecade(
  decadeStart: number,
  min: CalendarDate | null,
  max: CalendarDate | null,
): boolean {
  for (let j = 0; j < 10; j += 1) {
    if (yearOverlapsMinMax(decadeStart + j, min, max)) return true;
  }
  return false;
}

/** Đưa ngày focus về trong [min, max] để header tháng/năm khớp với tháng lưới khi min/max đổi (vd. closedAtMinYmd). */
function clampCalendarDateToBounds(
  date: CalendarDate,
  min: CalendarDate | null,
  max: CalendarDate | null,
): CalendarDate {
  if (min && date.compare(min) < 0) return min;
  if (max && date.compare(max) > 0) return max;
  return date;
}

function calendarBoundsKey(min: CalendarDate | null, max: CalendarDate | null): string {
  return `${min?.toString() ?? ''}|${max?.toString() ?? ''}`;
}

const cellBase = cn(
  'relative z-0 flex size-9 max-h-9 min-h-9 min-w-9 max-w-9 cursor-pointer items-center justify-center p-0 text-sm font-medium text-black',
  'outline-offset-2 transition-[color,background-color,box-shadow,border-color] duration-150',
  'data-[focus-visible]:z-10 data-[disabled]:pointer-events-none data-[unavailable]:pointer-events-none',
  'data-[unavailable]:line-through data-[disabled]:opacity-30 data-[unavailable]:opacity-30',
  'data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-primary/40',
  'data-[today]:z-[1] data-[today]:border-2 data-[today]:border-primary',
);

const cellSingle = cn(
  cellBase,
  'rounded-lg border-2 border-transparent',
  'data-[hovered]:bg-primary-light/40 data-[selected]:bg-primary data-[hovered]:text-black data-[selected]:text-white',
);

const cellRange = cn(
  cellBase,
  'border-y-2 border-transparent',
  'data-[hovered]:bg-primary-light/50',
  'data-[selected]:!bg-primary-light data-[selected]:!text-black',
  'data-[selection-start]:!bg-primary data-[selection-end]:!bg-primary data-[selection-start]:!text-white data-[selection-end]:!text-white',
  'data-[selected]:[&:not([data-selection-start])]:[&:not([data-selection-end])]:rounded-none',
  'data-[selection-start]:rounded-s-lg data-[selection-end]:rounded-e-lg',
  'data-[selected]:[&:not([data-selection-start])]:[&:not([data-selection-end])]:!bg-primary-light',
  'data-[hovered]:data-[selected]:!bg-primary-light',
  'data-[hovered]:data-[selection-start]:!bg-primary data-[hovered]:data-[selection-end]:!bg-primary',
  'data-[hovered]:data-[selection-start]:!text-white data-[hovered]:data-[selection-end]:!text-white',
  'data-[hovered]:data-[selection-start]:rounded-s-lg data-[hovered]:data-[selection-end]:rounded-e-lg',
  'data-[today]:!rounded-lg',
);

type CalendarChromeProps = {
  pageDate: CalendarDate;
  onPageChange: (d: CalendarDate) => void;
  minValue: CalendarDate | null;
  maxValue: CalendarDate | null;
  isRange: boolean;
};

/**
 * Header + lưới ngày luôn hiện; dropdown tháng/năm absolute trong DOM calendar
 * (không portal) để tránh RangeCalendar commitBehavior=select khi blur ra ngoài.
 */
function CalendarChrome({
  pageDate,
  onPageChange,
  minValue,
  maxValue,
  isRange,
}: CalendarChromeProps) {
  const months = MONTHS_VI;
  const y = pageDate.year;
  const m = pageDate.month;

  const rootRef = useRef<HTMLDivElement>(null);
  const monthTriggerRef = useRef<HTMLButtonElement>(null);
  const yearTriggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [picker, setPicker] = useState<PickerMode>(null);
  const [monthViewYear, setMonthViewYear] = useState(y);
  const [yearDecadeStart, setYearDecadeStart] = useState(() => Math.floor(y / 10) * 10);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đồng bộ năm hiển thị khi đổi trang lịch
    setMonthViewYear(y);
  }, [y]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đồng bộ decade khi đổi trang lịch
    setYearDecadeStart(Math.floor(y / 10) * 10);
  }, [y]);

  useEffect(() => {
    if (!picker) return;
    const root = rootRef.current;
    if (!root) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target)) return;
      if (monthTriggerRef.current?.contains(target)) return;
      if (yearTriggerRef.current?.contains(target)) return;
      setPicker(null);
    };

    root.addEventListener('pointerdown', onPointerDown);
    return () => root.removeEventListener('pointerdown', onPointerDown);
  }, [picker]);

  const toggleMonth = () => {
    setMonthViewYear(y);
    setPicker((prev) => (prev === 'month' ? null : 'month'));
  };

  const toggleYear = () => {
    setYearDecadeStart(Math.floor(y / 10) * 10);
    setPicker((prev) => (prev === 'year' ? null : 'year'));
  };

  const closePicker = () => setPicker(null);

  return (
    <div
      ref={rootRef}
      className="relative"
    >
      <header className="flex w-full min-w-0 items-center justify-between gap-1 pb-2">
        <Button
          slot="previous"
          className={navBtnClass}
        >
          <ChevronLeftIcon
            className="size-4"
            width={16}
            height={16}
            strokeWidth={2}
          />
        </Button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5 sm:gap-1">
          <Button
            ref={monthTriggerRef}
            slot={null}
            type="button"
            onPress={toggleMonth}
            className={cn(
              triggerBtnClass,
              'min-w-0 max-w-40 truncate',
              picker === 'month' && triggerBtnActiveClass,
            )}
          >
            {months[m - 1]}
          </Button>
          <Button
            ref={yearTriggerRef}
            slot={null}
            type="button"
            onPress={toggleYear}
            className={cn(triggerBtnClass, 'shrink-0', picker === 'year' && triggerBtnActiveClass)}
          >
            {y}
          </Button>
        </div>

        <Button
          slot="next"
          className={navBtnClass}
        >
          <ChevronRightIcon
            className="size-4"
            width={16}
            height={16}
            strokeWidth={2}
          />
        </Button>
      </header>

      <CalendarGridBlock
        isRange={isRange}
        weekdayLabels={WEEKDAYS_VI}
      />

      {picker === 'month' ? (
        <div
          ref={panelRef}
          className={monthPickerPanelClass}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-1">
              <Button
                slot={null}
                type="button"
                onPress={() => setMonthViewYear((n) => n - 1)}
                isDisabled={!anyMonthSelectableInYear(monthViewYear - 1, minValue, maxValue)}
                className={navBtnClass}
              >
                <ChevronLeftIcon
                  className="size-4"
                  width={16}
                  height={16}
                  strokeWidth={2}
                />
              </Button>
              <span className="min-w-0 flex-1 text-center text-sm font-semibold text-black">
                {monthViewYear}
              </span>
              <Button
                slot={null}
                type="button"
                onPress={() => setMonthViewYear((n) => n + 1)}
                isDisabled={!anyMonthSelectableInYear(monthViewYear + 1, minValue, maxValue)}
                className={navBtnClass}
              >
                <ChevronRightIcon
                  className="size-4"
                  width={16}
                  height={16}
                  strokeWidth={2}
                />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-medium sm:text-sm">
              {months.map((label, i) => {
                const monthNum = i + 1;
                const selected = m === monthNum && y === monthViewYear;
                const inRange = monthOverlapsMinMax(monthViewYear, monthNum, minValue, maxValue);
                return (
                  <Button
                    slot={null}
                    type="button"
                    key={label}
                    isDisabled={!inRange}
                    onPress={() => {
                      onPageChange(
                        pageDate.set({
                          year: monthViewYear,
                          month: monthNum,
                          day: 1,
                        }),
                      );
                      closePicker();
                    }}
                    className={cn(gridPickerBtnClass, selected && gridPickerSelectedClass)}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {picker === 'year' ? (
        <div
          ref={panelRef}
          className={yearPickerPanelClass}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-1">
              <Button
                slot={null}
                type="button"
                onPress={() => setYearDecadeStart((s) => s - 10)}
                isDisabled={!anyYearSelectableInDecade(yearDecadeStart - 10, minValue, maxValue)}
                className={navBtnClass}
              >
                <ChevronLeftIcon
                  className="size-4"
                  width={16}
                  height={16}
                  strokeWidth={2}
                />
              </Button>
              <span className="min-w-0 flex-1 text-center text-sm font-medium text-gray">
                {yearDecadeStart} – {yearDecadeStart + 9}
              </span>
              <Button
                slot={null}
                type="button"
                onPress={() => setYearDecadeStart((s) => s + 10)}
                isDisabled={!anyYearSelectableInDecade(yearDecadeStart + 10, minValue, maxValue)}
                className={navBtnClass}
              >
                <ChevronRightIcon
                  className="size-4"
                  width={16}
                  height={16}
                  strokeWidth={2}
                />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-medium sm:text-sm">
              {Array.from({ length: 10 }, (_, j) => yearDecadeStart + j).map((yearNum) => {
                const selected = y === yearNum;
                const inRange = yearOverlapsMinMax(yearNum, minValue, maxValue);
                return (
                  <Button
                    slot={null}
                    type="button"
                    key={yearNum}
                    isDisabled={!inRange}
                    onPress={() => {
                      onPageChange(
                        pageDate.set({
                          year: yearNum,
                          month: m,
                          day: 1,
                        }),
                      );
                      closePicker();
                    }}
                    className={cn(gridPickerBtnClass, selected && gridPickerSelectedClass)}
                  >
                    {yearNum}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function makeWeekdayHeader(
  labels: readonly [string, string, string, string, string, string, string],
) {
  const state = { i: 0 };
  function WeekdayHeaderCells(day: string) {
    const idx = state.i % 7;
    state.i += 1;
    const label = labels[idx] ?? day;
    return (
      <CalendarHeaderCell
        className="size-9 p-0 text-center text-xs font-medium text-gray"
        aria-label={day}
      >
        {label}
      </CalendarHeaderCell>
    );
  }
  WeekdayHeaderCells.displayName = 'WeekdayHeaderCells';
  return WeekdayHeaderCells;
}

function CalendarGridBlock({
  isRange,
  weekdayLabels,
}: {
  isRange: boolean;
  weekdayLabels: readonly [string, string, string, string, string, string, string];
}) {
  return (
    <CalendarGrid>
      <CalendarGridHeader>{makeWeekdayHeader(weekdayLabels)}</CalendarGridHeader>
      <CalendarGridBody className="[&_td]:px-0">
        {(date) => (
          <CalendarCell
            date={date}
            className={isRange ? cellRange : cellSingle}
          />
        )}
      </CalendarGridBody>
    </CalendarGrid>
  );
}

type CalendarProps = Omit<ComponentProps<typeof CalendarRac>, 'children'> & {
  locale?: never;
};

type RangeCalendarProps = Omit<ComponentProps<typeof RangeCalendarRac>, 'children'> & {
  locale?: never;
};

const Calendar = ({
  className,
  value,
  defaultValue,
  onChange,
  minValue,
  maxValue,
  ...rest
}: CalendarProps) => {
  const tz = getLocalTimeZone();
  const minCal = toCalendarDate(minValue as DateValue | null | undefined);
  const maxCal = toCalendarDate(maxValue as DateValue | null | undefined);
  const boundsKey = calendarBoundsKey(minCal, maxCal);

  const [focused, setFocused] = useState<CalendarDate>(() => {
    const v = toCalendarDate((value as DateValue) ?? (defaultValue as DateValue) ?? null);
    const base = v ?? today(tz);
    return clampCalendarDateToBounds(base, minCal, maxCal);
  });

  useEffect(() => {
    const v = toCalendarDate(value as DateValue);
    if (v) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- đồng bộ focus khi value / cận lịch đổi
      setFocused(clampCalendarDateToBounds(v, minCal, maxCal));
      return;
    }
    setFocused((prev) => clampCalendarDateToBounds(prev, minCal, maxCal));
  }, [value, boundsKey, minCal, maxCal]);

  return (
    <CalendarRac
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      focusedValue={focused}
      onFocusChange={setFocused}
      minValue={minValue}
      maxValue={maxValue}
      {...rest}
      className={composeRenderProps(className, (c) =>
        cn('relative w-fit rounded-lg border-2 border-[#E3E3E3] bg-white p-2', c),
      )}
    >
      <CalendarChrome
        pageDate={focused}
        onPageChange={setFocused}
        minValue={minCal}
        maxValue={maxCal}
        isRange={false}
      />
    </CalendarRac>
  );
};

const RangeCalendar = ({
  className,
  value,
  defaultValue,
  onChange,
  minValue,
  maxValue,
  ...rest
}: RangeCalendarProps) => {
  const tz = getLocalTimeZone();
  const minCal = toCalendarDate(minValue as DateValue | null | undefined);
  const maxCal = toCalendarDate(maxValue as DateValue | null | undefined);
  const boundsKey = calendarBoundsKey(minCal, maxCal);

  const [focused, setFocused] = useState<CalendarDate>(() => {
    const v = (value as DateRange | null)?.start
      ? toCalendarDate((value as DateRange).start)
      : toCalendarDate((defaultValue as DateRange | null)?.start ?? null);
    const base = v ?? today(tz);
    return clampCalendarDateToBounds(base, minCal, maxCal);
  });

  useEffect(() => {
    const r = value as DateRange | null;
    if (r?.start) {
      const s = toCalendarDate(r.start);
      if (s) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- đồng bộ focus khi value / cận lịch đổi
        setFocused(clampCalendarDateToBounds(s, minCal, maxCal));
      }
      return;
    }
    setFocused((prev) => clampCalendarDateToBounds(prev, minCal, maxCal));
  }, [value, boundsKey, minCal, maxCal]);

  return (
    <RangeCalendarRac
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      focusedValue={focused}
      onFocusChange={setFocused}
      minValue={minValue}
      maxValue={maxValue}
      {...rest}
      className={composeRenderProps(className, (c) =>
        cn('relative w-fit rounded-lg border-2 border-[#E3E3E3] bg-white p-2', c),
      )}
    >
      <CalendarChrome
        pageDate={focused}
        onPageChange={setFocused}
        minValue={minCal}
        maxValue={maxCal}
        isRange
      />
    </RangeCalendarRac>
  );
};

type RacCalProps = ({ mode: 'single' } & CalendarProps) | ({ mode: 'range' } & RangeCalendarProps);

function RacCal(props: RacCalProps) {
  if (props.mode === 'range') {
    const { mode: _mode, ...rest } = props;
    void _mode;
    return <RangeCalendar {...rest} />;
  }
  const { mode: _mode, ...rest } = props;
  void _mode;
  return <Calendar {...rest} />;
}

export { Calendar, RangeCalendar, RacCal };
export type { CalendarProps, RangeCalendarProps, RacCalProps };
