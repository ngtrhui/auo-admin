
"use client";

import {
  STAFF_STATUS_TAB_STATS_KEY,
  STAFF_STATUS_TABS,
} from "@/constants/staff-filters";
import type { StatusFilter } from "@/components/modules/staff/staff.types";
import { cn } from "@/utils/classNames";

interface StaffStatusTabsProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  total: number;
  activeCount: number;
  inactiveCount: number;
}

export default function StaffStatusTabs({
  statusFilter,
  onStatusFilterChange,
  total,
  activeCount,
  inactiveCount,
}: StaffStatusTabsProps) {
  const stats = {
    total,
    active: activeCount,
    inactive: inactiveCount,
  };

  return (
    <div
      role="tablist"
      aria-label="Lọc trạng thái nhân viên"
      className="flex gap-x-6 overflow-x-auto whitespace-nowrap border-b border-gray/20 px-4 sm:px-5"
    >
      {STAFF_STATUS_TABS.map((tab) => {
        const isActive = statusFilter === tab.id;
        const statsKey = STAFF_STATUS_TAB_STATS_KEY[tab.id];
        const count = stats[statsKey];

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onStatusFilterChange(tab.id)}
            className={cn(
              "relative shrink-0 cursor-pointer pb-3 pt-4 text-sm font-semibold transition-colors",
              isActive
                ? "text-primary"
                : "text-gray hover:text-black",
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
