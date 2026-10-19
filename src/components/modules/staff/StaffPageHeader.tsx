"use client";

import { FiUserCheck, FiUserPlus, FiUserX, FiUsers } from "react-icons/fi";

import { Button } from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";

type StaffPageHeaderProps = {
  total: number;
  active: number;
  inactive: number;
  onCreate: () => void;
};

export default function StaffPageHeader({
  total,
  active,
  inactive,
  onCreate,
}: StaffPageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 pb-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
            Quản lý nhân viên
          </h1>
          <p className="mt-1.5 text-sm text-gray">
            Quản lý tài khoản và thông tin nhân sự trong tổ chức.
          </p>
        </div>
        <Button
          leftIcon={<FiUserPlus className="size-4" />}
          onClick={onCreate}
          className="w-full sm:w-auto"
        >
          Cấp tài khoản mới
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Tổng nhân viên"
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
