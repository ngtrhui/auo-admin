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
    <div className="min-h-0 flex-1 overflow-auto">
      <Table
        columns={columns}
        data={staff}
        tableClassName="min-w-[1120px]"
        headerClassName="!bg-[#FAF9F8] !text-[11px] !font-semibold !uppercase !tracking-wide !text-gray"
        tableCellClassName="!px-4 !py-4"
        getRowClassName={() => "hover:bg-[#FCFBFA]"}
      />
    </div>
  );
}
