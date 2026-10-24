"use client";

import { FiEdit2, FiTrash2 } from "react-icons/fi";

import { Button } from "@/components/ui/Button";
import { createColumnHelper } from "@/hooks/list/createColumnHelper";
import { useListColumns } from "@/hooks/list/useListColumns";
import type { Pattern } from "@/components/modules/pattern/pattern.types";

interface UsePatternColumnsParams {
  onEdit: (pattern: Pattern) => void;
  onDelete: (pattern: Pattern) => void;
}

const col = createColumnHelper<Pattern>();

export function usePatternColumns({
  onEdit,
  onDelete,
}: UsePatternColumnsParams) {
  return useListColumns(
    () => [
      col.accessor("name", {
        label: "Tên kiểu mẫu",
        width: 220,
        align: "left",
        render: (name) => (
          <span className="text-sm font-medium text-black">{name}</span>
        ),
      }),
      col.accessor("description", {
        label: "Mô tả",
        width: 300,
        align: "center",
        render: (description) => (
          <span className="text-sm text-black">{description || "—"}</span>
        ),
      }),
      col.display("actions", {
        label: "Thao tác",
        width: 120,
        render: (pattern) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              className="size-9"
              onClick={() => onEdit(pattern)}
              aria-label={`Sửa ${pattern.name}`}
              title="Sửa"
            >
              <FiEdit2 aria-hidden />
            </Button>
            <Button
              variant="danger"
              className="size-9"
              onClick={() => onDelete(pattern)}
              aria-label={`Xóa ${pattern.name}`}
              title="Xóa"
            >
              <FiTrash2 aria-hidden />
            </Button>
          </div>
        ),
      }),
    ],
    [onEdit, onDelete],
  );
}
