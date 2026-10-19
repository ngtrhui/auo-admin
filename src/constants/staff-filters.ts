
import type { StatusFilter } from "@/components/modules/staff/staff.types";

export const STAFF_STATUS_TABS: {
  label: string;
  id: StatusFilter;
}[] = [
  { label: "Tất cả", id: "all" },
  { label: "Đang hoạt động", id: "active" },
  { label: "Đã vô hiệu hóa", id: "inactive" },
];

export const STAFF_STATUS_TAB_STATS_KEY = {
  all: "total",
  active: "active",
  inactive: "inactive",
} as const satisfies Record<StatusFilter, string>;
