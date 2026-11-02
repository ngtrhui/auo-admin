import type { StatusFilter } from "./order.types";

interface OrderStatusTabsProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
}

const TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả đơn" },
  { value: "pending", label: "Chưa duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "cancelled", label: "Đã hủy" },
];

export default function OrderStatusTabs({
  statusFilter,
  onStatusFilterChange,
  counts,
}: OrderStatusTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Lọc trạng thái đơn hàng"
      className="flex gap-x-6 overflow-x-auto whitespace-nowrap border-b border-gray/20 px-4 sm:px-5"
    >
      {TABS.map((tab) => {
        const isSelected = statusFilter === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onStatusFilterChange(tab.value)}
            className={`relative shrink-0 cursor-pointer pb-3 pt-4 text-sm font-semibold transition-colors ${
              isSelected ? "text-primary" : "text-gray hover:text-black"
            }`}
          >
            {`${tab.label} (${counts[tab.value]})`}
            {isSelected && (
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
