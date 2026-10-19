"use client";

import {
  FiCalendar,
  FiCreditCard,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUser,
} from "react-icons/fi";

import Modal from "@/components/ui/Modal";
import { CUSTOMER_STATUS_LABELS, getCustomerAddress, getCustomerInitials } from "@/data/customers";
import type { Customer } from "./user.types";

type CustomerProfileDialogProps = {
  customer: Customer | null;
  onClose: () => void;
};

export default function CustomerProfileDialog({
  customer,
  onClose,
}: CustomerProfileDialogProps) {
  return (
    <Modal
      open={customer !== null}
      onClose={onClose}
      title="Thông tin khách hàng"
      maxWidth="600px"
      className="w-full"
      contentClassName="max-h-[75vh] overflow-y-auto"
    >
      {customer ? <CustomerProfile customer={customer} /> : null}
    </Modal>
  );
}

function CustomerProfile({ customer }: { customer: Customer }) {
  const isActive = customer.status === "active";

  return (
    <div className="px-5 py-5 sm:px-7">
      <div className="flex flex-col gap-4 rounded-xl bg-[#FAF8F6] p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#EDE6E1] text-base font-bold text-primary">
          {getCustomerInitials(customer.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-black">
            {customer.name}
          </h3>
          <p className="mt-0.5 truncate text-sm text-gray">
            Mã khách hàng: {customer.id}
          </p>
          <span
            className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              isActive
                ? "bg-[#EAF6EF] text-[#32845A]"
                : "bg-[#F2F2F2] text-[#727272]"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                isActive ? "bg-[#3D9A68]" : "bg-[#949494]"
              }`}
            />
            {CUSTOMER_STATUS_LABELS[customer.status]}
          </span>
        </div>
        <span className="text-xs font-medium text-gray">
          Mã tài khoản: {customer.userId}
        </span>
      </div>

      <div className="mt-5">
        <h4 className="text-xs font-bold uppercase tracking-wide text-gray">
          Thông tin tài khoản
        </h4>
        <dl className="mt-2 divide-y divide-gray/10">
          <ProfileField icon={<FiMail />} label="Email" value={customer.email} />
          <ProfileField
            icon={<FiPhone />}
            label="Điện thoại"
            value={customer.phone}
          />
          <ProfileField
            icon={<FiUser />}
            label="Giới tính"
            value={customer.gender}
          />
          <ProfileField
            icon={<FiCalendar />}
            label="Ngày sinh"
            value={customer.dateOfBirth}
          />
          <ProfileField
            icon={<FiMapPin />}
            label="Địa chỉ"
            value={getCustomerAddress(customer.address)}
          />
        </dl>
      </div>

      <div className="mt-5">
        <h4 className="text-xs font-bold uppercase tracking-wide text-gray">
          Hoạt động tài khoản
        </h4>
        <dl className="mt-2 divide-y divide-gray/10">
          <ProfileField
            icon={<FiCreditCard />}
            label="Ngày tạo"
            value={customer.createdAt}
          />
          <ProfileField
            icon={<FiCalendar />}
            label="Cập nhật lần cuối"
            value={customer.updatedAt}
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
      <dt className="w-32 shrink-0 text-xs text-gray">{label}</dt>
      <dd className="min-w-0 break-all text-sm font-medium text-black">
        {value}
      </dd>
    </div>
  );
}
