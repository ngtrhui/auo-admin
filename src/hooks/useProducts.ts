"use client";

import { useEffect, useRef, useState } from "react";

import { showToast } from "@/components/ui/Toaster";
import {
  INITIAL_PRODUCTS,
  LEGACY_PRODUCTS_STORAGE_KEY,
  PRODUCTS_STORAGE_KEY,
} from "@/data/product";
import {
  PRODUCT_CATEGORIES,
  type Product,
} from "@/components/modules/product/product.types";
import { getProductSize } from "@/components/modules/product/product.utils";

function isProductSize(value: unknown): value is "1m6" | "1m8" {
  return value === "1m6" || value === "1m8";
}

function isProduct(value: unknown): value is Product {
  if (value === null || typeof value !== "object") return false;

  const product = value as Record<string, unknown>;
  return (
    typeof product.id === "string" &&
    typeof product.collection === "string" &&
    typeof product.sku === "string" &&
    typeof product.name === "string" &&
    Array.isArray(product.yarnIds) &&
    product.yarnIds.every(
      (yarnId) => typeof yarnId === "number" && Number.isInteger(yarnId),
    ) &&
    Array.isArray(product.patternIds) &&
    product.patternIds.every((patternId) => typeof patternId === "string") &&
    (product.image === null || typeof product.image === "string") &&
    (product.kind === "single" || product.kind === "combo") &&
    (product.kind === "combo"
      ? product.category === "Combo"
      : product.category === null ||
        PRODUCT_CATEGORIES.some((category) => category === product.category)) &&
    (product.size === null || isProductSize(product.size)) &&
    typeof product.price === "number" &&
    Number.isFinite(product.price) &&
    typeof product.stock === "number" &&
    Number.isFinite(product.stock) &&
    typeof product.description === "string" &&
    Array.isArray(product.components) &&
    product.components.every(
      (component) =>
        component !== null &&
        typeof component === "object" &&
        "productId" in component &&
        typeof component.productId === "string" &&
        "quantity" in component &&
        typeof component.quantity === "number" &&
        Number.isInteger(component.quantity) &&
        component.quantity > 0,
    )
  );
}


function migrateProductList(
  value: unknown,
): { products: Product[]; invalidCount: number } | null {
  if (!Array.isArray(value)) return null;

  const migrated = value.map((item) => {
    if (item === null || typeof item !== "object") return item;

    const product = item as Record<string, unknown>;

    if (typeof product.collection === "string") {
      return {
        ...product,
        image: typeof product.image === "string" ? product.image : null,
        size: isProductSize(product.size)
          ? product.size
          : getProductSize(
              typeof product.sku === "string" ? product.sku : null,
              typeof product.name === "string" ? product.name : null,
            ),
      };
    }

    const colorMatch =
      typeof product.name === "string"
        ? product.name.match(/màu\s+([^,.-]+)/i)
        : null;

    return {
      ...product,
      collection: colorMatch
        ? colorMatch[1].trim()
        : "Chưa phân nhóm",
      yarnIds: Array.isArray(product.yarnIds)
        ? product.yarnIds
        : [],
      patternIds: Array.isArray(product.patternIds)
        ? product.patternIds
        : [],
      image: typeof product.image === "string" ? product.image : null,
      size: isProductSize(product.size)
        ? product.size
        : getProductSize(
            typeof product.sku === "string" ? product.sku : null,
            typeof product.name === "string" ? product.name : null,
          ),
    };
  });

  const products = migrated.filter(isProduct);

  return {
    products,
    invalidCount: migrated.length - products.length,
  };
}

export function useProducts() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [storageReady, setStorageReady] = useState(false);
  const canWriteStorage = useRef(true);

  useEffect(() => {
    try {
      const storedProducts =
        window.localStorage.getItem(PRODUCTS_STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_PRODUCTS_STORAGE_KEY);
      if (storedProducts === null) {
        queueMicrotask(() => setStorageReady(true));
        return;
      }

      const parsedProducts: unknown = JSON.parse(storedProducts);
      const migratedProducts = migrateProductList(parsedProducts);
      if (!migratedProducts) {
        throw new Error("Dữ liệu sản phẩm đã lưu không hợp lệ.");
      }
      if (migratedProducts.invalidCount > 0) {
        showToast(
          "warning",
          `${migratedProducts.invalidCount} sản phẩm đã lưu không hợp lệ và sẽ bị bỏ qua.`,
        );
      }

      const productsToLoad =
        migratedProducts.products.length === 0 &&
        window.localStorage.getItem(PRODUCTS_STORAGE_KEY) === null
          ? INITIAL_PRODUCTS
          : migratedProducts.products;
      queueMicrotask(() => {
        setProducts(productsToLoad);
        setStorageReady(true);
      });
    } catch (error) {
      console.error("Không thể tải danh sách sản phẩm.", error);
      showToast("error", "Không thể tải danh sách sản phẩm đã lưu.");
    }
  }, []);

  useEffect(() => {
    if (!storageReady || !canWriteStorage.current) return;

    try {
      window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
      console.error("Không thể lưu danh sách sản phẩm.", error);
      showToast("error", "Không thể lưu danh sách sản phẩm.");
      canWriteStorage.current = false;
    }
  }, [products, storageReady]);

  return { products, setProducts };
}
