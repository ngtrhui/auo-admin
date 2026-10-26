"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";

import ListPageLayout from "@/components/list/ListPageLayout";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { showToast } from "@/components/ui/Toaster";
import { useClientPagination } from "@/hooks/list/useClientPagination";
import { useProducts } from "@/hooks/useProducts";
import { usePatterns } from "@/hooks/usePatterns";
import { useYarns } from "@/hooks/useYarns";
import type { ProductAdvancedFilters } from "./ProductFilterPanel";
import ProductFormDialog from "./ProductFormDialog";
import ProductListFilters from "./ProductListFilters";
import ProductTable from "./ProductTable";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_SIZES,
  type Product,
  type ProductCategory,
  type ProductGroup,
  type ProductFormState,
  type ProductSize,
} from "./product.types";
import {
  getAvailableComboSizes,
  getProductBaseSku,
} from "./product.utils";

const CATEGORY_SKU_SUFFIX: Record<ProductCategory, string> = {
  Chăn: "CHAN",
  Drap: "DRAP",
  "Vỏ gối ôm": "GOI-OM",
  "Vỏ gối nằm": "GOI-NAM",
};

const COMBO_COMPONENTS: ReadonlyArray<{
  category: ProductCategory;
  quantity: number;
}> = [
  { category: "Drap", quantity: 1 },
  { category: "Vỏ gối nằm", quantity: 2 },
  { category: "Vỏ gối ôm", quantity: 1 },
];

const createCategorySku = (sku: string, category: ProductCategory) =>
  `${sku}-${CATEGORY_SKU_SUFFIX[category]}`;

const createDrapSku = (sku: string, size: ProductSize) =>
  `${createCategorySku(sku, "Drap")}-${size.toUpperCase()}`;

const emptyForm = (): ProductFormState => ({
  collection: "",
  sku: "",
  name: "",
  yarnIds: [],
  patternIds: [],
  image: null,
  kind: "single",
  category: null,
  size: null,
  price: 0,
  stock: 0,
  comboPrices: {},
  drapSizes: [],
  drapPrices: {},
  drapStocks: {},
  description: "",
  components: [],
  categories: [],
  categoryPrices: Object.fromEntries(
    PRODUCT_CATEGORIES.map((category) => [category, 0]),
  ),
  categoryStocks: {},
});

function getComboStocks(products: Product[]) {
  const productById = new Map(products.map((product) => [product.id, product]));
  const stocksByComboId = new Map<string, number>();

  for (const combo of products) {
    if (combo.kind !== "combo") continue;
    const components = combo.components.map(({ productId, quantity }) => ({
      product: productById.get(productId),
      quantity,
    }));
    const drap = components.find(
      ({ product, quantity }) =>
        product?.kind === "single" &&
        product.category === "Drap" &&
        product.size === combo.size &&
        quantity === 1,
    );
    const pillowcase = components.find(
      ({ product, quantity }) =>
        product?.kind === "single" &&
        product.category === "Vỏ gối nằm" &&
        product.size === null &&
        quantity === 2,
    );
    const bolsterCase = components.find(
      ({ product, quantity }) =>
        product?.kind === "single" &&
        product.category === "Vỏ gối ôm" &&
        product.size === null &&
        quantity === 1,
    );

    if (
      combo.category !== "Combo" ||
      !combo.size ||
      components.length !== COMBO_COMPONENTS.length ||
      components.some(
        ({ product }) =>
          !product ||
          product.kind !== "single" ||
          product.collection !== combo.collection,
      ) ||
      !drap?.product ||
      !pillowcase?.product ||
      !bolsterCase?.product
    ) {
      stocksByComboId.set(combo.id, 0);
      continue;
    }

    const available = Math.max(
      0,
      Math.min(
        drap.product.stock,
        Math.floor(pillowcase.product.stock / 2),
        bolsterCase.product.stock,
      ),
    );
    stocksByComboId.set(combo.id, available);
  }

  return stocksByComboId;
}

