"use client";

import ListPageTitleToolbar from "@/components/list/ListPageTitleToolbar";

interface StaffListFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function StaffListFilters({
  search,
  onSearchChange,
}: StaffListFiltersProps) {
  return (
    <ListPageTitleToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Tìm tên nhân viên..."
    ></ListPageTitleToolbar>
  );
}
