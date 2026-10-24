"use client";

import { Input } from "@/components/ui/Input";

interface PatternListFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function PatternListFilters({
  search,
  onSearchChange,
}: PatternListFiltersProps) {
  return (
    <div className="px-5 py-4">
      <Input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Tìm kiểu mẫu..."
        aria-label="Tìm kiểu mẫu"
        variant="standard"
        className="h-10 max-w-md"
      />
    </div>
  );
}
