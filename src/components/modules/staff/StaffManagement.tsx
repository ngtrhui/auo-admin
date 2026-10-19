"use client";

import { useMemo, useState, type FormEvent } from "react";
import { FiSearch } from "react-icons/fi";

import { showToast } from "@/components/ui/Toaster";

import ListPageLayout from "@/components/list/ListPageLayout";
import StaffCreateDialog from "@/components/modules/staff/StaffCreateDialog";
import StaffPageHeader from "@/components/modules/staff/StaffPageHeader";
import StaffProfileDialog from "@/components/modules/staff/StaffProfileDialog";
import StaffStatusDialog from "@/components/modules/staff/StaffStatusDialog";
import { Input } from "@/components/ui/Input";
import StaffTable from "@/components/modules/staff/StaffTable";
import { EMPTY_STAFF_FORM, getTodayDate, INITIAL_STAFF } from "@/data/staff";
import type {
  StaffForm,
  StaffMember,
  StaffStatus,
  StatusFilter,
} from "./staff.types";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Đang hoạt động", value: "active" },
  { label: "Đã vô hiệu hóa", value: "inactive" },
];

export default function StaffManagement() {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<StaffForm>(EMPTY_STAFF_FORM);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staffToToggle, setStaffToToggle] = useState<StaffMember | null>(null);

  const activeCount = staff.filter(
    (member) => member.status === "active",
  ).length;
  const inactiveCount = staff.length - activeCount;

  const filteredStaff = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("vi");

    return staff.filter((member) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          member.fullName,
          member.email,
          member.phone,
          member.employeeCode,
          String(member.id),
          String(member.userId),
          member.position,
        ]
          .join(" ")
          .toLocaleLowerCase("vi")
          .includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, staff, statusFilter]);

  const handleCreateStaff = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = form.email.trim().toLocaleLowerCase("vi");
    if (
      staff.some((member) => member.email.toLocaleLowerCase("vi") === email)
    ) {
      showToast(
        "error",
        "Email này đã được sử dụng cho một tài khoản nhân viên.",
      );
      return;
    }

    const employeeCode = form.employeeCode.trim();
    if (
      staff.some(
        (member) =>
          member.employeeCode.toLocaleLowerCase("vi") ===
          employeeCode.toLocaleLowerCase("vi"),
      )
    ) {
      showToast("error", "Mã nhân viên này đã được sử dụng.");
      return;
    }

    const createdAt = getTodayDate();
    const nextId =
      staff.reduce((largestId, member) => Math.max(largestId, member.id), 0) +
      1;
    const newStaff: StaffMember = {
      id: nextId,
      userId: nextId,
      employeeCode,
      fullName: form.fullName.trim(),
      email,
      phone: form.phone.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      position: form.position.trim(),
      role: form.role,
      status: "active",
      hireDate: form.hireDate,
      resignationDate: null,
      createdAt,
      updatedAt: createdAt,
    };

    setStaff((currentStaff) => [newStaff, ...currentStaff]);
    setStatusFilter("all");
    setSearch("");
    setForm(EMPTY_STAFF_FORM);
    setIsCreateOpen(false);
    showToast("success", "Đã thêm nhân viên vào danh sách mẫu.");
  };

  const handleToggleStatus = () => {
    if (!staffToToggle) return;

    const nextStatus: StaffStatus =
      staffToToggle.status === "active" ? "inactive" : "active";
    setStaff((currentStaff) =>
      currentStaff.map((member) =>
        member.id === staffToToggle.id
          ? { ...member, status: nextStatus }
          : member,
      ),
    );
    showToast(
      "success",
      nextStatus === "active"
        ? "Đã kích hoạt tài khoản trong danh sách mẫu."
        : "Đã vô hiệu hóa tài khoản trong danh sách mẫu.",
    );
    setStaffToToggle(null);
  };

  return (
    <>
      <ListPageLayout
        className="gap-5 pb-4"
        header={
          <StaffPageHeader
            total={staff.length}
            active={activeCount}
            inactive={inactiveCount}
            onCreate={() => setIsCreateOpen(true)}
          />
        }
        cardClassName="rounded-2xl border border-gray/15 shadow-[0_4px_18px_rgba(30,24,22,0.04)]"
        filters={
          <div className="flex flex-col gap-4 border-b border-gray/10 px-4 py-4 sm:px-6 sm:pt-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-bold text-black">
                  Danh sách nhân viên
                </h2>
                <p className="mt-1 text-xs text-gray">
                  Hiển thị {filteredStaff.length} trên {staff.length} nhân viên
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative block sm:w-64">
                  <Input
                    leftIcon={<FiSearch />}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
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
                const count =
                  tab.value === "all"
                    ? staff.length
                    : tab.value === "active"
                      ? activeCount
                      : inactiveCount;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setStatusFilter(tab.value)}
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
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        }
        table={
          <StaffTable
            staff={filteredStaff}
            onView={setSelectedStaff}
            onToggleStatus={setStaffToToggle}
          />
        }
        pagination={
          <div className="flex flex-col gap-2 text-xs text-gray sm:flex-row sm:items-center sm:justify-between">
            <span>
              Đang hiển thị{" "}
              <strong className="font-semibold text-black">
                {filteredStaff.length}
              </strong>{" "}
              nhân viên
            </span>
          </div>
        }
      />
      <StaffCreateDialog
        open={isCreateOpen}
        form={form}
        setForm={setForm}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateStaff}
      />
      <StaffProfileDialog
        staff={selectedStaff}
        onClose={() => setSelectedStaff(null)}
      />
      <StaffStatusDialog
        staff={staffToToggle}
        onConfirm={handleToggleStatus}
        onCancel={() => setStaffToToggle(null)}
      />
    </>
  );
}
