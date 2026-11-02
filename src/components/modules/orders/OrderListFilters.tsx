"use client";

import ListPageTitleToolbar from "@/components/list/ListPageTitleToolbar";
import { Button } from "@/components/ui/Button";
import { DateRangePickerField } from "@/components/ui/DatePickerField";

import type { DateRange } from "./order.types";

interface OrderListFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function OrderListFilters({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
}: OrderListFiltersProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-gray/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-6">
      <DateRangePickerField
        from={dateRange.from}
        to={dateRange.to}
        onChange={onDateRangeChange}
        placeholder="Lọc theo ngày đặt"
        containerClassName="w-full sm:w-[260px]"
        className="h-10"
      />
      <ListPageTitleToolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Tìm mã đơn, khách hàng..."
        className="border-none px-0 py-0 sm:px-0 sm:py-0"
      />
      {(dateRange.from || dateRange.to) && (
        <Button
          type="button"
          variant="transparent"
          className="h-10 shrink-0 px-3 text-sm"
          onClick={() => onDateRangeChange({ from: "", to: "" })}
        >
          Xóa ngày
        </Button>
      )}
    </div>
  );
}
