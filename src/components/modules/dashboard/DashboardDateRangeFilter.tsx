'use client';

import { Button } from '@/components/ui/Button';
import { DateRangePickerField } from '@/components/ui/DatePickerField';
import {
  DASHBOARD_DATE_PRESET_OPTIONS,
  type DashboardDatePreset,
} from '@/utils/dashboard-date-range';
import { HiOutlineDownload } from 'react-icons/hi';

export type DashboardDateRangeFilterProps = {
  preset: DashboardDatePreset;
  customRange: { from: string; to: string };
  onPresetChange: (preset: DashboardDatePreset) => void;
  onCustomRangeChange: (range: { from: string; to: string }) => void;
  onExport?: () => void;
  isExporting?: boolean;
  className?: string;
};

export default function DashboardDateRangeFilter({
  preset,
  customRange,
  onPresetChange,
  onCustomRangeChange,
  onExport,
  isExporting = false,
  className,
}: DashboardDateRangeFilterProps) {
  return (
    <div
      role="group"
      aria-label="Khoảng thời gian"
      className={className}
    >
      <div className="flex flex-wrap items-center justify-end gap-2">
        {DASHBOARD_DATE_PRESET_OPTIONS.map((option) => {
          const isActive = preset === option.id;
          return (
            <Button
              key={option.id}
              type="button"
              size="md"
              variant={isActive ? 'primary' : 'secondary'}
              aria-pressed={isActive}
              onClick={() => onPresetChange(option.id)}
            >
              {option.label}
            </Button>
          );
        })}

        {preset === 'custom' ? (
          <DateRangePickerField
            className="h-10 bg-white"
            containerClassName="w-full sm:w-[260px]"
            placeholder="Chọn khoảng thời gian"
            from={customRange.from}
            to={customRange.to}
            onChange={onCustomRangeChange}
          />
        ) : null}

        <Button
          leftIcon={<HiOutlineDownload className="size-5 shrink-0" />}
          variant="green"
          className="h-10"
          onClick={onExport}
          disabled={!onExport || isExporting}
          loading={isExporting}
        >
          Xuất Excel
        </Button>
      </div>
    </div>
  );
}
