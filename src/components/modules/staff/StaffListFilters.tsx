
'use client';

import { FiSearch } from 'react-icons/fi';

import { Input } from '@/components/ui/Input';
import type { StatusFilter } from '@/components/modules/staff/staff.types';

interface StaffListFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  total: number;
  filteredTotal: number;
  activeCount: number;
  inactiveCount: number;
}

const STATUS_TABS: {
  label: string;
  value: StatusFilter;
}[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang hoạt động', value: 'active' },
  { label: 'Đã vô hiệu hóa', value: 'inactive' },
];

export default function StaffListFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  total,
  filteredTotal,
  activeCount,
  inactiveCount,
}: StaffListFiltersProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-gray/10 px-4 py-4 sm:px-6 sm:pt-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-bold text-black">
            Danh sách nhân viên
          </h2>

          <p className="mt-1 text-xs text-gray">
            Hiển thị {filteredTotal} trên {total} nhân viên
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative block sm:w-64">
            <Input
              leftIcon={<FiSearch />}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              label="Tìm tên nhân viên..."
              aria-label="Tìm nhân viên"
              className="h-10 w-full bg-white pl-9 pr-3 text-sm text-black outline-none transition"
            />
          </label>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Lọc trạng thái nhân viên"
        className="flex w-full gap-1 overflow-x-auto sm:w-fit"
      >
        {STATUS_TABS.map((tab) => {
          const isSelected = statusFilter === tab.value;

          const count =
            tab.value === 'all'
              ? total
              : tab.value === 'active'
                ? activeCount
                : inactiveCount;

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onStatusFilterChange(tab.value)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                isSelected
                  ? 'bg-primary-light text-primary'
                  : 'text-gray hover:bg-[#F8F7F6] hover:text-black'
              }`}
            >
              {tab.label}

              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  isSelected
                    ? 'bg-white text-primary'
                    : 'bg-gray/10 text-gray'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
