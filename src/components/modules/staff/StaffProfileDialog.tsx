"use client";

import { FiBriefcase, FiCalendar, FiMail, FiMapPin, FiPhone } from "react-icons/fi";

import Modal from "@/components/ui/Modal";

import { getStaffInitials } from "@/data/staff";
import type { StaffMember } from "./staff.types";
import StaffStatusBadge from "@/components/modules/staff/StaffStatusBadge";

type StaffProfileDialogProps = {
  staff: StaffMember | null;
  onClose: () => void;
};

export default function StaffProfileDialog({
  staff,
  onClose,
}: StaffProfileDialogProps) {
  return (
    <Modal
      open={staff !== null}
      onClose={onClose}
      title="Thông tin nhân viên"
      maxWidth="600px"
      className="w-full"
      contentClassName="max-h-[75vh] overflow-y-auto"
    >
      {staff ? <StaffProfile staff={staff} /> : null}
    </Modal>
  );
}

function StaffProfile({ staff }: { staff: StaffMember }) {
  return (
    <div className="px-5 py-5 sm:px-7">
      <div className="flex flex-col gap-4 rounded-xl bg-[#FAF8F6] p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#EDE6E1] text-base font-bold text-primary">
          {getStaffInitials(staff.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-black">{staff.name}</h3>
          <p className="mt-0.5 truncate text-sm text-gray">{staff.position}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StaffStatusBadge status={staff.status} />
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-primary">
              {staff.role}
            </span>
          </div>
        </div>
        <span className="text-xs font-medium text-gray">{staff.id}</span>
      </div>

      <div className="mt-5">
        <h4 className="text-xs font-bold uppercase tracking-wide text-gray">
          Thông tin cá nhân
        </h4>
        <dl className="mt-2 divide-y divide-gray/10">
          <ProfileField icon={<FiMail />} label="Email" value={staff.email} />
          <ProfileField
            icon={<FiPhone />}
            label="Điện thoại"
            value={staff.phone}
          />
          <ProfileField
            icon={<FiBriefcase />}
            label="Phòng ban"
            value={staff.department}
          />
          <ProfileField
            icon={<FiMapPin />}
            label="Địa điểm"
            value={staff.location}
          />
          <ProfileField
            icon={<FiCalendar />}
            label="Ngày vào làm"
            value={staff.joinedAt}
          />
        </dl>
      </div>
    </div>
  );
}

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F5F3F2] text-gray">
        {icon}
      </span>
      <dt className="w-28 shrink-0 text-xs text-gray">{label}</dt>
      <dd className="min-w-0 break-all text-sm font-medium text-black">
        {value}
      </dd>
    </div>
  );
}
