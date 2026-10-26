"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import SlidePanel from "@/components/ui/SlidePanel";
import type { Pattern } from "@/components/modules/pattern/pattern.types";
import type { Yarn } from "@/components/modules/yarn/yarn.types";

const PRODUCT_FILTER_FORM_ID = "product-filter-panel-form";

export interface ProductAdvancedFilters {
  category: string;
  yarnId: string;
  patternId: string;
}

interface ProductFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters: ProductAdvancedFilters;
  yarns: Yarn[];
  patterns: Pattern[];
  onApply: (filters: ProductAdvancedFilters) => void;
}

function FilterBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm font-bold text-black">{title}</p>
      {children}
    </div>
  );
}

function ProductFilterForm({
  initialFilters,
  yarns,
  patterns,
  onApply,
  onClose,
}: Omit<ProductFilterPanelProps, "isOpen">) {
  const [form, setForm] = useState<ProductAdvancedFilters>(initialFilters);

  const yarnOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả chất liệu" },
      ...yarns.map((yarn) => ({
        value: String(yarn.id),
        label: yarn.name,
      })),
    ],
    [yarns],
  );

  const patternOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả kiểu mẫu" },
      ...patterns.map((pattern) => ({
        value: pattern.id,
        label: pattern.name,
      })),
    ],
    [patterns],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply(form);
    onClose();
  };

  return (
    <form
      id={PRODUCT_FILTER_FORM_ID}
      className="flex flex-col gap-5"
      onSubmit={handleSubmit}
    >
      <FilterBlock title="Chất liệu">
        <Select
          options={yarnOptions}
          value={form.yarnId}
          onChange={(yarnId) => setForm((current) => ({ ...current, yarnId }))}
          ariaLabel="Lọc theo chất liệu"
          className="h-10 w-full"
          popoverZIndex={130}
        />
      </FilterBlock>

      <FilterBlock title="Kiểu mẫu">
        <Select
          options={patternOptions}
          value={form.patternId}
          onChange={(patternId) =>
            setForm((current) => ({ ...current, patternId }))
          }
          ariaLabel="Lọc theo kiểu mẫu"
          className="h-10 w-full"
          popoverZIndex={130}
        />
      </FilterBlock>
    </form>
  );
}

export default function ProductFilterPanel({
  isOpen,
  onClose,
  initialFilters,
  yarns,
  patterns,
  onApply,
}: ProductFilterPanelProps) {
  const formKey = JSON.stringify(initialFilters);

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Bộ lọc sản phẩm"
      width="md"
      contentClassName="p-4 sm:p-6"
      footer={
        <div className="flex w-full justify-center gap-3 p-3">
          <Button
            type="submit"
            form={PRODUCT_FILTER_FORM_ID}
            className="w-full"
          >
            Áp dụng
          </Button>
        </div>
      }
    >
      {isOpen ? (
        <ProductFilterForm
          key={formKey}
          initialFilters={initialFilters}
          yarns={yarns}
          patterns={patterns}
          onApply={onApply}
          onClose={onClose}
        />
      ) : null}
    </SlidePanel>
  );
}
