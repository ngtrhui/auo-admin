"use client";

import { FiPlus } from "react-icons/fi";

import { Button } from "@/components/ui/Button";

interface PatternPageHeaderProps {
  onAdd: () => void;
}

export default function PatternPageHeader({ onAdd }: PatternPageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
        Quản lý kiểu mẫu
      </h1>
      <Button
        leftIcon={<FiPlus className="size-4" aria-hidden />}
        onClick={onAdd}
        className="w-full sm:w-auto"
      >
        Thêm kiểu mẫu
      </Button>
    </header>
  );
}
