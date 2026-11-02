"use client";

import { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import ListPageLayout from "@/components/list/ListPageLayout";
import { Pagination } from "@/components/ui/Pagination";
import { showToast } from "@/components/ui/Toaster";
import { useClientPagination } from "@/hooks/list/useClientPagination";

import OrderCancelDialog from "@/components/modules/orders/OrderCancelDialog";
import OrderDetailDialog from "@/components/modules/orders/OrderDetailDialog";
import OrderListFilters from "@/components/modules/orders/OrderListFilters";
import { INITIAL_ORDERS } from "./order.data";
import type { DateRange, Order, StatusFilter } from "./order.types";
import OrderStatusTabs from "@/components/modules/orders/OrderStatusTabs";
import OrderTable from "@/components/modules/orders/OrderTable";

export default function OrderManagement() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const counts = useMemo(
    () => ({
      all: orders.length,
      pending: orders.filter((order) => order.status === "pending").length,
      approved: orders.filter((order) => order.status === "approved").length,
      cancelled: orders.filter((order) => order.status === "cancelled").length,
    }),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      const matchesSearch =
        !query ||
        [
          order.id,
          order.customer,
          order.phone,
          order.email,
          ...order.items.flatMap((item) => [
            item.name,
            item.sku,
            item.category,
          ]),
        ]
          .join(" ")
          .toLocaleLowerCase("vi")
          .includes(query);
      const orderDate = order.createdAt.slice(0, 10);
      const matchesDate =
        (!dateRange.from || orderDate >= dateRange.from) &&
        (!dateRange.to || orderDate <= dateRange.to);

      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [dateRange, orders, search, statusFilter]);

  const { pageItems, totalItems, totalPages } = useClientPagination(
    filteredOrders,
    currentPage,
    pageSize,
  );

  const approveOrder = useCallback(
    (order: Order) => {
      const approver = session?.user?.name?.trim() || "Nhân viên hiện tại";
      const approvedAt = new Date().toISOString();

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? { ...item, status: "approved", approvedBy: approver, approvedAt }
            : item,
        ),
      );
      setSelectedOrder((current) =>
        current?.id === order.id
          ? { ...current, status: "approved", approvedBy: approver, approvedAt }
          : current,
      );
      showToast("success", `Đã duyệt đơn hàng ${order.id}.`);
    },
    [session?.user?.name],
  );

  const cancelOrder = useCallback(() => {
    if (!orderToCancel) return;

    const cancelledBy = session?.user?.name?.trim() || "Nhân viên hiện tại";
    const cancelledAt = new Date().toISOString();
    const cancelledOrderId = orderToCancel.id;

    setOrders((current) =>
      current.map((item) =>
        item.id === cancelledOrderId
          ? { ...item, status: "cancelled", cancelledBy, cancelledAt }
          : item,
      ),
    );
    setSelectedOrder((current) =>
      current?.id === cancelledOrderId
        ? { ...current, status: "cancelled", cancelledBy, cancelledAt }
        : current,
    );
    setOrderToCancel(null);
    showToast("success", `Đã hủy đơn hàng ${cancelledOrderId}.`);
  }, [orderToCancel, session?.user?.name]);

  const updateSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const updateDateRange = (range: DateRange) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  return (
    <>
      <ListPageLayout
        header={
          <header className="flex flex-col gap-5 pb-5">
            <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
              Quản lý đơn hàng
            </h1>
          </header>
        }
        filters={
          <div className="flex items-center justify-between">
            <OrderStatusTabs
              statusFilter={statusFilter}
              onStatusFilterChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
              counts={counts}
            />
            <OrderListFilters
              search={search}
              onSearchChange={updateSearch}
              dateRange={dateRange}
              onDateRangeChange={updateDateRange}
            />
          </div>
        }
        table={<OrderTable orders={pageItems} onView={setSelectedOrder} />}
        pagination={
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            totalItems={totalItems}
          />
        }
      />
      <OrderDetailDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onApprove={approveOrder}
        onCancel={setOrderToCancel}
      />
      <OrderCancelDialog
        order={orderToCancel}
        onConfirm={cancelOrder}
        onCancel={() => setOrderToCancel(null)}
      />
    </>
  );
}
