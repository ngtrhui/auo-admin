"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi";
import { IoFilter } from "react-icons/io5";

import ListPageTitleToolbar from "@/components/list/ListPageTitleToolbar";
import ProductFilterPanel, {
  type ProductAdvancedFilters,
} from "@/components/modules/product/ProductFilterPanel";
import { TOOLBAR_ACTION_BUTTON_CLASS } from "@/constants/list-toolbar";
import { Button } from "@/components/ui/Button";
import type { Pattern } from "@/components/modules/pattern/pattern.types";
import type { Yarn } from "@/components/modules/yarn/yarn.types";
import { cn } from "@/utils/classNames";

interface ProductListFiltersProps {
  search: string;
  category: string;
  yarnId: string;
  patternId: string;
  yarns: Yarn[];
  patterns: Pattern[];
  onSearchChange: (value: string) => void;
  onApplyFilters: (filters: ProductAdvancedFilters) => void;
  onClearFilters: () => void;
  onAdd?: () => void;
  hasActiveFilters?: boolean;
  isDisabled?: boolean;
}

export default function ProductListFilters({
  search,
  category,
  yarnId,
  patternId,
  yarns,
  patterns,
  onSearchChange,
  onApplyFilters,
  onClearFilters,
  onAdd,
  hasActiveFilters = false,
  isDisabled = false,
}: ProductListFiltersProps) {
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);

  const clearFilters = () => {
    onClearFilters();
    setAreFiltersOpen(false);
  };

  return (
    <div className="shrink-0">
      <ListPageTitleToolbar
        title="Danh sách sản phẩm"
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Tìm mã, tên sản phẩm..."
        searchContainerClassName="w-full min-w-0 xl:w-64"
        isDisabled={isDisabled}
        containerClassName="xl:flex-row xl:flex-wrap xl:items-center xl:justify-between [&>*:last-child]:ml-auto"
        className="w-full min-w-0 xl:w-auto"
        trailing={
          <>
            <Button
              leftIcon={<IoFilter className="size-4" aria-hidden />}
              variant="outline"
              className={cn("border text-black", TOOLBAR_ACTION_BUTTON_CLASS)}
              disabled={isDisabled}
              onClick={() => setAreFiltersOpen(true)}
            >
              Bộ lọc
            </Button>
            {hasActiveFilters ? (
              <Button
                leftIcon={<HiOutlineTrash className="size-4" aria-hidden />}
                variant="outline"
                className={cn("border text-black", TOOLBAR_ACTION_BUTTON_CLASS)}
                disabled={isDisabled}
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </Button>
            ) : null}
            {onAdd ? (
              <Button
                leftIcon={<FiPlus className="size-4" aria-hidden />}
                onClick={onAdd}
                className="shrink-0"
              >
                Thêm sản phẩm
              </Button>
            ) : null}
          </>
        }
      />
      <ProductFilterPanel
        isOpen={areFiltersOpen}
        onClose={() => setAreFiltersOpen(false)}
        initialFilters={{ category, yarnId, patternId }}
        yarns={yarns}
        patterns={patterns}
        onApply={onApplyFilters}
      />
    </div>
  );
}
