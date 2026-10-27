"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";

import { useClientPagination } from "@/hooks/list/useClientPagination";
import { usePatterns } from "@/hooks/usePatterns";
import { useProducts } from "@/hooks/useProducts";
import { useYarns } from "@/hooks/useYarns";
import type { ProductAdvancedFilters } from "@/components/modules/product/ProductFilterPanel";
import type { Product } from "@/components/modules/product/product.types";
import {
  getComboStocks,
  getProductGroups,
  getProductSearchIndex,
} from "@/utils/product.utils";

export function useProductCatalog() {
  const { products, setProducts } = useProducts();
  const { patterns } = usePatterns();
  const { yarns } = useYarns();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [yarnFilter, setYarnFilter] = useState("all");
  const [patternFilter, setPatternFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const yarnNameById = useMemo(
    () => new Map(yarns.map((yarn) => [yarn.id, yarn.name])),
    [yarns],
  );
  const patternNameById = useMemo(
    () => new Map(patterns.map((pattern) => [pattern.id, pattern.name])),
    [patterns],
  );
  const comboStocks = useMemo(() => getComboStocks(products), [products]);
  const searchableTextByProductId = useMemo(
    () => getProductSearchIndex(products, yarnNameById, patternNameById),
    [patternNameById, products, yarnNameById],
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    return products.filter((product) => {
      if (
        product.kind === "combo" &&
        (comboStocks.get(product.id) ?? 0) < 1
      ) {
        return false;
      }

      return (
        (!query ||
          (searchableTextByProductId.get(product.id)?.includes(query) ??
            false)) &&
        (categoryFilter === "all" || product.category === categoryFilter) &&
        (yarnFilter === "all" ||
          product.yarnIds.includes(Number(yarnFilter))) &&
        (patternFilter === "all" || product.patternIds.includes(patternFilter))
      );
    });
  }, [
    categoryFilter,
    comboStocks,
    patternFilter,
    products,
    search,
    searchableTextByProductId,
    yarnFilter,
  ]);

  const productGroups = useMemo(
    () =>
      getProductGroups(
        products,
        comboStocks,
        yarnNameById,
        patternNameById,
      ),
    [comboStocks, patternNameById, products, yarnNameById],
  );
  const visibleGroups = useMemo(() => {
    const filteredProductIds = new Set(
      filteredProducts.map((product) => product.id),
    );
    return productGroups.filter((group) =>
      group.products.some((product) => filteredProductIds.has(product.id)),
    );
  }, [filteredProducts, productGroups]);

  const { pageItems, totalItems, totalPages } = useClientPagination(
    visibleGroups,
    currentPage,
    pageSize,
  );
  const hasActiveFilters =
    search.trim() !== "" ||
    categoryFilter !== "all" ||
    yarnFilter !== "all" ||
    patternFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setYarnFilter("all");
    setPatternFilter("all");
    setCurrentPage(1);
  };

  const applyFilters = (filters: ProductAdvancedFilters) => {
    setCategoryFilter(filters.category);
    setYarnFilter(filters.yarnId);
    setPatternFilter(filters.patternId);
    setCurrentPage(1);
  };

  return {
    products,
    setProducts,
    patterns,
    yarns,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    yarnFilter,
    patternFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    pageItems,
    totalItems,
    totalPages,
    hasActiveFilters,
    clearFilters,
    applyFilters,
  };
}

export type ProductSetter = Dispatch<SetStateAction<Product[]>>;
