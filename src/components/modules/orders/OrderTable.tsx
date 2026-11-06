"use client";

import { memo } from "react";

import Table from "@/components/ui/Table";
import type { Order } from "./order.types";
import { useOrderColumns } from "@/hooks/useOrderColumns";

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
}

function OrderTable({ orders, onView }: OrderTableProps) {
  const columns = useOrderColumns();

  return (
    <div className="min-h-0 flex-1">
      <Table
        columns={columns}
        data={orders}
        onRowClick={onView}
        trClassName="hover:bg-row-hover"
        tableClassName="w-full"
        scrollContainerClassName="h-full"
      />
    </div>
  );
}

export default memo(OrderTable);
