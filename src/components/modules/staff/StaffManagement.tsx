"use client";

import { useMemo, useState, type FormEvent } from "react";

import { showToast } from "@/components/ui/Toaster";

import StaffCreateDialog from "@/components/modules/staff/StaffCreateDialog";
import StaffListPage from "@/components/modules/staff/StaffListPage";
import StaffPageHeader from "@/components/modules/staff/StaffPageHeader";
import StaffProfileDialog from "@/components/modules/staff/StaffProfileDialog";
import StaffStatusDialog from "@/components/modules/staff/StaffStatusDialog";
import { EMPTY_STAFF_FORM, getTodayDate, INITIAL_STAFF } from "@/data/staff";
import type {
  StaffForm,
  StaffMember,
  StaffStatus,
  StatusFilter,
} from "./staff.types";

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
      <StaffListPage
        header={
          <StaffPageHeader
            total={staff.length}
            active={activeCount}
            inactive={inactiveCount}
            onCreate={() => setIsCreateOpen(true)}
          />
        }
        staff={filteredStaff}
        totalStaff={staff.length}
        statusCounts={{
          all: staff.length,
          active: activeCount,
          inactive: inactiveCount,
        }}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onSelectStaff={setSelectedStaff}
        onToggleStaff={setStaffToToggle}
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
