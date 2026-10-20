"use client";

import ListPageTitleToolbar from "@/components/list/ListPageTitleToolbar";

interface CustomerListFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function CustomerListFilters({
  search,
  onSearchChange,
}: CustomerListFiltersProps) {
  return (
    <ListPageTitleToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Tìm tên, số điện thoại khách hàng..."
    />
  );
}
