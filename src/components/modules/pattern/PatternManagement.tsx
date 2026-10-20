"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

import ListPageLayout from "@/components/list/ListPageLayout";
import ListSearchToolbar from "@/components/list/ListSearchToolbar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import Table from "@/components/ui/Table";
import { showToast } from "@/components/ui/Toaster";
import type { ColumnDef } from "@/components/ui/table.types";
import { useClientPagination } from "@/hooks/list/useClientPagination";

type Pattern = {
  id: number;
  code: string;
  name: string;
  type: string;
  description: string;
};

type PatternForm = Omit<Pattern, "id">;

const PATTERN_TYPES = ["Mẫu trơn", "Mẫu họa tiết"];
const INITIAL_PATTERNS: Pattern[] = [
  {
    id: 1,
    code: "PTN-001",
    name: "Mẫu trơn cơ bản",
    type: "Mẫu trơn",
    description: "Mẫu vải trơn",
  },
  {
    id: 2,
    code: "PTN-002",
    name: "Mẫu họa tiết cơ bản",
    type: "Mẫu họa tiết",
    description: "Mẫu vải có họa tiết",
  },
];

const emptyPatternForm = (): PatternForm => ({
  code: "",
  name: "",
  type: PATTERN_TYPES[0],
  description: "",
});

