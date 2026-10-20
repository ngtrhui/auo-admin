"use client";

import { FiUserCheck, FiUserX } from "react-icons/fi";

import type { ColumnDef } from "@/components/ui/table.types";
import { createColumnHelper } from "@/hooks/list/createColumnHelper";
import { useListColumns } from "@/hooks/list/useListColumns";
import { Button } from "@/components/ui/Button";
import {
  formatStaffDate,
  getStaffInitials,
  STAFF_STATUS_LABELS,
} from "@/data/staff";
import { cn } from "@/utils/classNames";
import type { StaffMember } from "@/types/staff";

interface UseStaffColumnsParams {
  staff: StaffMember[];
  onView: (staff: StaffMember) => void;
  onToggleStatus: (staff: StaffMember) => void;
}

const col = createColumnHelper<StaffMember>();

export function useStaffColumns({
  staff,
  onView,
  onToggleStatus,
}: UseStaffColumnsParams): ColumnDef<StaffMember>[] {
  return useListColumns(
    () => [
      col.display("name", {
        label: "Nhân viên",
        width: 250,
        align: "left",
        render: (member) => {
          const index = staff.findIndex((item) => item.id === member.id);
          const avatarClassName =
            index % 3 === 0
              ? "bg-[#F2E9E4] text-[#845F4E]"
              : index % 3 === 1
                ? "bg-[#E8EDF5] text-[#587094]"
                : "bg-[#E8F1EA] text-[#55785C]";

          return (
            <div className="flex items-center gap-3">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarClassName}`}
                aria-hidden
              >
                {getStaffInitials(member.fullName)}
              </div>
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => onView(member)}
                  className="max-w-full cursor-pointer truncate text-left text-sm font-semibold text-black hover:text-primary hover:underline"
                >
                  {member.fullName}
                </button>
                <p className="mt-0.5 truncate text-xs text-gray">
                  {member.email}
                </p>
              </div>
            </div>
          );
        },
      }),

      col.accessor("employeeCode", {
        label: "Mã nhân viên",
        width: 140,
        render: (employeeCode) => (
          <span className="text-sm font-medium text-black">{employeeCode}</span>
        ),
      }),

      col.accessor("hireDate", {
        label: "Ngày vào làm",
        width: 135,
        render: (hireDate) => (
          <span className="text-sm text-gray">{formatStaffDate(hireDate)}</span>
        ),
      }),

      col.accessor("resignationDate", {
        label: "Ngày nghỉ việc",
        width: 145,
        render: (resignationDate) => (
          <span className="text-sm text-gray">
            {formatStaffDate(resignationDate)}
          </span>
        ),
      }),

      col.display("status", {
        label: "Trạng thái",
        width: 180,
        align: "left",
        render: (member) => {
          const isActive = member.status === "active";

          return (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold",
                isActive
                  ? "bg-[#EAF6EF] text-[#32845A]"
                  : "bg-[#F2F2F2] text-[#727272]",
              )}
            >
              <span
                className={`size-1.5 rounded-full ${
                  isActive ? "bg-[#3D9A68]" : "bg-[#949494]"
                }`}
              />
              {STAFF_STATUS_LABELS[member.status]}
            </span>
          );
        },
      }),

      col.display("actions", {
        label: "Thao tác",
        width: 120,
        align: "right",
        render: (member) => {
          const isActive = member.status === "active";

          return (
            <div className="flex items-center justify-center gap-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => onToggleStatus(member)}
                aria-label={
                  isActive
                    ? `Vô hiệu hóa ${member.fullName}`
                    : `Kích hoạt ${member.fullName}`
                }
                title={
                  isActive ? "Vô hiệu hóa tài khoản" : "Kích hoạt tài khoản"
                }
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-lg text-gray transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive
                    ? "hover:bg-[#FFF0ED] hover:text-[#C86F5E]"
                    : "hover:bg-[#E8F5EF] hover:text-[#32845A]",
                )}
              >
                {isActive ? (
                  <FiUserX className="size-4" aria-hidden />
                ) : (
                  <FiUserCheck className="size-4" aria-hidden />
                )}
              </Button>
            </div>
          );
        },
      }),
    ],
    [staff, onView, onToggleStatus],
  );
}
