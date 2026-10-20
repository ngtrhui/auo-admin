"use client";

import Table from "@/components/ui/Table";
import { useCustomerColumns } from "@/hooks/useCustomerColumns";
import type { Customer } from "@/components/modules/customer/user.types";

interface CustomerTableProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onToggleStatus: (customer: Customer) => void;
}

export default function CustomerTable({
  customers,
  onView,
  onToggleStatus,
}: CustomerTableProps) {
  const columns = useCustomerColumns({
    customers,
    onView,
    onToggleStatus,
  });

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <Table
        columns={columns}
        data={customers}
        tableClassName="w-full"
        scrollContainerClassName="h-full"
      />
    </div>
  );
}
