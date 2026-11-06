"use client";

import { FiUser } from "react-icons/fi";

import OrderStatusBadge from "@/components/modules/orders/OrderStatusBadge";
import type { Order } from "@/components/modules/orders/order.types";
import type { ColumnDef } from "@/components/ui/table.types";
import { useListColumns } from "@/hooks/list/useListColumns";

import { currency, formatDate, getOrderTotal } from "@/components/modules/orders/order.data";

export function useOrderColumns(): ColumnDef<Order>[] {
  return useListColumns(
    () => [
      {
        key: "order",
        label: "Mã đơn / Ngày đặt",
        align: "left",
        width: 175,
        headerClassName: "text-left [&>span]:justify-start",
        render: (order) => (
          <div>
            <p className="font-semibold text-primary">{order.id}</p>
            <p className="mt-1 text-xs text-gray">
              {formatDate(order.createdAt)}
            </p>
          </div>
        ),
      },
      {
        key: "customer",
        label: "Khách hàng",
        align: "left",
        width: 210,
        headerClassName: "text-left [&>span]:justify-start",
        render: (order) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-black">
              {order.customer}
            </p>
            <p className="mt-0.5 truncate text-xs text-gray">{order.phone}</p>
          </div>
        ),
      },
      {
        key: "items",
        label: "Sản phẩm",
        align: "left",
        width: 180,
        headerClassName: "text-left [&>span]:justify-start",
        render: (order) => (
          <div>
            <p className="font-medium text-black">
              {order.items[0].name}
              {order.items.length > 1 && (
                <span className="ml-1 text-xs font-normal text-gray">
                  +{order.items.length - 1} sản phẩm
                </span>
              )}
            </p>
            <p className="mt-1 text-xs text-gray">
              {order.items[0].category} · {order.items[0].sku}
            </p>
            <p className="mt-1 text-xs text-gray">
              {order.items.reduce((total, item) => total + item.quantity, 0)}{" "}
              sản phẩm
            </p>
          </div>
        ),
      },
      {
        key: "total",
        label: "Tổng tiền",
        align: "right",
        width: 130,
        render: (order) => (
          <span className="whitespace-nowrap font-semibold text-black">
            {currency.format(getOrderTotal(order))}
          </span>
        ),
      },
      {
        key: "status",
        label: "Trạng thái",
        align: "left",
        width: 130,
        render: (order) => <OrderStatusBadge status={order.status} />,
      },
      {
        key: "approver",
        label: "Nhân viên duyệt",
        align: "left",
        width: 180,
        headerClassName: "text-left [&>span]:justify-start",
        render: (order) =>
          order.approvedBy ? (
            <div className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F4F3FF] text-[#6941C6]">
                <FiUser aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-black">
                  {order.approvedBy}
                </p>
                <p className="mt-0.5 text-xs text-gray">
                  {order.approvedAt ? formatDate(order.approvedAt) : ""}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-sm text-gray">Chưa có</span>
          ),
      },
    ],
    [],
  );
}
