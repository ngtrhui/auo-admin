"use client";

import type { ReactNode } from "react";
import { FiEye, FiSearch, FiUserCheck, FiUserX } from "react-icons/fi";

import ListPageLayout from "@/components/list/ListPageLayout";
import { Input } from "@/components/ui/Input";
import Table, { type ColumnDef } from "@/components/ui/Table";

import { getStaffInitials } from "@/data/staff";
import type { StaffMember, StatusFilter } from "./staff.types";
import StaffStatusBadge from "@/components/modules/staff/StaffStatusBadge";

type StaffListPageProps = {
  header: ReactNode;
  staff: StaffMember[];
  totalStaff: number;
  statusCounts: { all: number; active: number; inactive: number };
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  onSelectStaff: (staff: StaffMember) => void;
  onToggleStaff: (staff: StaffMember) => void;
};

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Đang hoạt động", value: "active" },
  { label: "Đã vô hiệu hóa", value: "inactive" },
];

export default function StaffListPage({
  header,
  staff,
  totalStaff,
  statusCounts,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onSelectStaff,
  onToggleStaff,
}: StaffListPageProps) {
  const columns: ColumnDef<StaffMember>[] = [
    {
      key: "name",
      label: "Nhân viên",
      width: 300,
      headerClassName: "!justify-start !text-left",
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
              {getStaffInitials(member.name)}
            </div>
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onSelectStaff(member)}
                className="max-w-full truncate text-left text-sm font-semibold text-black hover:text-primary hover:underline"
              >
                {member.name}
              </button>
              <p className="mt-0.5 truncate text-xs text-gray">{member.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "joinedAt",
      label: "Ngày vào làm",
      width: 160,
      headerClassName: "!justify-start !text-left",
      render: (member) => (
        <span className="text-sm text-gray">{member.joinedAt}</span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      width: 180,
      headerClassName: "!justify-start !text-left",
      render: (member) => <StaffStatusBadge status={member.status} />,
    },
    {
      key: "actions",
      label: "Thao tác",
      width: 120,
      align: "right",
      headerClassName: "!justify-end !text-right",
      render: (member) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onSelectStaff(member)}
            aria-label={`Xem hồ sơ ${member.name}`}
            title="Xem hồ sơ"
            className="inline-flex size-9 items-center justify-center rounded-lg text-gray transition hover:bg-primary-light hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <FiEye className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onToggleStaff(member)}
            aria-label={
              member.status === "active"
                ? `Vô hiệu hóa ${member.name}`
                : `Kích hoạt ${member.name}`
            }
            title={
              member.status === "active"
                ? "Vô hiệu hóa tài khoản"
                : "Kích hoạt tài khoản"
            }
            className={`inline-flex size-9 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              member.status === "active"
                ? "text-gray hover:bg-[#FFF0ED] hover:text-[#C86F5E]"
                : "text-gray hover:bg-[#E8F5EF] hover:text-[#32845A]"
            }`}
          >
            {member.status === "active" ? (
              <FiUserX className="size-4" aria-hidden />
            ) : (
              <FiUserCheck className="size-4" aria-hidden />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <ListPageLayout
      className="gap-5 pb-4"
      header={header}
      cardClassName="rounded-2xl border border-gray/15 shadow-[0_4px_18px_rgba(30,24,22,0.04)]"
      filters={
        <div className="flex flex-col gap-4 border-b border-gray/10 px-4 py-4 sm:px-6 sm:pt-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-black">
                Danh sách nhân viên
              </h2>
              <p className="mt-1 text-xs text-gray">
                Hiển thị {staff.length} trên {totalStaff} nhân viên
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block sm:w-64">
                <Input
                  leftIcon={<FiSearch />}
                  value={search}
                  onChange={(event) => onSearchChange(event.target.value)}
                  label="Tìm tên nhân viên..."
                  aria-label="Tìm nhân viên"
                  className="h-10 w-full bg-white pl-9 pr-3 text-sm text-black outline-none transition"
                />
              </label>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Lọc trạng thái nhân viên"
            className="flex w-full gap-1 overflow-x-auto sm:w-fit"
          >
            {STATUS_TABS.map((tab) => {
              const isSelected = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onStatusFilterChange(tab.value)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    isSelected
                      ? "bg-primary-light text-primary"
                      : "text-gray hover:bg-[#F8F7F6] hover:text-black"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      isSelected
                        ? "bg-white text-primary"
                        : "bg-gray/10 text-gray"
                    }`}
                  >
                    {statusCounts[tab.value]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      }
      table={
        staff.length > 0 ? (
          <div className="min-h-0 flex-1 overflow-auto">
            <Table
              columns={columns}
              data={staff}
              tableClassName="min-w-[840px]"
              headerClassName="!bg-[#FAF9F8] !text-[11px] !font-semibold !uppercase !tracking-wide !text-gray"
              tableCellClassName="!px-4 !py-4"
              getRowClassName={() => "hover:bg-[#FCFBFA]"}
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#F5F3F2] text-gray">
              <FiSearch className="size-5" aria-hidden />
            </div>
            <p className="mt-3 text-sm font-semibold text-black">
              Không tìm thấy nhân viên
            </p>
            <p className="mt-1 text-xs text-gray">
              Thử thay đổi từ khóa hoặc bộ lọc của bạn.
            </p>
          </div>
        )
      }
      pagination={
        <div className="flex flex-col gap-2 text-xs text-gray sm:flex-row sm:items-center sm:justify-between">
          <span>
            Đang hiển thị{" "}
            <strong className="font-semibold text-black">{staff.length}</strong>{" "}
            nhân viên
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#3D9A68]" />
            Dữ liệu mẫu · thay đổi chỉ lưu trong phiên hiện tại
          </span>
        </div>
      }
    />
  );
}
