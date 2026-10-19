"use client";

import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";

import { showToast } from "@/components/ui/Toaster";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ListPageLayout from "@/components/list/ListPageLayout";
import CustomerPageHeader from "@/components/modules/customer/CustomerPageHeader";
import CustomerProfileDialog from "@/components/modules/customer/CustomerProfileDialog";
import CustomerTable from "@/components/modules/customer/CustomerTable";
import { Input } from "@/components/ui/Input";
import { INITIAL_CUSTOMERS } from "@/data/customers";
import type {
  Customer,
  CustomerStatus,
  CustomerStatusFilter,
} from "./user.types";

const STATUS_TABS: { label: string; value: CustomerStatusFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Đang hoạt động", value: "active" },
  { label: "Đã vô hiệu hóa", value: "inactive" },
];

export default function CustomerManagement() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatusFilter>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customerToToggle, setCustomerToToggle] = useState<Customer | null>(
    null,
  );

  const activeCount = customers.filter(
    (customer) => customer.status === "active",
  ).length;
  const inactiveCount = customers.length - activeCount;

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("vi");

    return customers.filter((customer) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          customer.id,
          customer.userId,
          customer.name,
          customer.email,
          customer.phone,
          customer.address.detail,
          customer.address.ward,
          customer.address.district,
          customer.address.province,
        ]
          .join(" ")
          .toLocaleLowerCase("vi")
          .includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const handleToggleStatus = () => {
    if (!customerToToggle) return;

    const nextStatus: CustomerStatus =
      customerToToggle.status === "active" ? "inactive" : "active";

    setCustomers((currentCustomers) =>
      currentCustomers.map((customer) =>
        customer.id === customerToToggle.id
          ? { ...customer, status: nextStatus }
          : customer,
      ),
    );
    showToast(
      "success",
      nextStatus === "active"
        ? "Đã kích hoạt tài khoản trong danh sách mẫu."
        : "Đã vô hiệu hóa tài khoản trong danh sách mẫu.",
    );
    setCustomerToToggle(null);
  };

  const isCustomerActive = customerToToggle?.status === "active";

  return (
    <>
      <ListPageLayout
        className="gap-5 pb-4"
        header={
          <CustomerPageHeader
            total={customers.length}
            active={activeCount}
            inactive={inactiveCount}
          />
        }
        cardClassName="rounded-2xl border border-gray/15 shadow-[0_4px_18px_rgba(30,24,22,0.04)]"
        filters={
          <div className="flex flex-col gap-4 border-b border-gray/10 px-4 py-4 sm:px-6 sm:pt-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-bold text-black">
                  Danh sách khách hàng
                </h2>
                <p className="mt-1 text-xs text-gray">
                  Hiển thị {filteredCustomers.length} trên {customers.length}{" "}
                  khách hàng
                </p>
              </div>
              <label className="relative block sm:w-72">
                <Input
                  leftIcon={<FiSearch />}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
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
                const count =
                  tab.value === "all"
                    ? customers.length
                    : tab.value === "active"
                      ? activeCount
                      : inactiveCount;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setStatusFilter(tab.value)}
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
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        }
        table={
          <CustomerTable
            customers={filteredCustomers}
            onView={setSelectedCustomer}
            onToggleStatus={setCustomerToToggle}
          />
        }
        pagination={
          <div className="flex flex-col gap-2 text-xs text-gray sm:flex-row sm:items-center sm:justify-between">
            <span>
              Đang hiển thị{" "}
              <strong className="font-semibold text-black">
                {filteredCustomers.length}
              </strong>{" "}
              khách hàng
            </span>
          </div>
        }
      />
      <CustomerProfileDialog
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
      <ConfirmDialog
        open={customerToToggle !== null}
        title={
          isCustomerActive ? "Vô hiệu hóa tài khoản?" : "Kích hoạt tài khoản?"
        }
        message={
          isCustomerActive
            ? `Tài khoản của ${customerToToggle?.name} sẽ không thể đăng nhập sau khi vô hiệu hóa.`
            : `Tài khoản của ${customerToToggle?.name} sẽ được phép đăng nhập trở lại.`
        }
        confirmText={isCustomerActive ? "Vô hiệu hóa" : "Kích hoạt"}
        confirmVariant={isCustomerActive ? "danger" : "primary"}
        onConfirm={handleToggleStatus}
        onCancel={() => setCustomerToToggle(null)}
      />
    </>
  );
}
