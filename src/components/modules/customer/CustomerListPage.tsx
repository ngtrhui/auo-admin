"use client";

import type { ReactNode } from "react";
import { FiEye, FiSearch, FiUserCheck, FiUserX } from "react-icons/fi";

import ListPageLayout from "@/components/list/ListPageLayout";
import { Input } from "@/components/ui/Input";
import Table, { type ColumnDef } from "@/components/ui/Table";
import {
  CUSTOMER_STATUS_LABELS,
  getCustomerAddress,
  getCustomerInitials,
} from "@/data/customers";
import type { Customer, CustomerStatusFilter } from "./user.types";

type UserListPageProps = {
  header: ReactNode;
  customers: Customer[];
  totalCustomers: number;
  statusCounts: { all: number; active: number; inactive: number };
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: CustomerStatusFilter;
  onStatusFilterChange: (status: CustomerStatusFilter) => void;
  onSelectCustomer: (customer: Customer) => void;
  onToggleCustomer: (customer: Customer) => void;
};

const STATUS_TABS: { label: string; value: CustomerStatusFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Đang hoạt động", value: "active" },
  { label: "Đã vô hiệu hóa", value: "inactive" },
];

export default function CustomerListPage({
  header,
  customers,
  totalCustomers,
  statusCounts,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onSelectCustomer,
  onToggleCustomer,
}: UserListPageProps) {
  const columns: ColumnDef<Customer>[] = [
    {
      key: "name",
      label: "Khách hàng",
      width: 260,
      headerClassName: "!justify-start !text-left",
      render: (customer) => {
        const index = customers.findIndex((item) => item.id === customer.id);
        const avatarClassName =
          index % 3 === 0
            ? "bg-[#F2E9E4] text-[#845F4E]"
            : index % 3 === 1
              ? "bg-[#E8EDF5] text-[#587094]"
              : "bg-[#E8F1EA] text-[#55785C]";

        return (
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarClassName}`}
              aria-hidden
            >
              {getCustomerInitials(customer.name)}
            </div>
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onSelectCustomer(customer)}
                className="max-w-full truncate text-left text-sm font-semibold text-black hover:text-primary hover:underline"
              >
                {customer.name}
              </button>
              <p className="mt-0.5 truncate text-xs text-gray">
                {customer.id}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "email",
      label: "Thông tin liên hệ",
      width: 230,
      headerClassName: "!justify-start !text-left",
      render: (customer) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-black">{customer.email}</p>
          <p className="mt-0.5 text-xs text-gray">{customer.phone}</p>
        </div>
      ),
    },
    {
      key: "address",
      label: "Địa chỉ",
      width: 250,
      headerClassName: "!justify-start !text-left",
      render: (customer) => (
        <span className="line-clamp-2 text-sm text-gray">
          {getCustomerAddress(customer.address)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Ngày tham gia",
      width: 145,
      headerClassName: "!justify-start !text-left",
      render: (customer) => (
        <span className="text-sm text-gray">{customer.createdAt}</span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      width: 165,
      headerClassName: "!justify-start !text-left",
      render: (customer) => {
        const isActive = customer.status === "active";

        return (
          <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              isActive
                ? "bg-[#EAF6EF] text-[#32845A]"
                : "bg-[#F2F2F2] text-[#727272]"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                isActive ? "bg-[#3D9A68]" : "bg-[#949494]"
              }`}
            />
            {CUSTOMER_STATUS_LABELS[customer.status]}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Thao tác",
      width: 110,
      align: "right",
      headerClassName: "!justify-end !text-right",
      render: (customer) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onSelectCustomer(customer)}
            aria-label={`Xem hồ sơ ${customer.name}`}
            title="Xem hồ sơ"
            className="inline-flex size-9 items-center justify-center rounded-lg text-gray transition hover:bg-primary-light hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <FiEye className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onToggleCustomer(customer)}
            aria-label={
              customer.status === "active"
                ? `Vô hiệu hóa ${customer.name}`
                : `Kích hoạt ${customer.name}`
            }
            title={
              customer.status === "active"
                ? "Vô hiệu hóa tài khoản"
                : "Kích hoạt tài khoản"
            }
            className={`inline-flex size-9 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              customer.status === "active"
                ? "text-gray hover:bg-[#FFF0ED] hover:text-[#C86F5E]"
                : "text-gray hover:bg-[#E8F5EF] hover:text-[#32845A]"
            }`}
          >
            {customer.status === "active" ? (
              <FiUserX className="size-4" aria-hidden />
            ) : (
              <FiUserCheck className="size-4" aria-hidden />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <ListPageLayout
      className="gap-5 pb-4"
      header={header}
      cardClassName="rounded-2xl border border-gray/15 shadow-[0_4px_18px_rgba(30,24,22,0.04)]"
      filters={
        <div className="flex flex-col gap-4 border-b border-gray/10 px-4 py-4 sm:px-6 sm:pt-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-black">
                Danh sách khách hàng
              </h2>
              <p className="mt-1 text-xs text-gray">
                Hiển thị {customers.length} trên {totalCustomers} khách hàng
              </p>
            </div>
            <label className="relative block sm:w-72">
              <Input
                leftIcon={<FiSearch />}
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                label="Tìm khách hàng..."
                aria-label="Tìm khách hàng"
                className="h-10 w-full bg-white pl-9 pr-3 text-sm text-black outline-none transition"
              />
            </label>
          </div>

          <div
            role="tablist"
            aria-label="Lọc trạng thái khách hàng"
            className="flex w-full gap-1 overflow-x-auto sm:w-fit"
          >
            {STATUS_TABS.map((tab) => {
              const isSelected = statusFilter === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onStatusFilterChange(tab.value)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    isSelected
                      ? "bg-primary-light text-primary"
                      : "text-gray hover:bg-[#F8F7F6] hover:text-black"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      isSelected
                        ? "bg-white text-primary"
                        : "bg-gray/10 text-gray"
                    }`}
                  >
                    {statusCounts[tab.value]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      }
      table={
        customers.length > 0 ? (
          <div className="min-h-0 flex-1 overflow-auto">
            <Table
              columns={columns}
              data={customers}
              tableClassName="min-w-[1160px]"
              headerClassName="!bg-[#FAF9F8] !text-[11px] !font-semibold !uppercase !tracking-wide !text-gray"
              tableCellClassName="!px-4 !py-4"
              getRowClassName={() => "hover:bg-[#FCFBFA]"}
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#F5F3F2] text-gray">
              <FiSearch className="size-5" aria-hidden />
            </div>
            <p className="mt-3 text-sm font-semibold text-black">
              Không tìm thấy khách hàng
            </p>
            <p className="mt-1 text-xs text-gray">
              Thử thay đổi từ khóa hoặc bộ lọc của bạn.
            </p>
          </div>
        )
      }
      pagination={
        <div className="flex flex-col gap-2 text-xs text-gray sm:flex-row sm:items-center sm:justify-between">
          <span>
            Đang hiển thị{" "}
            <strong className="font-semibold text-black">
              {customers.length}
            </strong>{" "}
            khách hàng
          </span>
        </div>
      }
    />
  );
}
