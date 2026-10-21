"use client";

import { useMemo, useState, type FormEvent } from "react";

import ListPageLayout from "@/components/list/ListPageLayout";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { showToast } from "@/components/ui/Toaster";
import { useClientPagination } from "@/hooks/list/useClientPagination";
import YarnFormDialog from "@/components/modules/yarn/YarnFormDialog";
import YarnListFilters from "@/components/modules/yarn/YarnListFilters";
import YarnPageHeader from "@/components/modules/yarn/YarnPageHeader";
import YarnTable from "@/components/modules/yarn/YarnTable";
import { INITIAL_YARNS, YARN_PATTERN_TYPES, YARN_TYPES } from "@/data/yarn";
import type { Yarn, YarnForm } from "./yarn.types";

const emptyYarnForm = (): YarnForm => ({
  code: "",
  name: "",
  type: YARN_TYPES[0],
  patternType: [],
  description: "",
});

export default function YarnManagement() {
  const [yarns, setYarns] = useState(INITIAL_YARNS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<YarnForm>(emptyYarnForm);
  const [editingYarn, setEditingYarn] = useState<Yarn | null>(null);
  const [yarnToDelete, setYarnToDelete] = useState<Yarn | null>(null);

  const filteredYarns = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    return yarns.filter((yarn) => {
      const matchesSearch =
        !query ||
        [
          yarn.code,
          yarn.name,
          yarn.type,
          yarn.patternType.join(" "),
          yarn.description,
        ]
          .join(" ")
          .toLocaleLowerCase("vi")
          .includes(query);
      return (
        matchesSearch && (typeFilter === "all" || yarn.type === typeFilter)
      );
    });
  }, [search, typeFilter, yarns]);

  const { pageItems, totalItems, totalPages } = useClientPagination(
    filteredYarns,
    currentPage,
    pageSize,
  );

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingYarn(null);
    setForm(emptyYarnForm());
  };

  const openCreateDialog = () => {
    setEditingYarn(null);
    setForm(emptyYarnForm());
    setIsDialogOpen(true);
  };

  const openEditDialog = (yarn: Yarn) => {
    setEditingYarn(yarn);
    setForm({
      code: yarn.code,
      name: yarn.name,
      type: yarn.type,
      patternType: yarn.patternType,
      description: yarn.description,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = form.code.trim();
    const name = form.name.trim();
    const isDuplicate = yarns.some(
      (yarn) =>
        yarn.id !== editingYarn?.id &&
        yarn.code.toLocaleLowerCase("vi") === code.toLocaleLowerCase("vi"),
    );

    if (isDuplicate) {
      showToast("error", "Mã chất liệu này đã tồn tại.");
      return;
    }

    if (!YARN_TYPES.includes(form.type)) {
      showToast("error", "Vui lòng chọn loại chất liệu.");
      return;
    }

    if (
      !form.patternType.every((patternType) =>
        YARN_PATTERN_TYPES.some((validType) => validType === patternType),
      )
    ) {
      showToast("error", "Kiểu mẫu không hợp lệ.");
      return;
    }

    if (editingYarn) {
      setYarns((current) =>
        current.map((yarn) =>
          yarn.id === editingYarn.id
            ? {
                ...yarn,
                ...form,
                code,
                name,
                description: form.description.trim(),
              }
            : yarn,
        ),
      );
      showToast("success", "Đã cập nhật chất liệu.");
    } else {
      const id =
        yarns.reduce((largest, yarn) => Math.max(largest, yarn.id), 0) + 1;
      setYarns((current) => [
        {
          id,
          ...form,
          code,
          name,
          description: form.description.trim(),
        },
        ...current,
      ]);
      setTypeFilter("all");
      setSearch("");
      setCurrentPage(1);
      showToast("success", "Đã thêm chất liệu vào danh sách mẫu.");
    }

    closeDialog();
  };

  const handleDelete = () => {
    if (!yarnToDelete) return;
    setYarns((current) =>
      current.filter((yarn) => yarn.id !== yarnToDelete.id),
    );
    showToast("success", "Đã xóa chất liệu.");
    setYarnToDelete(null);
  };

  return (
    <>
      <ListPageLayout
        header={<YarnPageHeader onAdd={openCreateDialog} />}
        filters={
          <YarnListFilters
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
          />
        }
        table={
          <YarnTable
            yarns={pageItems}
            onEdit={openEditDialog}
            onDelete={setYarnToDelete}
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
      <YarnFormDialog
        open={isDialogOpen}
        form={form}
        onChange={setForm}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        isEditing={editingYarn !== null}
      />
      <ConfirmDialog
        open={yarnToDelete !== null}
        title="Xóa chất liệu"
        message={`Bạn có chắc chắn muốn xóa "${yarnToDelete?.name ?? ""}" không?`}
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setYarnToDelete(null)}
      />
    </>
  );
}
