"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { showToast } from "@/components/ui/Toaster";
import {
  PILLOWS,
  PRICE_MATERIAL_ORDER_STORAGE_KEY,
  PRICE_PRODUCT_ORDER_STORAGE_KEY,
  PRICE_STORAGE_KEY,
} from "@/components/modules/prices/price.data";
import type { PriceDraft } from "@/components/modules/prices/price.types";
import {
  createDefaultDraft,
  getPriceMaterials,
  getPriceRows,
  moveKeyBefore,
  orderPriceMaterials,
  parseDraft,
  parseStoredPrices,
  reconcileDraft,
} from "@/utils/price";
import { usePatterns } from "@/hooks/usePatterns";
import { useProducts } from "@/hooks/useProducts";
import { useYarns } from "@/hooks/useYarns";

export function usePriceManagement() {
  const productCatalog = useProducts();
  const yarnCatalog = useYarns();
  const patternCatalog = usePatterns();
  const rows = useMemo(
    () => getPriceRows(productCatalog.products),
    [productCatalog.products],
  );
  const materials = useMemo(
    () => getPriceMaterials(yarnCatalog.yarns, patternCatalog.patterns),
    [patternCatalog.patterns, yarnCatalog.yarns],
  );
  const catalogReady =
    productCatalog.ready && yarnCatalog.ready && patternCatalog.ready;
  const initialDraft = useMemo(
    () => createDefaultDraft(rows, materials),
    [materials, rows],
  );
  const [draft, setDraft] = useState<PriceDraft>(initialDraft);
  const [savedDraft, setSavedDraft] = useState<PriceDraft>(initialDraft);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [materialGroupOrder, setMaterialGroupOrder] = useState<string[]>([]);
  const [productRowOrder, setProductRowOrder] = useState<string[]>([]);
  const [materialOrderReady, setMaterialOrderReady] = useState(false);
  const [productOrderReady, setProductOrderReady] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const hasLoadedPrices = useRef(false);
  const hasLoadedMaterialOrder = useRef(false);
  const hasLoadedProductOrder = useRef(false);
  const previousDimensions = useRef("");
  const orderedMaterials = useMemo(
    () => orderPriceMaterials(materials, materialGroupOrder),
    [materials, materialGroupOrder],
  );
  const orderedMaterialGroupKeys = useMemo(
    () => [...new Set(orderedMaterials.map((material) => material.group.key))],
    [orderedMaterials],
  );
  const orderedProductRows = useMemo(() => {
    const rowPosition = new Map(
      productRowOrder.map((id, index) => [id, index]),
    );
    return [...rows].sort(
      (left, right) =>
        (rowPosition.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
        (rowPosition.get(right.id) ?? Number.MAX_SAFE_INTEGER),
    );
  }, [productRowOrder, rows]);
  const dimensionsKey = JSON.stringify([
    rows.map((row) => row.id).sort(),
    materials.map((material) => material.id).sort(),
  ]);

  useEffect(() => {
    if (!catalogReady) return;

    if (!hasLoadedMaterialOrder.current) {
      let savedOrder: unknown;
      try {
        const storedOrder = window.localStorage.getItem(
          PRICE_MATERIAL_ORDER_STORAGE_KEY,
        );
        if (storedOrder !== null) {
          savedOrder = JSON.parse(storedOrder) as unknown;
          if (
            !Array.isArray(savedOrder) ||
            !savedOrder.every((key) => typeof key === "string")
          ) {
            throw new Error("Thứ tự chất liệu đã lưu không hợp lệ.");
          }
        }
      } catch (error) {
        console.error("Không thể tải thứ tự chất liệu đã lưu.", error);
        showToast(
          "error",
          "Không thể tải thứ tự chất liệu đã lưu. Đang dùng thứ tự mặc định.",
        );
      }

      const savedKeys = Array.isArray(savedOrder)
        ? savedOrder.filter((key): key is string => typeof key === "string")
        : [];
      setMaterialGroupOrder(
        [
          ...new Set(
            orderPriceMaterials(materials, savedKeys).map(
              (material) => material.group.key,
            ),
          ),
        ],
      );
      hasLoadedMaterialOrder.current = true;
      setMaterialOrderReady(true);
    }

    if (!hasLoadedProductOrder.current) {
      let savedOrder: unknown;
      try {
        const storedOrder = window.localStorage.getItem(
          PRICE_PRODUCT_ORDER_STORAGE_KEY,
        );
        if (storedOrder !== null) {
          savedOrder = JSON.parse(storedOrder) as unknown;
          if (
            !Array.isArray(savedOrder) ||
            !savedOrder.every((key) => typeof key === "string")
          ) {
            throw new Error("Thứ tự sản phẩm đã lưu không hợp lệ.");
          }
        }
      } catch (error) {
        console.error("Không thể tải thứ tự sản phẩm đã lưu.", error);
        showToast(
          "error",
          "Không thể tải thứ tự sản phẩm đã lưu. Đang dùng thứ tự mặc định.",
        );
      }

      const savedKeys = Array.isArray(savedOrder)
        ? savedOrder.filter((key): key is string => typeof key === "string")
        : [];
      const knownKeys = new Set(rows.map((row) => row.id));
      const restoredOrder = savedKeys.filter((key) => knownKeys.has(key));
      setProductRowOrder([
        ...restoredOrder,
        ...rows
          .map((row) => row.id)
          .filter((key) => !restoredOrder.includes(key)),
      ]);
      hasLoadedProductOrder.current = true;
      setProductOrderReady(true);
    }

    if (!hasLoadedPrices.current) {
      let loadedDraft = initialDraft;
      try {
        const stored = window.localStorage.getItem(PRICE_STORAGE_KEY);
        if (stored !== null) {
          loadedDraft = parseStoredPrices(
            JSON.parse(stored) as unknown,
            rows,
            materials,
          );
        }
      } catch (error) {
        console.error("Không thể tải bảng giá đã lưu.", error);
        showToast(
          "error",
          "Không thể tải bảng giá đã lưu. Đang dùng giá mặc định.",
        );
      }

      setDraft(loadedDraft);
      setSavedDraft(loadedDraft);
      hasLoadedPrices.current = true;
      previousDimensions.current = dimensionsKey;
      setIsReady(true);
      return;
    }

    if (previousDimensions.current !== dimensionsKey) {
      setDraft((current) => reconcileDraft(current, rows, materials));
      setSavedDraft((current) => reconcileDraft(current, rows, materials));
      previousDimensions.current = dimensionsKey;
    }
  }, [
    catalogReady,
    dimensionsKey,
    initialDraft,
    materials,
    rows,
  ]);

  useEffect(() => {
    if (!hasLoadedProductOrder.current) return;
    setProductRowOrder((current) => {
      const knownKeys = new Set(rows.map((row) => row.id));
      const retainedKeys = current.filter((key) => knownKeys.has(key));
      const nextOrder = [
        ...retainedKeys,
        ...rows
          .map((row) => row.id)
          .filter((key) => !retainedKeys.includes(key)),
      ];
      return JSON.stringify(current) === JSON.stringify(nextOrder)
        ? current
        : nextOrder;
    });
  }, [rows]);

  useEffect(() => {
    if (!hasLoadedMaterialOrder.current) return;
    setMaterialGroupOrder((current) => {
      const nextOrder = [
        ...new Set(
          orderPriceMaterials(materials, current).map(
            (material) => material.group.key,
          ),
        ),
      ];
      return JSON.stringify(current) === JSON.stringify(nextOrder)
        ? current
        : nextOrder;
    });
  }, [materials]);

  useEffect(() => {
    if (!catalogReady || !materialOrderReady) return;
    try {
      window.localStorage.setItem(
        PRICE_MATERIAL_ORDER_STORAGE_KEY,
        JSON.stringify(orderedMaterialGroupKeys),
      );
    } catch (error) {
      console.error("Không thể lưu thứ tự chất liệu.", error);
      showToast(
        "error",
        "Không thể lưu thứ tự chất liệu trên thiết bị này.",
      );
    }
  }, [catalogReady, materialOrderReady, orderedMaterialGroupKeys]);

  useEffect(() => {
    if (!catalogReady || !productOrderReady) return;
    try {
      window.localStorage.setItem(
        PRICE_PRODUCT_ORDER_STORAGE_KEY,
        JSON.stringify(orderedProductRows.map((row) => row.id)),
      );
    } catch (error) {
      console.error("Không thể lưu thứ tự sản phẩm.", error);
      showToast("error", "Không thể lưu thứ tự sản phẩm trên thiết bị này.");
    }
  }, [catalogReady, orderedProductRows, productOrderReady]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(savedDraft);
  const isDefault = JSON.stringify(draft) === JSON.stringify(initialDraft);
  const query = search.trim().toLocaleLowerCase("vi");
  const categories = [...new Set(rows.map((row) => row.category))];
  const visibleProducts = orderedProductRows.filter(
    (row) =>
      (categoryFilter === "all" || row.category === categoryFilter) &&
      `${row.name} ${row.category}`
        .toLocaleLowerCase("vi")
        .includes(query),
  );
  const visiblePillows = PILLOWS.filter((pillow) =>
    pillow.name.toLocaleLowerCase("vi").includes(query),
  );
  const emptyPriceCount = rows.reduce(
    (count, row) =>
      count +
      materials.filter((material) => !draft.products[row.id]?.[material.id])
        .length,
    0,
  );

  const updateProductPrice = (
    productId: string,
    materialId: string,
    value: string,
  ) => {
    setDraft((current) => ({
      ...current,
      products: {
        ...current.products,
        [productId]: { ...current.products[productId], [materialId]: value },
      },
    }));
  };

  const updatePillowPrice = (pillowId: string, value: string) => {
    setDraft((current) => ({
      ...current,
      pillows: { ...current.pillows, [pillowId]: value },
    }));
  };

  const reorderMaterialGroups = (sourceKey: string, targetKey: string) => {
    setMaterialGroupOrder((current) =>
      moveKeyBefore(current, sourceKey, targetKey),
    );
  };

  const reorderProductRows = (sourceId: string, targetId: string) => {
    setProductRowOrder((current) =>
      moveKeyBefore(current, sourceId, targetId),
    );
  };

  const handleSave = () => {
    const prices = parseDraft(draft, rows, materials);
    if (!prices) {
      showToast(
        "error",
        "Vui lòng nhập giá là số nguyên lớn hơn 0 cho tất cả sản phẩm.",
      );
      return;
    }

    try {
      window.localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(prices));
      const committedDraft = parseStoredPrices(prices, rows, materials);
      setDraft(committedDraft);
      setSavedDraft(committedDraft);
      showToast("success", "Đã lưu bảng giá trên thiết bị này.");
    } catch (error) {
      console.error("Không thể lưu bảng giá.", error);
      showToast(
        "error",
        "Không thể lưu bảng giá. Vui lòng kiểm tra bộ nhớ trình duyệt.",
      );
    }
  };

  return {
    categories,
    categoryFilter,
    draft,
    emptyPriceCount,
    handleSave,
    isDefault,
    isDirty,
    isReady,
    materials: orderedMaterials,
    reorderMaterialGroups,
    reorderProductRows,
    resetToDefaults: () => setDraft(initialDraft),
    rows,
    search,
    setCategoryFilter,
    setSearch,
    updatePillowPrice,
    updateProductPrice,
    visiblePillows,
    visibleProducts,
  };
}