export default function PatternManagement() {
  const [patterns, setPatterns] = useState(INITIAL_PATTERNS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<PatternForm>(emptyPatternForm);
  const [editingPattern, setEditingPattern] = useState<Pattern | null>(null);
  const [patternToDelete, setPatternToDelete] = useState<Pattern | null>(null);

  const filteredPatterns = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    return patterns.filter((pattern) => {
      const matchesSearch =
        !query ||
        [pattern.code, pattern.name, pattern.type, pattern.description]
          .join(" ")
          .toLocaleLowerCase("vi")
          .includes(query);
      return (
        matchesSearch && (typeFilter === "all" || pattern.type === typeFilter)
      );
    });
  }, [patterns, search, typeFilter]);

  const { pageItems, totalItems, totalPages } = useClientPagination(
    filteredPatterns,
    currentPage,
    pageSize,
  );

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPattern(null);
    setForm(emptyPatternForm());
  };

  const openCreateDialog = () => {
    setEditingPattern(null);
    setForm(emptyPatternForm());
    setIsDialogOpen(true);
  };

  const openEditDialog = (pattern: Pattern) => {
    setEditingPattern(pattern);
    setForm({
      code: pattern.code,
      name: pattern.name,
      type: pattern.type,
      description: pattern.description,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = form.code.trim();
    const name = form.name.trim();
    const isDuplicate = patterns.some(
      (pattern) =>
        pattern.id !== editingPattern?.id &&
        pattern.code.toLocaleLowerCase("vi") === code.toLocaleLowerCase("vi"),
    );

    if (isDuplicate) {
      showToast("error", "Mã Pattern này đã tồn tại.");
      return;
    }

    if (!PATTERN_TYPES.includes(form.type)) {
      showToast("error", "Vui lòng chọn loại mẫu.");
      return;
    }

    if (editingPattern) {
      setPatterns((current) =>
        current.map((pattern) =>
          pattern.id === editingPattern.id
            ? {
                ...pattern,
                ...form,
                code,
                name,
                description: form.description.trim(),
              }
            : pattern,
        ),
      );
      showToast("success", "Đã cập nhật Pattern.");
    } else {
      const id =
        patterns.reduce(
          (largest, pattern) => Math.max(largest, pattern.id),
          0,
        ) + 1;
      setPatterns((current) => [
        { id, ...form, code, name, description: form.description.trim() },
        ...current,
      ]);
      setTypeFilter("all");
      setSearch("");
      setCurrentPage(1);
      showToast("success", "Đã thêm Pattern vào danh sách mẫu.");
    }

    closeDialog();
  };

  const handleDelete = () => {
    if (!patternToDelete) return;
    setPatterns((current) =>
      current.filter((pattern) => pattern.id !== patternToDelete.id),
    );
    showToast("success", "Đã xóa Pattern.");
    setPatternToDelete(null);
  };

  const columns: ColumnDef<Pattern>[] = [
    {
      key: "code",
      label: "Mã Pattern",
      width: 150,
      render: (pattern) => (
        <span className="font-semibold text-black">{pattern.code}</span>
      ),
    },
    {
      key: "name",
      label: "Tên Pattern",
      width: 220,
      render: (pattern) => (
        <span className="font-medium text-black">{pattern.name}</span>
      ),
    },
    {
      key: "type",
      label: "Loại mẫu",
      width: 170,
      render: (pattern) => (
        <span className="inline-flex rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
          {pattern.type}
        </span>
      ),
    },
    {
      key: "description",
      label: "Mô tả",
      width: 260,
      align: "left",
      render: (pattern) => (
        <span className="text-sm text-gray">{pattern.description || "—"}</span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      width: 120,
      render: (pattern) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            className="size-9 border-gray/20 p-0 text-gray hover:text-primary"
            onClick={() => openEditDialog(pattern)}
            aria-label={`Sửa ${pattern.name}`}
            title="Sửa"
          >
            <FiEdit2 aria-hidden />
          </Button>
          <Button
            variant="outline"
            className="size-9 border-gray/20 p-0 text-gray hover:border-coral hover:text-coral"
            onClick={() => setPatternToDelete(pattern)}
            aria-label={`Xóa ${pattern.name}`}
            title="Xóa"
          >
            <FiTrash2 aria-hidden />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <ListPageLayout
        header={
          <header className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
                Quản lý Pattern
              </h1>
              <p className="mt-1 text-sm text-gray">
                Tổng cộng {patterns.length} Pattern
              </p>
            </div>
            <Button
              leftIcon={<FiPlus className="size-4" aria-hidden />}
              onClick={openCreateDialog}
              className="w-full sm:w-auto"
            >
              Thêm Pattern
            </Button>
          </header>
        }
        filters={
          <ListSearchToolbar
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            searchPlaceholder="Tìm Pattern..."
            className="justify-between"
          >
            <Select
              options={[
                { value: "all", label: "Tất cả loại" },
                ...PATTERN_TYPES.map((type) => ({ value: type, label: type })),
              ]}
              value={typeFilter}
              onChange={(value) => {
                setTypeFilter(value);
                setCurrentPage(1);
              }}
              ariaLabel="Lọc theo loại mẫu"
              className="h-10 min-w-40"
            />
          </ListSearchToolbar>
        }
        table={
          <Table
            columns={columns}
            data={pageItems}
            tableClassName="w-full"
            scrollContainerClassName="h-full"
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
        title="Xóa Pattern"
        message={`Bạn có chắc chắn muốn xóa "${patternToDelete?.name ?? ""}" không?`}
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setPatternToDelete(null)}
      />
    </>
  );
}

function PatternFormDialog({
  open,
  form,
  onChange,
  onClose,
  onSubmit,
  isEditing,
}: {
  open: boolean;
  form: PatternForm;
  onChange: (updater: (current: PatternForm) => PatternForm) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${isEditing ? "Cập nhật" : "Thêm"} Pattern`}
      maxWidth="560px"
      contentClassName="max-h-[70vh] overflow-y-auto"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form="pattern-form">
            Lưu
          </Button>
        </>
      }
    >
      <form
        id="pattern-form"
        onSubmit={onSubmit}
        className="space-y-4 px-5 py-5 sm:px-7"
      >
        <FormField label="Mã Pattern" required>
          <Input
            required
            maxLength={50}
            value={form.code}
            onChange={(event) =>
              onChange((current) => ({ ...current, code: event.target.value }))
            }
            placeholder="Nhập mã Pattern"
            variant="standard"
            className="h-10"
          />
        </FormField>
        <FormField label="Tên Pattern" required>
          <Input
            required
            maxLength={120}
            value={form.name}
            onChange={(event) =>
              onChange((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Nhập tên Pattern"
            variant="standard"
            className="h-10"
          />
        </FormField>
        <FormField label="Loại mẫu" required>
          <Select
            options={PATTERN_TYPES.map((type) => ({ value: type, label: type }))}
            value={form.type}
            onChange={(type) => onChange((current) => ({ ...current, type }))}
            ariaLabel="Loại mẫu"
            className="h-10 w-full"
            popoverZIndex={110}
          />
        </FormField>
        <FormField label="Mô tả">
          <textarea
            value={form.description}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            maxLength={500}
            rows={3}
            placeholder="Nhập mô tả (không bắt buộc)"
            className="w-full resize-y rounded-lg border border-gray/20 px-4 py-3 text-sm text-black outline-none placeholder:text-gray focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </FormField>
      </form>
    </Modal>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-semibold text-black">
        {label}
        {required ? <span className="ml-0.5 text-[#C86F5E]">*</span> : null}
      </span>
      {children}
    </label>
  );
}
