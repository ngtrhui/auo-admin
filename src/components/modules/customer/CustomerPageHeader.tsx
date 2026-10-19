"use client";

import { FiUserCheck, FiUserX, FiUsers } from "react-icons/fi";

import StatCard from "@/components/ui/StatCard";

type CustomerPageHeaderProps = {
  total: number;
  active: number;
  inactive: number;
};

export default function CustomerPageHeader({
  total,
  active,
  inactive,
}: CustomerPageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 pb-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
          Quản lý khách hàng
        </h1>
        <p className="mt-1.5 text-sm text-gray">
          Theo dõi tài khoản, thông tin liên hệ và địa chỉ khách hàng.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Tổng khách hàng"
          value={total}
          icon={FiUsers}
          variant="primary-light"
          showGrowth={false}
        />
        <StatCard
          title="Đang hoạt động"
          value={active}
          icon={FiUserCheck}
          variant="green-light"
          showGrowth={false}
        />
        <StatCard
          title="Đã vô hiệu hóa"
          value={inactive}
          icon={FiUserX}
          variant="coral-light"
          showGrowth={false}
        />
      </div>
    </div>
  );
}
