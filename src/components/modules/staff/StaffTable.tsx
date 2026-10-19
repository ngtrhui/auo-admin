"use client";

import Table from "@/components/ui/Table";
import { useStaffColumns } from "@/hooks/useStaffColumns";

import type { StaffMember } from "./staff.types";

interface StaffTableProps {
  staff: StaffMember[];
  onView: (staff: StaffMember) => void;
  onToggleStatus: (staff: StaffMember) => void;
}

export default function StaffTable({
  staff,
  onView,
  onToggleStatus,
}: StaffTableProps) {
  const columns = useStaffColumns({
    staff,
    onView,
    onToggleStatus,
  });

  return (
    <div className="min-h-0 flex-1">
      <Table
        columns={columns}
        data={staff}
        tableClassName="w-full"
        scrollContainerClassName="h-full"
      />
    </div>
  );
}
