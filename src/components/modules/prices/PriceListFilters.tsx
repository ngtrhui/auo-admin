"use client";

import ListSearchToolbar from "@/components/list/ListSearchToolbar";

interface PriceListFiltersProps {
  search: string;
  categories: string[];
  categoryFilter: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export default function PriceListFilters({
  search,
  categories,
  categoryFilter,
  onSearchChange,
  onCategoryChange,
}: PriceListFiltersProps) {
  return (
    <ListSearchToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Tìm sản phẩm..."
      className="justify-start"
      searchContainerClassName="sm:max-w-md"
    >
      <select
        aria-label="Lọc theo danh mục"
        className="h-10 w-full rounded-lg border border-gray/20 bg-white px-3 text-sm text-black outline-none transition focus:border-primary focus:ring-1 focus:ring-primary sm:w-auto sm:min-w-48"
        value={categoryFilter}
        onChange={(event) => onCategoryChange(event.target.value)}
      >
        <option value="all">Tất cả danh mục</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </ListSearchToolbar>
  );
}
