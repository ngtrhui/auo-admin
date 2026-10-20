"use client";

import { useMemo, useState } from "react";

import { showToast } from "@/components/ui/Toaster";
import ListPageLayout from "@/components/list/ListPageLayout";
import CustomerPageHeader from "@/components/modules/customer/CustomerPageHeader";
import CustomerProfileDialog from "@/components/modules/customer/CustomerProfileDialog";
import CustomerStatusDialog from "@/components/modules/customer/CustomerStatusDialog";
import CustomerListFilters from "@/components/modules/customer/CustomerListFilters";
import CustomerTable from "@/components/modules/customer/CustomerTable";
import { Pagination } from "@/components/ui/Pagination";
import { INITIAL_CUSTOMERS } from "@/data/customers";
import { useClientPagination } from "@/hooks/list/useClientPagination";
import type {
  Customer,
  CustomerStatus,
  CustomerStatusFilter,
} from "./user.types";

export default function CustomerManagement() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customerToToggle, setCustomerToToggle] = useState<Customer | null>(
    null,
  );

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("vi");

    return customers.filter((customer) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          customer.name,
          customer.email,
          customer.phone,
          customer.id,
          customer.userId,
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

  const { pageItems, totalItems, totalPages } = useClientPagination(
    filteredCustomers,
    currentPage,
    pageSize,
  );

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
    setCurrentPage(1);
    showToast(
      "success",
      nextStatus === "active"
        ? "Đã kích hoạt tài khoản trong danh sách mẫu."
        : "Đã vô hiệu hóa tài khoản trong danh sách mẫu.",
    );
    setCustomerToToggle(null);
  };

  return (
    <>
      <ListPageLayout
        header={<CustomerPageHeader />}
        filters={
          <div className="shrink-0">
            <CustomerListFilters
              search={search}
              onSearchChange={(value) => {
                setSearch(value);
                setCurrentPage(1);
              }}
            />
          </div>
        }
        table={
          <CustomerTable
            customers={pageItems}
            onView={setSelectedCustomer}
            onToggleStatus={setCustomerToToggle}
          />
        }
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
      <CustomerProfileDialog
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
      <CustomerStatusDialog
        customer={customerToToggle}
        onConfirm={handleToggleStatus}
        onCancel={() => setCustomerToToggle(null)}
      />
    </>
  );
}
