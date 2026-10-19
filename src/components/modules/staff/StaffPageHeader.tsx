"use client";

import { FiUserPlus } from "react-icons/fi";

import { Button } from "@/components/ui/Button";

type StaffPageHeaderProps = {
  total: number;
  active: number;
  inactive: number;
  onCreate: () => void;
};

export default function StaffPageHeader({ onCreate }: StaffPageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 pb-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
          Quản lý nhân viên
        </h1>

        <Button
          leftIcon={<FiUserPlus className="size-4" />}
          onClick={onCreate}
          className="w-full sm:w-auto"
        >
          Cấp tài khoản mới
        </Button>
      </header>
    </div>
  );
}
