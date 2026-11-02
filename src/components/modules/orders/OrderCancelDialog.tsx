import ConfirmDialog from "@/components/ui/ConfirmDialog";

import type { Order } from "./order.types";

interface OrderCancelDialogProps {
  order: Order | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function OrderCancelDialog({
  order,
  onConfirm,
  onCancel,
}: OrderCancelDialogProps) {
  return (
    <ConfirmDialog
      open={order !== null}
      title="Xác nhận hủy đơn hàng"
      message={`Bạn có chắc chắn muốn hủy đơn hàng ${order?.id ?? ""}? Đơn hàng đã hủy sẽ không thể duyệt lại.`}
      confirmText="Hủy đơn hàng"
      cancelText="Quay lại"
      confirmVariant="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
