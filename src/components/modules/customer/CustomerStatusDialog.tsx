"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";

import type { Customer } from "./user.types";

type CustomerStatusDialogProps = {
  customer: Customer | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function CustomerStatusDialog({
  customer,
  onConfirm,
  onCancel,
}: CustomerStatusDialogProps) {
  const isActive = customer?.status === "active";

  return (
    <ConfirmDialog
      open={customer !== null}
      title={isActive ? "Vô hiệu hóa tài khoản?" : "Kích hoạt tài khoản?"}
      message={
        isActive
          ? `Tài khoản của ${customer?.name} sẽ không thể đăng nhập sau khi vô hiệu hóa.`
          : `Tài khoản của ${customer?.name} sẽ được phép đăng nhập trở lại.`
      }
      confirmText={isActive ? "Vô hiệu hóa" : "Kích hoạt"}
      confirmVariant={isActive ? "danger" : "primary"}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
