"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@/components/ui/Table";
import PriceInput from "@/components/modules/prices/PriceInput";
import type {
  PriceDraft,
  PriceMaterial,
  ProductPriceRow,
} from "@/components/modules/prices/price.types";

interface UsePriceColumnsParams {
  materials: PriceMaterial[];
  draft: PriceDraft;
  isReady: boolean;
  onPriceChange: (productId: string, materialId: string, value: string) => void;
  onMaterialGroupReorder: (sourceKey: string, targetKey: string) => void;
  onProductReorder: (sourceId: string, targetId: string) => void;
}

export function usePriceColumns({
  materials,
  draft,
  isReady,
  onPriceChange,
  onMaterialGroupReorder,
  onProductReorder,
}: UsePriceColumnsParams): ColumnDef<ProductPriceRow>[] {
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [draggedMaterialGroup, setDraggedMaterialGroup] = useState<
    string | null
  >(null);
  const [materialGroupDropTarget, setMaterialGroupDropTarget] = useState<
    string | null
  >(null);

  const materialGroupKeys = useMemo(
    () => [...new Set(materials.map((material) => material.group.key))],
    [materials],
  );

  return useMemo<ColumnDef<ProductPriceRow>[]>(
    () => [
      {
        key: "name",
        label: "Sản phẩm",
        width: 220,
        pinned: "left",
        align: "left",
        headerClassName: "border-r border-slate-200 text-left",
        cellClassName: "border-r border-slate-100",
        render: (product) => (
          <div
            aria-label={`Kéo để sắp xếp ${product.name}`}
            className={`flex min-w-48 items-center justify-between gap-3 rounded-md transition ${
              draggedProductId === product.id
                ? "opacity-40"
                : dropTargetId === product.id
                  ? "bg-indigo-100"
                  : ""
            } ${isReady ? "cursor-grab active:cursor-grabbing" : ""}`}
            draggable={isReady}
            onDragEnd={() => {
              setDraggedProductId(null);
              setDropTargetId(null);
            }}
            onDragOver={(event) => {
              if (!draggedProductId || draggedProductId === product.id) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setDropTargetId(product.id);
            }}
            onDragStart={(event) => {
              setDraggedProductId(product.id);
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData(
                "application/x-auo-price-product-row",
                product.id,
              );
            }}
            onDrop={(event) => {
              event.preventDefault();
              const sourceId =
                event.dataTransfer.getData(
                  "application/x-auo-price-product-row",
                ) || draggedProductId;
              if (sourceId && sourceId !== product.id) {
                onProductReorder(sourceId, product.id);
              }
              setDraggedProductId(null);
              setDropTargetId(null);
            }}
          >
            <div>
              <span className="block text-sm font-semibold text-slate-800">
                {product.name}
              </span>
              <span className="mt-1 block text-xs text-slate-400">
                {product.category}
              </span>
            </div>
          </div>
        ),
      },
      ...materials.map(
        (material, index): ColumnDef<ProductPriceRow> => ({
          key: `price-${material.id}`,
          label: material.pattern,
          group: {
            key: material.group.key,
            label: (
              <div
                aria-label={`Sắp xếp nhóm chất liệu ${material.group.label}`}
                aria-roledescription="nhóm cột có thể kéo để sắp xếp"
                className={`flex items-center justify-center gap-1.5 rounded px-1 transition ${
                  draggedMaterialGroup === material.group.key
                    ? "opacity-40"
                    : materialGroupDropTarget === material.group.key
                      ? "bg-indigo-100"
                      : ""
                } ${isReady ? "cursor-grab active:cursor-grabbing" : ""}`}
                draggable={isReady}
                onDragEnd={() => {
                  setDraggedMaterialGroup(null);
                  setMaterialGroupDropTarget(null);
                }}
                onDragOver={(event) => {
                  if (
                    !draggedMaterialGroup ||
                    draggedMaterialGroup === material.group.key
                  ) {
                    return;
                  }
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setMaterialGroupDropTarget(material.group.key);
                }}
                onDragStart={(event) => {
                  setDraggedMaterialGroup(material.group.key);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData(
                    "application/x-auo-price-material-group",
                    material.group.key,
                  );
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const sourceKey =
                    event.dataTransfer.getData(
                      "application/x-auo-price-material-group",
                    ) || draggedMaterialGroup;
                  if (sourceKey && sourceKey !== material.group.key) {
                    onMaterialGroupReorder(sourceKey, material.group.key);
                  }
                  setDraggedMaterialGroup(null);
                  setMaterialGroupDropTarget(null);
                }}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                    return;
                  }
                  const groupIndex = materialGroupKeys.indexOf(
                    material.group.key,
                  );
                  const adjacentGroup =
                    materialGroupKeys[
                      groupIndex + (event.key === "ArrowLeft" ? -1 : 1)
                    ];
                  if (adjacentGroup) {
                    event.preventDefault();
                    if (event.key === "ArrowLeft") {
                      onMaterialGroupReorder(material.group.key, adjacentGroup);
                    } else {
                      onMaterialGroupReorder(adjacentGroup, material.group.key);
                    }
                  }
                }}
                role={isReady ? "button" : undefined}
                tabIndex={isReady ? 0 : undefined}
                title="Kéo để sắp xếp nhóm chất liệu; dùng phím mũi tên trái/phải khi tiêu điểm"
              >
                <span>{material.group.label}</span>
              </div>
            ),
          },
          width: 140,
          align: "center",
          headerClassName: `${
            materials[index + 1]?.group.key !== material.group.key
              ? "border-r border-slate-300"
              : "border-r border-slate-200"
          } text-xs font-medium text-slate-500`,
          cellClassName:
            materials[index + 1]?.group.key !== material.group.key
              ? "border-r border-slate-200"
              : undefined,
          render: (product) => (
            <PriceInput
              disabled={!isReady}
              label={`Giá ${product.name} - ${material.group.label} / ${material.pattern}`}
              onChange={(value) => onPriceChange(product.id, material.id, value)}
              value={draft.products[product.id]?.[material.id] ?? ""}
            />
          ),
        }),
      ),
    ],
    [
      draft,
      draggedMaterialGroup,
      draggedProductId,
      isReady,
      materialGroupDropTarget,
      materialGroupKeys,
      materials,
      onMaterialGroupReorder,
      onPriceChange,
      onProductReorder,
      dropTargetId,
    ],
  );
}
