"use client";

import { useMemo, useState } from "react";

import { showToast } from "@/components/ui/Toaster";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CustomerPageHeader from "@/components/modules/customer/CustomerPageHeader";
import CustomerProfileDialog from "@/components/modules/customer/CustomerProfileDialog";
import CustomerListPage from "@/components/modules/customer/CustomerListPage";
import { INITIAL_CUSTOMERS } from "@/data/customers";
import type {
  Customer,
  CustomerStatus,
  CustomerStatusFilter,
} from "./user.types";

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
      <CustomerListPage
        header={
          <CustomerPageHeader
            total={customers.length}
            active={activeCount}
            inactive={inactiveCount}
          />
        }
        customers={filteredCustomers}
        totalCustomers={customers.length}
        statusCounts={{
          all: customers.length,
          active: activeCount,
          inactive: inactiveCount,
        }}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onSelectCustomer={setSelectedCustomer}
        onToggleCustomer={setCustomerToToggle}
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