export default function ProductManagement() {
  const { products, setProducts } = useProducts();
  const { patterns } = usePatterns();
  const { yarns } = useYarns();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [yarnFilter, setYarnFilter] = useState("all");
  const [patternFilter, setPatternFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<ProductGroup | null>(null);
  const yarnNameById = useMemo(
    () => new Map(yarns.map((yarn) => [yarn.id, yarn.name])),
    [yarns],
  );
  const patternNameById = useMemo(
    () => new Map(patterns.map((pattern) => [pattern.id, pattern.name])),
    [patterns],
  );
  const comboStocks = useMemo(
    () => getComboStocks(products),
    [products],
  );
  const searchableTextByProductId = useMemo(
    () =>
      new Map(
        products.map((product) => {
          const yarnNames = product.yarnIds
            .map((id) => yarnNameById.get(id) ?? String(id))
            .join(" ");
          const patternNames = product.patternIds
            .map((id) => patternNameById.get(id) ?? String(id))
            .join(" ");
          const searchableText = [
            product.collection,
            product.sku,
            product.name,
            product.category,
            product.description,
            yarnNames,
            patternNames,
          ]
            .join(" ")
            .toLocaleLowerCase("vi");
          return [product.id, searchableText] as const;
        }),
      ),
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
      const matchesSearch =
        !query ||
        (searchableTextByProductId.get(product.id)?.includes(query) ?? false);
      return (
        matchesSearch &&
        (categoryFilter === "all" || product.category === categoryFilter) &&
        (yarnFilter === "all" ||
          product.yarnIds.includes(Number(yarnFilter))) &&
        (patternFilter === "all" || product.patternIds.includes(patternFilter))
      );
    });
  }, [
    categoryFilter,
    patternFilter,
    products,
    comboStocks,
    search,
    searchableTextByProductId,
    yarnFilter,
  ]);

  const productGroups = useMemo(() => {
    const groupedProducts = new Map<string, Product[]>();
    for (const product of products) {
      if (product.kind !== "single") continue;
      const groupProducts = groupedProducts.get(product.collection) ?? [];
      groupProducts.push(product);
      groupedProducts.set(product.collection, groupProducts);
    }
    for (const product of products) {
      if (
        product.kind !== "combo" ||
        (comboStocks.get(product.id) ?? 0) < 1
      ) {
        continue;
      }
      groupedProducts.get(product.collection)?.push({
        ...product,
        stock: comboStocks.get(product.id) ?? 0,
      });
    }
    return Array.from(groupedProducts, ([name, groupProducts]) => {
      const firstProduct =
        groupProducts.find((product) => product.kind === "single") ??
        groupProducts[0];
      return {
        id: name,
        name,
        products: groupProducts,
        image: firstProduct.image,
        yarnNames: firstProduct.yarnIds.map(
          (id) => yarnNameById.get(id) ?? `#${id}`,
        ),
        patternNames: firstProduct.patternIds.map(
          (id) => patternNameById.get(id) ?? id,
        ),
      };
    });
  }, [comboStocks, patternNameById, products, yarnNameById]);

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

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingGroup(null);
    setForm(emptyForm());
  };

  const openCreateDialog = () => {
    setEditingGroup(null);
    setForm(emptyForm());
    setIsDialogOpen(true);
  };

  const openEditDialog = useCallback((group: ProductGroup) => {
    const categoryProducts = group.products.filter(
      (product): product is Product & { category: ProductCategory } =>
        PRODUCT_CATEGORIES.some((category) => category === product.category),
    );
    const firstProduct = group.products.find(
      (product) => product.kind === "single",
    );
    if (!firstProduct) return;
    const comboProducts = products.filter(
      (product) =>
        product.kind === "combo" && product.collection === group.id,
    );
    setEditingGroup(group.id);
    setForm({
      collection: group.name,
      sku: getProductBaseSku(firstProduct.sku),
      name: group.name,
      yarnIds: [...firstProduct.yarnIds],
      patternIds: [...firstProduct.patternIds],
      image: firstProduct.image,
      kind: "single",
      category: null,
      size: null,
      price: firstProduct.price,
      stock: firstProduct.stock,
      comboPrices: Object.fromEntries(
        comboProducts.flatMap((product) =>
          product.size ? [[product.size, product.price]] : [],
        ),
      ),
      drapSizes: PRODUCT_SIZES.filter((size) =>
        categoryProducts.some(
          (product) => product.category === "Drap" && product.size === size,
        ),
      ),
      drapPrices: Object.fromEntries(
        categoryProducts.flatMap((product) =>
          product.category === "Drap" && product.size
            ? [[product.size, product.price]]
            : [],
        ),
      ),
      drapStocks: Object.fromEntries(
        categoryProducts.flatMap((product) =>
          product.category === "Drap" && product.size
            ? [[product.size, product.stock]]
            : [],
        ),
      ),
      description: firstProduct.description,
      components: [],
      categories: PRODUCT_CATEGORIES.filter((category) =>
        categoryProducts.some((product) => product.category === category),
      ),
      categoryPrices: Object.fromEntries(
        categoryProducts.flatMap((product) =>
          product.category
            ? [[product.category, product.price]]
            : [],
        ),
      ),
      categoryStocks: Object.fromEntries(
        categoryProducts.flatMap((product) =>
          product.category
            ? [[product.category, product.stock]]
            : [],
        ),
      ),
    });
    setIsDialogOpen(true);
  }, [products]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sku = form.sku.trim();
    const name = form.name.trim();

    if (!sku || !name) {
      showToast("error", "Vui lòng nhập mã và tên sản phẩm.");
      return;
    }

    if (
      products.some(
        (product) =>
          product.kind === "single" &&
          product.collection !== editingGroup &&
          product.collection.toLocaleLowerCase("vi") ===
            name.toLocaleLowerCase("vi"),
      )
    ) {
      showToast("error", "Tên nhóm sản phẩm đã tồn tại.");
      return;
    }

    const selectedCategories = PRODUCT_CATEGORIES.filter((category) =>
      form.categories.includes(category),
    );
    const selectedDrapSizes = selectedCategories.includes("Drap")
      ? PRODUCT_SIZES.filter((size) => form.drapSizes.includes(size))
      : [];
    const availableComboSizes = getAvailableComboSizes({
      categories: selectedCategories,
      drapSizes: selectedDrapSizes,
      drapStocks: form.drapStocks,
      categoryStocks: form.categoryStocks,
    });

    if (
      selectedCategories.includes("Drap") &&
      selectedDrapSizes.length === 0
    ) {
      showToast("error", "Vui lòng chọn size 1m6 hoặc 1m8 cho Drap.");
      return;
    }

    if (selectedCategories.some((category) => {
      if (category === "Drap") return false;
      const price = form.categoryPrices[category];
      return !Number.isFinite(price) || price === undefined || price < 0;
    })) {
      showToast(
        "error",
        "Giá bán của từng danh mục phải là số lớn hơn hoặc bằng 0.",
      );
      return;
    }

    if (selectedCategories.some((category) => {
      if (category === "Drap") return false;
      const stock = form.categoryStocks[category];
      return !Number.isInteger(stock) || stock === undefined || stock < 0;
    })) {
      showToast(
        "error",
        "Tồn kho của từng danh mục phải là số nguyên lớn hơn hoặc bằng 0.",
      );
      return;
    }

    if (
      availableComboSizes.some(({ size }) => {
        const price = form.drapPrices[size];
        const stock = form.drapStocks[size];
        const comboPrice = form.comboPrices[size];
        return (
          !Number.isFinite(price) ||
          price === undefined ||
          price < 0 ||
          !Number.isInteger(stock) ||
          stock === undefined ||
          stock < 0 ||
          !Number.isFinite(comboPrice) ||
          comboPrice === undefined ||
          comboPrice < 0
        );
      })
    ) {
      showToast(
        "error",
        "Giá, tồn kho Drap và giá combo theo size phải hợp lệ.",
      );
      return;
    }

    if (
      selectedCategories.length === 0 &&
      (!Number.isFinite(form.price) ||
        form.price < 0 ||
        !Number.isInteger(form.stock) ||
        form.stock < 0)
    ) {
      showToast(
        "error",
        "Giá phải lớn hơn hoặc bằng 0 và tồn kho phải là số nguyên không âm.",
      );
      return;
    }

    const categorySkus: {
      category: ProductCategory | null;
      size: ProductSize | null;
      sku: string;
    }[] = [];
    if (selectedCategories.length === 0) {
      categorySkus.push({ category: null, size: null, sku });
    } else {
      for (const category of selectedCategories) {
        if (category === "Drap") {
          for (const size of selectedDrapSizes) {
            categorySkus.push({
              category,
              size,
              sku: createDrapSku(sku, size),
            });
          }
        } else {
          categorySkus.push({
            category,
            size: null,
            sku: createCategorySku(sku, category),
          });
        }
      }
    }
    const editingProducts: Product[] = [];
    const editingCombos: Product[] = [];
    for (const product of products) {
      if (product.collection !== editingGroup) continue;
      if (product.kind === "single") {
        editingProducts.push(product);
      } else {
        editingCombos.push(product);
      }
    }
    const editingProductByCategoryAndSize = new Map(
      editingProducts.map((product) => [
        `${product.category ?? ""}:${product.size ?? ""}`,
        product,
      ]),
    );
    const editingComboBySize = new Map(
      editingCombos.map((product) => [product.size, product]),
    );
    const replacedIds = new Set([
      ...editingProducts.map((product) => product.id),
      ...editingCombos.map((product) => product.id),
    ]);
    const skus = new Set([
      ...categorySkus.map(({ sku: categorySku }) => categorySku),
      ...selectedDrapSizes.map(
        (size) => `${sku}-COMBO-${size.toUpperCase()}`,
      ),
    ].map((productSku) => productSku.toLocaleLowerCase("vi")));
    if (
      products.some(
        (product) =>
          !replacedIds.has(product.id) &&
          skus.has(product.sku.toLocaleLowerCase("vi")),
      ) ||
      skus.size !==
        categorySkus.length + selectedDrapSizes.length
    ) {
      showToast(
        "error",
        "Mã sản phẩm hoặc combo được tạo đã tồn tại. Vui lòng đổi mã gốc.",
      );
      return;
    }

    const removedProductIds = new Set(
      editingProducts
        .filter(
          (product) =>
            selectedCategories.length === 0
              ? product.category !== null
              : !selectedCategories.some(
                  (category) => category === product.category,
                ) ||
                (product.category === "Drap" &&
                  (!product.size ||
                    !selectedDrapSizes.includes(product.size))),
        )
        .map((product) => product.id),
    );
    const legacyProductsUsingRemovedCategories = products.filter(
      (product) =>
        product.kind === "combo" &&
        product.collection !== editingGroup &&
        product.components.some(({ productId }) =>
          removedProductIds.has(productId),
        ),
    );
    if (legacyProductsUsingRemovedCategories.length > 0) {
      showToast(
        "error",
        "Không thể bỏ danh mục đang được sản phẩm cũ tham chiếu.",
      );
      return;
    }

    const groupProducts: Product[] = categorySkus.map(
      ({ category, size, sku: categorySku }) => {
        const existing = editingProductByCategoryAndSize.get(
          `${category ?? ""}:${size ?? ""}`,
        );
        return {
          id: existing?.id ?? crypto.randomUUID(),
          collection: name,
          sku: existing?.sku ?? categorySku,
          name:
            category === "Drap" && size
              ? `${name} ${size}`
              : name,
          yarnIds: [...form.yarnIds],
          patternIds: [...form.patternIds],
          image:
            category === categorySkus[0].category ? form.image : null,
          kind: "single",
          category,
          size,
          price:
            category === "Drap" && size
              ? form.drapPrices[size] ?? 0
              : category
                ? form.categoryPrices[category] ?? 0
                : form.price,
          stock:
            category === "Drap" && size
              ? form.drapStocks[size] ?? 0
              : category
                ? form.categoryStocks[category] ?? 0
                : form.stock,
          description: form.description.trim(),
          components: [],
        };
      },
    );

    const comboProducts: Product[] = selectedDrapSizes.map((size) => {
      const comboComponents = COMBO_COMPONENTS.map(
        ({ category, quantity }) => {
          const component = groupProducts.find(
            (product) =>
              product.category === category &&
              (category === "Drap"
                ? product.size === size
                : product.size === null),
          );
          return component ? { productId: component.id, quantity } : null;
        },
      );
      const existingCombo = editingComboBySize.get(size);

      return {
        id: existingCombo?.id ?? crypto.randomUUID(),
        collection: name,
        sku: `${sku}-COMBO-${size.toUpperCase()}`,
        name: `Combo 4 món ${size}`,
        yarnIds: [...form.yarnIds],
        patternIds: [...form.patternIds],
        image: form.image,
        kind: "combo",
        category: "Combo",
        size,
        price: form.comboPrices[size] ?? 0,
        stock: 0,
        description: form.description.trim(),
        components: comboComponents.every(
          (
            component,
          ): component is { productId: string; quantity: number } =>
            component !== null,
        )
          ? comboComponents
          : [],
      };
    });
    setProducts((current) => {
      const updatedProducts = [
        ...current.filter((product) => !replacedIds.has(product.id)),
        ...groupProducts,
        ...comboProducts,
      ];
      const updatedComboStocks = getComboStocks(updatedProducts);
      return updatedProducts.map((product) =>
        product.kind === "combo"
          ? { ...product, stock: updatedComboStocks.get(product.id) ?? 0 }
          : product,
      );
    });
    if (editingGroup) {
      showToast("success", "Đã cập nhật nhóm sản phẩm.");
    } else {
      setSearch("");
      setCategoryFilter("all");
      setCurrentPage(1);
      showToast("success", `Đã thêm nhóm sản phẩm "${name}".`);
    }
    closeDialog();
  };

  const handleDeleteGroup = () => {
    if (!groupToDelete) return;

    const groupProductIds = new Set(
      groupToDelete.products.map((product) => product.id),
    );
    const legacyProductsUsingGroup = products.filter(
      (product) =>
        product.kind === "combo" &&
        product.collection !== groupToDelete.id &&
        product.components.some(({ productId }) =>
          groupProductIds.has(productId),
        ),
    );
    if (legacyProductsUsingGroup.length > 0) {
      showToast(
        "error",
        `Không thể xóa nhóm vì dữ liệu cũ đang được tham chiếu: ${legacyProductsUsingGroup.map(({ name }) => name).join(", ")}.`,
      );
      setGroupToDelete(null);
      return;
    }

    setProducts((current) =>
      current.filter((product) => product.collection !== groupToDelete.id),
    );
    showToast("success", `Đã xóa nhóm sản phẩm "${groupToDelete.name}".`);
    setGroupToDelete(null);
  };

  return (
    <>
      <ListPageLayout
        filters={
          <ProductListFilters
            search={search}
            category={categoryFilter}
            yarnId={yarnFilter}
            patternId={patternFilter}
            yarns={yarns}
            patterns={patterns}
            onSearchChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
            onAdd={openCreateDialog}
            hasActiveFilters={hasActiveFilters}
          />
        }
        table={
          pageItems.length > 0 ? (
            <ProductTable
              groups={pageItems}
              onSelect={openEditDialog}
              onDelete={setGroupToDelete}
            />
          ) : (
            <div className="flex min-h-28 flex-1 items-center justify-center px-4 text-center text-sm text-gray">
              Không có sản phẩm phù hợp với bộ lọc hiện tại.
            </div>
          )
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
      <ProductFormDialog
        open={isDialogOpen}
        form={form}
        onChange={setForm}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        isEditing={editingGroup !== null}
        yarns={yarns}
        patterns={patterns}
      />
      <ConfirmDialog
        open={groupToDelete !== null}
        title="Xóa nhóm sản phẩm"
        message={`Bạn có chắc chắn muốn xóa nhóm "${groupToDelete?.name ?? ""}" và toàn bộ danh mục bên trong không?`}
        confirmText="Xóa"
        onConfirm={handleDeleteGroup}
        onCancel={() => setGroupToDelete(null)}
      />
    </>
  );
}
