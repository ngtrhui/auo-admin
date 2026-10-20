"use client";

import ListSearchToolbar from "@/components/list/ListSearchToolbar";

interface YarnListFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function YarnListFilters({
  search,
  onSearchChange,
}: YarnListFiltersProps) {
  return (
    <ListSearchToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Tìm chất liệu..."
      className="justify-between"
    />
  );
}
