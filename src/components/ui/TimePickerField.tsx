'use client';

import { useContext, useEffect, useId, useMemo, useRef, type ReactNode } from 'react';
import { HiChevronDown } from 'react-icons/hi';
import { IoTimeOutline } from 'react-icons/io5';
import {
  Button,
  Dialog,
  DialogTrigger,
  OverlayTriggerStateContext,
  Popover,
} from 'react-aria-components';
import { cn } from '@/utils/classNames';

function TimePickerTriggerChevron() {
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

function parseTimeValue(value: string): { hours: string; minutes: string } | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!match) return null;

  const hoursNum = Number(match[1]);
  const minutesNum = Number(match[2]);
  if (hoursNum < 0 || hoursNum > 23 || minutesNum < 0 || minutesNum > 59) {
    return null;
  }

  return {
    hours: String(hoursNum).padStart(2, '0'),
    minutes: String(minutesNum).padStart(2, '0'),
  };
}

function formatTimeDisplay(value: string): string {
  const parsed = parseTimeValue(value);
  if (!parsed) return '';
  return `${parsed.hours}:${parsed.minutes}`;
}

function buildTimeValue(hours: string, minutes: string): string {
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));

function getMinuteOptions(minuteStep: number): string[] {
  const step = Math.max(1, Math.min(30, minuteStep));
  const options: string[] = [];

  for (let minute = 0; minute < 60; minute += step) {
    options.push(String(minute).padStart(2, '0'));
  }

  return options;
}

const SCROLL_LIST_HEIGHT = 176; // px — ~6 visible options

function TimePickerPopoverContent({
  selectedHours,
  selectedMinutes,
  minuteOptions,
  onHoursChange,
  onMinutesChange,
}: {
  selectedHours: string;
  selectedMinutes: string;
  minuteOptions: string[];
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
}) {
  const state = useContext(OverlayTriggerStateContext);
  const isOpen = Boolean(state?.isOpen);

  return (
    <div className="w-full overflow-hidden rounded-lg border-2 border-[#E3E3E3] bg-white shadow-md">
      <div className="flex divide-x divide-gray/20">
        <TimeColumn
          label="Giờ"
          options={HOURS}
          value={selectedHours}
          onChange={onHoursChange}
          isOpen={isOpen}
        />
        <TimeColumn
          label="Phút"
          options={minuteOptions}
          value={selectedMinutes}
          onChange={onMinutesChange}
          isOpen={isOpen}
        />
      </div>
    </div>
  );
}

const optionButtonClass =
  'flex h-8 w-full shrink-0 cursor-pointer items-center justify-center rounded-md px-2 text-sm text-black outline-hidden transition-colors hover:bg-primary-light/50 focus:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-primary/40';

const selectedOptionClass = 'bg-primary font-medium text-white hover:bg-primary/90';

type TimeColumnProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
};

function TimeColumn({ label, options, value, onChange, isOpen }: TimeColumnProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen || !listRef.current || !selectedRef.current) return;

    const list = listRef.current;
    const selected = selectedRef.current;
    list.scrollTop = selected.offsetTop - list.clientHeight / 2 + selected.clientHeight / 2;
  }, [isOpen, value]);

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gray/20 px-3 py-1.5 text-center text-xs font-semibold text-gray">
        {label}
      </div>
      <div
        ref={listRef}
        className="overflow-y-auto overscroll-contain px-1.5 py-1 [scrollbar-width:thin]"
        style={{ height: SCROLL_LIST_HEIGHT, maxHeight: SCROLL_LIST_HEIGHT }}
      >
        {options.map((option) => {
          const isSelected = option === value;
          return (
            <Button
              key={option}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              onPress={() => onChange(option)}
              className={cn(optionButtonClass, isSelected && selectedOptionClass)}
            >
              {option}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export type TimePickerFieldProps = {
  label?: ReactNode;
  labelClassName?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  containerClassName?: string;
  error?: string;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  minuteStep?: number;
};

export function TimePickerField({
  label,
  labelClassName,
  value,
  onChange,
  error,
  placeholder = 'Chọn giờ',
  id: idProp,
  className,
  containerClassName,
  disabled = false,
  minuteStep = 1,
}: TimePickerFieldProps) {
  const genId = useId();
  const fieldId = idProp ?? genId;
  const display = formatTimeDisplay(value);
  const parsed = parseTimeValue(value);
  const minuteOptions = useMemo(() => getMinuteOptions(minuteStep), [minuteStep]);

  const selectedHours = parsed?.hours ?? '00';
  const selectedMinutes = useMemo(() => {
    if (!parsed) return minuteOptions[0] ?? '00';
    const nearest = minuteOptions.find((minute) => minute === parsed.minutes);
    return nearest ?? minuteOptions[0] ?? '00';
  }, [parsed, minuteOptions]);

  const handleHoursChange = (hours: string) => {
    onChange(buildTimeValue(hours, selectedMinutes));
  };

  const handleMinutesChange = (minutes: string) => {
    onChange(buildTimeValue(selectedHours, minutes));
  };

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
          <IoTimeOutline className="size-5 shrink-0" />
          <span className={cn('min-w-0 flex-1 truncate', !display && 'text-gray')}>
            {display || placeholder}
          </span>
          <TimePickerTriggerChevron />
        </Button>
        <Popover
          placement="bottom start"
          offset={8}
          className="z-110 w-(--trigger-width) min-w-0 max-w-(--trigger-width) overflow-hidden p-0"
        >
          <Dialog className="max-h-none overflow-hidden outline-hidden">
            <TimePickerPopoverContent
              selectedHours={selectedHours}
              selectedMinutes={selectedMinutes}
              minuteOptions={minuteOptions}
              onHoursChange={handleHoursChange}
              onMinutesChange={handleMinutesChange}
            />
          </Dialog>
        </Popover>
      </DialogTrigger>
      {error ? <p className="text-xs font-semibold text-coral">{error}</p> : null}
    </div>
  );
}
