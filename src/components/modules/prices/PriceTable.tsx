"use client";

import { memo } from "react";
import Table from "@/components/ui/Table";
import { usePriceColumns } from "@/hooks/usePriceColumns";
import type { PriceDraft, PriceMaterial, ProductPriceRow } from "./price.types";

interface PriceTableProps {
  products: ProductPriceRow[];
  materials: PriceMaterial[];
  draft: PriceDraft;
  isReady: boolean;
  onPriceChange: (productId: string, materialId: string, value: string) => void;
  onMaterialGroupReorder: (sourceKey: string, targetKey: string) => void;
  onProductReorder: (sourceId: string, targetId: string) => void;
}

function PriceTable({
  products,
  materials,
  draft,
  isReady,
  onPriceChange,
  onMaterialGroupReorder,
  onProductReorder,
}: PriceTableProps) {
  const columns = usePriceColumns({
    materials,
    draft,
    isReady,
    onPriceChange,
    onMaterialGroupReorder,
    onProductReorder,
  });

  return (
    <Table
      columns={columns}
      data={products}
      headerClassName="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600"
      scrollContainerClassName="scrollbar max-h-[58vh] overflow-auto"
      tableCellClassName="px-3 py-3"
      tableClassName="min-w-max"
      trClassName="hover:bg-indigo-50/40"
    />
  );
}

export default memo(PriceTable);
