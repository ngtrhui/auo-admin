"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";

import type { StaffMember } from "./staff.types";

type StaffStatusDialogProps = {
  staff: StaffMember | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function StaffStatusDialog({
  staff,
  onConfirm,
  onCancel,
}: StaffStatusDialogProps) {
  const isActive = staff?.status === "active";

  return (
    <ConfirmDialog
      open={staff !== null}
      title={isActive ? "Vô hiệu hóa tài khoản?" : "Kích hoạt tài khoản?"}
      message={
        isActive
          ? `Tài khoản của ${staff?.name} sẽ không thể đăng nhập sau khi vô hiệu hóa.`
          : `Tài khoản của ${staff?.name} sẽ được phép đăng nhập trở lại.`
      }
      confirmText={isActive ? "Vô hiệu hóa" : "Kích hoạt"}
      confirmVariant={isActive ? "danger" : "primary"}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
