import { STAFF_STATUS_LABELS } from "@/data/staff";
import type { StaffStatus } from "./staff.types";

export default function StaffStatusBadge({
  status,
}: {
  status: StaffStatus;
}) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        isActive ? "bg-[#EAF6EF] text-[#32845A]" : "bg-[#F2F2F2] text-[#727272]"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          isActive ? "bg-[#3D9A68]" : "bg-[#949494]"
        }`}
      />
      {STAFF_STATUS_LABELS[status]}
    </span>
  );
}
