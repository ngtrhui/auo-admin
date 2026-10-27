"use client";

import { memo } from "react";
import Table from "@/components/ui/Table";
import { useProductColumns } from "@/hooks/useProductColumns";
import type { ProductGroup } from "@/components/modules/product/product.types";

interface ProductTableProps {
  groups: ProductGroup[];
  onSelect: (group: ProductGroup) => void;
  onDelete: (group: ProductGroup) => void;
}

function ProductTable({ groups, onSelect, onDelete }: ProductTableProps) {
  const columns = useProductColumns({ onDelete });

  return (
    <div className="min-h-0 flex-1">
      <Table
        columns={columns}
        data={groups}
        onRowClick={onSelect}
        trClassName="hover:bg-row-hover"
        tableClassName="w-full"
        scrollContainerClassName="h-full"
      />
    </div>
  );
}

export default memo(ProductTable);
