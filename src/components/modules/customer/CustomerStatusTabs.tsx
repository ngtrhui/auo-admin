"use client";

import type { CustomerStatusFilter } from "@/components/modules/customer/user.types";
import { cn } from "@/utils/classNames";

const CUSTOMER_STATUS_TABS: {
  label: string;
  id: CustomerStatusFilter;
}[] = [
  { label: "Tất cả", id: "all" },
  { label: "Đang hoạt động", id: "active" },
  { label: "Đã vô hiệu hóa", id: "inactive" },
];

interface CustomerStatusTabsProps {
  statusFilter: CustomerStatusFilter;
  onStatusFilterChange: (value: CustomerStatusFilter) => void;
  total: number;
  activeCount: number;
  inactiveCount: number;
}

export default function CustomerStatusTabs({
  statusFilter,
  onStatusFilterChange,
  total,
  activeCount,
  inactiveCount,
}: CustomerStatusTabsProps) {
  const stats = {
    total,
    active: activeCount,
    inactive: inactiveCount,
  };

  return (
    <div
      role="tablist"
      aria-label="Lọc trạng thái khách hàng"
      className="flex gap-x-6 overflow-x-auto whitespace-nowrap border-b border-gray/20 px-4 sm:px-5"
    >
      {CUSTOMER_STATUS_TABS.map((tab) => {
        const isActive = statusFilter === tab.id;
        const count = stats[tab.id === "all" ? "total" : tab.id];

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onStatusFilterChange(tab.id)}
            className={cn(
              "relative shrink-0 cursor-pointer pb-3 pt-4 text-sm font-semibold transition-colors",
              isActive ? "text-primary" : "text-gray hover:text-black",
            )}
          >
            {`${tab.label} (${count})`}

            {isActive && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
