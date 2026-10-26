"use client";

import { Button } from "@/components/ui/Button";
import type { ColumnDef } from "@/components/ui/table.types";
import type { ProductGroup } from "@/components/modules/product/product.types";
import { createColumnHelper } from "@/hooks/list/createColumnHelper";
import { useListColumns } from "@/hooks/list/useListColumns";
import { FiTrash2 } from "react-icons/fi";

interface UseProductColumnsParams {
  onDelete: (group: ProductGroup) => void;
}

const col = createColumnHelper<ProductGroup>();

export function useProductColumns({
  onDelete,
}: UseProductColumnsParams): ColumnDef<ProductGroup>[] {
  return useListColumns(
    () => [
      col.display("image", {
        label: "Ảnh",
        width: 80,
        render: (group) =>
          group.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={group.image}
              alt=""
              className="size-10 rounded-md object-cover"
            />
          ) : (
            <span className="flex size-10 items-center justify-center rounded-md bg-gray-50 text-gray">
              —
            </span>
          ),
      }),
      col.accessor("name", {
        label: "Tên sản phẩm",
        width: 240,
        align: "left",
        render: (name) => (
          <span className="text-sm font-medium text-black">{name}</span>
        ),
      }),
      col.accessor("yarnNames", {
        label: "Chất liệu",
        width: 180,
        align: "left",
        render: (names) => (
          <span className="text-sm text-black">
            {names.length > 0 ? names.join(", ") : "—"}
          </span>
        ),
      }),
      col.accessor("patternNames", {
        label: "Kiểu mẫu",
        width: 180,
        align: "left",
        render: (names) => (
          <span className="text-sm text-black">
            {names.length > 0 ? names.join(", ") : "—"}
          </span>
        ),
      }),
      col.display("categoryStocks", {
        label: "Danh mục / tồn kho",
        width: 420,
        align: "left",
        render: (group) => (
          <div className="flex flex-wrap gap-1.5">
            {group.products.map((product) => (
              <span
                key={product.id}
                className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary"
              >
                {product.kind === "combo"
                  ? product.name
                  : product.category === "Drap" && product.size
                    ? `Drap ${product.size}`
                    : product.category ?? "Chưa phân loại"}
                : {product.stock}
              </span>
            ))}
          </div>
        ),
      }),
      col.display("action", {
        label: "Thao tác",
        width: 110,
        render: (group) => (
          <Button
            type="button"
            variant="danger"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(group);
            }}
            aria-label={`Xóa nhóm sản phẩm ${group.name}`}
          >
            <FiTrash2 aria-hidden />
          </Button>
        ),
      }),
    ],
    [onDelete],
  );
}
