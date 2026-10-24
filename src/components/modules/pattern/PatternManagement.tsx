"use client";

import { useMemo, useState, type FormEvent } from "react";

import ListPageLayout from "@/components/list/ListPageLayout";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { showToast } from "@/components/ui/Toaster";
import { useClientPagination } from "@/hooks/list/useClientPagination";
import { usePatterns } from "@/hooks/usePatterns";
import PatternFormDialog from "./PatternFormDialog";
import PatternListFilters from "./PatternListFilters";
import PatternPageHeader from "./PatternPageHeader";
import PatternTable from "./PatternTable";
import type { Pattern, PatternForm } from "./pattern.types";

const emptyForm = (): PatternForm => ({ name: "", description: "" });

export default function PatternManagement() {
  const { patterns, setPatterns } = usePatterns();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<PatternForm>(emptyForm);
  const [editingPattern, setEditingPattern] = useState<Pattern | null>(null);
  const [patternToDelete, setPatternToDelete] = useState<Pattern | null>(null);

  const filteredPatterns = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    if (!query) return patterns;
    return patterns.filter((pattern) =>
      [pattern.name, pattern.description]
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(query),
    );
  }, [patterns, search]);

  const { pageItems, totalItems, totalPages } = useClientPagination(
    filteredPatterns,
    currentPage,
    pageSize,
  );

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPattern(null);
    setForm(emptyForm());
  };

  const openCreateDialog = () => {
    setEditingPattern(null);
    setForm(emptyForm());
    setIsDialogOpen(true);
  };

  const openEditDialog = (pattern: Pattern) => {
    setEditingPattern(pattern);
    setForm({ name: pattern.name, description: pattern.description });
    setIsDialogOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      showToast("error", "Vui lòng nhập tên kiểu mẫu.");
      return;
    }

    const isDuplicate = patterns.some(
      (pattern) =>
        pattern.id !== editingPattern?.id &&
        pattern.name.toLocaleLowerCase("vi") === name.toLocaleLowerCase("vi"),
    );
    if (isDuplicate) {
      showToast("error", "Tên kiểu mẫu này đã tồn tại.");
      return;
    }

    if (editingPattern) {
      setPatterns((current) =>
        current.map((pattern) =>
          pattern.id === editingPattern.id
            ? { ...pattern, name, description: form.description.trim() }
            : pattern,
        ),
      );
      showToast("success", "Đã cập nhật kiểu mẫu.");
    } else {
      setPatterns((current) => [
        {
          id: crypto.randomUUID(),
          name,
          description: form.description.trim(),
        },
        ...current,
      ]);
      setSearch("");
      setCurrentPage(1);
      showToast("success", "Đã thêm kiểu mẫu.");
    }

    closeDialog();
  };

  const handleDelete = () => {
    if (!patternToDelete) return;

    setPatterns((current) =>
      current.filter((pattern) => pattern.id !== patternToDelete.id),
    );
    showToast("success", "Đã xóa kiểu mẫu.");
    setPatternToDelete(null);
  };

  return (
    <>
      <ListPageLayout
        header={<PatternPageHeader onAdd={openCreateDialog} />}
        filters={
          <PatternListFilters
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
          />
        }
        table={
          <PatternTable
            patterns={pageItems}
            onEdit={openEditDialog}
            onDelete={setPatternToDelete}
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

      <PatternFormDialog
        open={isDialogOpen}
        form={form}
        onChange={setForm}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        isEditing={editingPattern !== null}
      />

      <ConfirmDialog
        open={patternToDelete !== null}
        title="Xóa kiểu mẫu"
        message={`Bạn có chắc chắn muốn xóa "${patternToDelete?.name ?? ""}" không?`}
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setPatternToDelete(null)}
      />
    </>
  );
}
