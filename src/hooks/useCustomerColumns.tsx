"use client";

import { FiEye, FiUserCheck, FiUserX } from "react-icons/fi";

import type { ColumnDef } from "@/components/ui/table.types";
import { createColumnHelper } from "@/hooks/list/createColumnHelper";
import { useListColumns } from "@/hooks/list/useListColumns";

import {
  CUSTOMER_STATUS_LABELS,
  getCustomerAddress,
  getCustomerInitials,
} from "@/data/customers";

import type { Customer } from "@/components/modules/customer/user.types";

interface UseCustomerColumnsParams {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onToggleStatus: (customer: Customer) => void;
}

const col = createColumnHelper<Customer>();

export function useCustomerColumns({
  customers,
  onView,
  onToggleStatus,
}: UseCustomerColumnsParams): ColumnDef<Customer>[] {
  return useListColumns(
    () => [
      col.display("name", {
        label: "Khách hàng",
        align: "left",
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
                  onClick={() => onView(customer)}
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
      }),

      col.display("email", {
        label: "Thông tin liên hệ",
        align: "left",
        headerClassName: "!justify-start !text-left",
        render: (customer) => (
          <div className="min-w-0">
            <p className="truncate text-sm text-black">{customer.email}</p>
            <p className="mt-0.5 text-xs text-gray">{customer.phone}</p>
          </div>
        ),
      }),

      col.display("address", {
        label: "Địa chỉ",
        align: "left",
        headerClassName: "!justify-start !text-left",
        render: (customer) => (
          <span className="line-clamp-2 text-sm text-gray">
            {getCustomerAddress(customer.address)}
          </span>
        ),
      }),

      col.display("createdAt", {
        label: "Ngày tham gia",
        align: "left",
        headerClassName: "!justify-start !text-left",
        render: (customer) => (
          <span className="text-sm text-gray">{customer.createdAt}</span>
        ),
      }),

      col.display("status", {
        label: "Trạng thái",
        align: "left",
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
      }),

      col.display("actions", {
        label: "Thao tác",
        align: "right",
        headerClassName: "!justify-end !text-right",
        render: (customer) => {
          const isActive = customer.status === "active";

          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => onView(customer)}
                aria-label={`Xem hồ sơ ${customer.name}`}
                title="Xem hồ sơ"
                className="inline-flex size-9 items-center justify-center rounded-lg text-gray transition hover:bg-primary-light hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <FiEye className="size-4" aria-hidden />
              </button>

              <button
                type="button"
                onClick={() => onToggleStatus(customer)}
                aria-label={
                  isActive
                    ? `Vô hiệu hóa ${customer.name}`
                    : `Kích hoạt ${customer.name}`
                }
                title={
                  isActive ? "Vô hiệu hóa tài khoản" : "Kích hoạt tài khoản"
                }
                className={`inline-flex size-9 items-center justify-center rounded-lg text-gray transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? "hover:bg-[#FFF0ED] hover:text-[#C86F5E]"
                    : "hover:bg-[#E8F5EF] hover:text-[#32845A]"
                }`}
              >
                {isActive ? (
                  <FiUserX className="size-4" aria-hidden />
                ) : (
                  <FiUserCheck className="size-4" aria-hidden />
                )}
              </button>
            </div>
          );
        },
      }),
    ],
    [customers, onView, onToggleStatus],
  );
}
