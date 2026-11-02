import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";

import type { OrderStatus } from "./order.types";

export default function OrderStatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const isApproved = status === "approved";
  const isCancelled = status === "cancelled";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isApproved
          ? "bg-green/10 text-green"
          : isCancelled
            ? "bg-coral/10 text-coral"
            : "bg-orange/10 text-orange-dark"
      }`}
    >
      {isApproved ? (
        <FiCheckCircle aria-hidden />
      ) : isCancelled ? (
        <FiXCircle aria-hidden />
      ) : (
        <FiClock aria-hidden />
      )}
      {isApproved ? "Đã duyệt" : isCancelled ? "Đã hủy" : "Chưa duyệt"}
    </span>
  );
}
