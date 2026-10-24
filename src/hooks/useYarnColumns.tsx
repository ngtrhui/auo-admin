"use client";

import { FiEdit2, FiTrash2 } from "react-icons/fi";

import { Button } from "@/components/ui/Button";
import type { ColumnDef } from "@/components/ui/table.types";
import { createColumnHelper } from "@/hooks/list/createColumnHelper";
import { useListColumns } from "@/hooks/list/useListColumns";
import type { Pattern } from "@/components/modules/pattern/pattern.types";
import type { Yarn } from "@/components/modules/yarn/yarn.types";

interface UseYarnColumnsParams {
  onEdit: (yarn: Yarn) => void;
  onDelete: (yarn: Yarn) => void;
  patterns: Pattern[];
}

const col = createColumnHelper<Yarn>();

export function useYarnColumns({
  onEdit,
  onDelete,
  patterns,
}: UseYarnColumnsParams): ColumnDef<Yarn>[] {
  const patternNames = new Map(
    patterns.map((pattern) => [pattern.id, pattern.name]),
  );

  return useListColumns(
    () => [
      col.accessor("name", {
        label: "Tên chất liệu",
        width: 220,
        align: "left",
        render: (name) => (
          <span className="font-medium text-black text-sm">{name}</span>
        ),
      }),
      col.accessor("patternIds", {
        label: "Kiểu mẫu",
        width: 170,
        render: (patternIds) => (
          <span className="text-sm text-black">
            {patternIds.length > 0
              ? patternIds
                  .map((id) => patternNames.get(id) ?? id)
                  .join(", ")
              : "—"}
          </span>
        ),
      }),
      col.accessor("description", {
        label: "Mô tả",
        width: 260,
        align: "left",
        render: (description) => (
          <span className="text-sm text-black">{description || "—"}</span>
        ),
      }),
      col.display("actions", {
        label: "Thao tác",
        width: 120,
        render: (yarn) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              className="size-9"
              onClick={() => onEdit(yarn)}
              aria-label={`Sửa ${yarn.name}`}
              title="Sửa"
            >
              <FiEdit2 aria-hidden />
            </Button>
            <Button
              variant="danger"
              className="size-9 "
              onClick={() => onDelete(yarn)}
              aria-label={`Xóa ${yarn.name}`}
              title="Xóa"
            >
              <FiTrash2 aria-hidden />
            </Button>
          </div>
        ),
      }),
    ],
    [onEdit, onDelete, patternNames],
  );
}
