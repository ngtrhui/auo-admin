"use client";

import { FiCheck, FiPackage, FiXCircle } from "react-icons/fi";

import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

import { currency, formatDate, getOrderTotal } from "./order.data";
import type { Order } from "./order.types";
import OrderStatusBadge from "@/components/modules/orders/OrderStatusBadge";

interface OrderDetailDialogProps {
  order: Order | null;
  onClose: () => void;
  onApprove: (order: Order) => void;
  onCancel: (order: Order) => void;
}

export default function OrderDetailDialog({
  order,
  onClose,
  onApprove,
  onCancel,
}: OrderDetailDialogProps) {
  return (
    <Modal
      open={order !== null}
      onClose={onClose}
      maxWidth="680px"
      className="w-full"
      title={
        order ? (
          <div className="flex min-w-0 flex-1 items-center gap-3 pr-7">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#175CD3]">
              <FiPackage aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-[#101828]">
                Chi tiết đơn hàng
              </h2>
              <p className="mt-0.5 text-xs font-medium text-[#667085]">
                {order.id}
              </p>
            </div>
            <div className="ml-auto">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        ) : null
      }
      contentClassName="overflow-y-auto"
    >
      {order && (
        <div className="space-y-5 p-5 sm:p-6">
          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#344054]">
              Thông tin khách hàng
            </h3>
            <div className="grid gap-3 rounded-xl border border-[#EAECF0] bg-[#FCFCFD] p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[#98A2B3]">Tên khách hàng</p>
                <p className="mt-1 text-sm font-medium text-[#344054]">
                  {order.customer}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#98A2B3]">Số điện thoại</p>
                <p className="mt-1 text-sm font-medium text-[#344054]">
                  {order.phone}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-[#98A2B3]">Email</p>
                <p className="mt-1 break-all text-sm font-medium text-[#344054]">
                  {order.email}
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[#344054]">
                Sản phẩm đặt hàng
              </h3>
              <span className="text-xs text-[#667085]">
                {order.items.reduce((total, item) => total + item.quantity, 0)}{" "}
                sản phẩm
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-[#EAECF0]">
              {order.items.map((item, index) => (
                <div
                  key={item.sku}
                  className={`flex items-center justify-between gap-4 p-4 ${
                    index > 0 ? "border-t border-[#EAECF0]" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#344054]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-[#667085]">
                      {item.category} · {item.detail}
                    </p>
                    <p className="mt-1 text-xs text-[#98A2B3]">
                      Mã sản phẩm: {item.sku} · Đơn giá:{" "}
                      {currency.format(item.price)}
                    </p>
                    <p className="mt-1 text-xs text-[#98A2B3]">
                      Số lượng: {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-[#101828]">
                    {currency.format(item.price * item.quantity)}
                  </p>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-[#EAECF0] bg-[#F9FAFB] px-4 py-3">
                <span className="text-sm font-medium text-[#475467]">
                  Tổng đơn hàng
                </span>
                <span className="text-base font-bold text-[#101828]">
                  {currency.format(getOrderTotal(order))}
                </span>
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#EAECF0] p-4">
              <p className="text-xs text-[#98A2B3]">Thời gian đặt</p>
              <p className="mt-1 text-sm font-medium text-[#344054]">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="rounded-xl border border-[#EAECF0] p-4">
              <p className="text-xs text-[#98A2B3]">Nhân viên duyệt</p>
              {order.approvedBy ? (
                <>
                  <p className="mt-1 text-sm font-semibold text-[#344054]">
                    {order.approvedBy}
                  </p>
                  <p className="mt-1 text-xs text-[#667085]">
                    {order.approvedAt ? formatDate(order.approvedAt) : ""}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm font-medium text-orange-dark">
                  Đơn hàng chưa được duyệt
                </p>
              )}
            </div>
          </section>

          {order.status === "cancelled" && (
            <section className="rounded-xl border border-coral/20 bg-coral/5 p-4">
              <h3 className="text-sm font-semibold text-coral">
                Thông tin hủy đơn
              </h3>
              <p className="mt-1 text-sm text-[#344054]">
                Hủy bởi: {order.cancelledBy || "Không rõ"}
              </p>
              {order.cancelledAt && (
                <p className="mt-1 text-xs text-[#667085]">
                  Thời gian hủy: {formatDate(order.cancelledAt)}
                </p>
              )}
            </section>
          )}

          {order.note && (
            <div className="rounded-xl bg-[#FFFAEB] px-4 py-3">
              <p className="text-xs font-semibold text-[#B54708]">
                Ghi chú của khách hàng
              </p>
              <p className="mt-1 text-sm text-[#7A2E0E]">{order.note}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-[#EAECF0] pt-4">
            {order.status === "pending" && (
              <Button
                leftIcon={<FiCheck aria-hidden />}
                onClick={() => onApprove(order)}
              >
                Duyệt đơn hàng
              </Button>
            )}
            {order.status !== "cancelled" && (
              <Button
                variant="danger"
                leftIcon={<FiXCircle aria-hidden />}
                onClick={() => onCancel(order)}
              >
                Hủy đơn hàng
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
