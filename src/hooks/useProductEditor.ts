"use client";

import { useCallback, useState, type FormEvent } from "react";

import { showToast } from "@/components/ui/Toaster";
import type { ProductSetter } from "./useProductCatalog";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_SIZES,
  type Product,
  type ProductCategory,
  type ProductGroup,
  type ProductFormState,
  type ProductSize,
} from "@/components/modules/product/product.types";
import {
  COMBO_COMPONENTS,
  createEmptyProductForm,
  getAvailableComboSizes,
  getComboStocks,
  getProductBaseSku,
} from "@/utils/product.utils";

const CATEGORY_SKU_SUFFIX: Record<ProductCategory, string> = {
  Chăn: "CHAN",
  Drap: "DRAP",
  "Vỏ gối ôm": "GOI-OM",
  "Vỏ gối nằm": "GOI-NAM",
};

const createCategorySku = (sku: string, category: ProductCategory) =>
  `${sku}-${CATEGORY_SKU_SUFFIX[category]}`;

const createDrapSku = (sku: string, size: ProductSize) =>
  `${createCategorySku(sku, "Drap")}-${size.toUpperCase()}`;

interface UseProductEditorOptions {
  products: Product[];
  setProducts: ProductSetter;
  onCreated: () => void;
}

export function useProductEditor({
  products,
  setProducts,
  onCreated,
}: UseProductEditorOptions) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(createEmptyProductForm);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<ProductGroup | null>(null);

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingGroup(null);
    setForm(createEmptyProductForm());
  };

  const openCreateDialog = () => {
    setEditingGroup(null);
    setForm(createEmptyProductForm());
    setIsDialogOpen(true);
  };

  const openEditDialog = useCallback(
    (group: ProductGroup) => {
      const categoryProducts = group.products.filter(
        (product): product is Product & { category: ProductCategory } =>
          PRODUCT_CATEGORIES.some(
            (category) => category === product.category,
          ),
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
    },
    [products],
  );

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

    if (selectedCategories.includes("Drap") && selectedDrapSizes.length === 0) {
      showToast("error", "Vui lòng chọn size 1m6 hoặc 1m8 cho Drap.");
      return;
    }
    if (
      selectedCategories.some((category) => {
        if (category === "Drap") return false;
        const price = form.categoryPrices[category];
        return !Number.isFinite(price) || price === undefined || price < 0;
      })
    ) {
      showToast(
        "error",
        "Giá bán của từng danh mục phải là số lớn hơn hoặc bằng 0.",
      );
      return;
    }
    if (
      selectedCategories.some((category) => {
        if (category === "Drap") return false;
        const stock = form.categoryStocks[category];
        return !Number.isInteger(stock) || stock === undefined || stock < 0;
      })
    ) {
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
    }[] =
      selectedCategories.length === 0
        ? [{ category: null, size: null, sku }]
        : selectedCategories.flatMap<{
            category: ProductCategory | null;
            size: ProductSize | null;
            sku: string;
          }>((category) =>
            category === "Drap"
              ? selectedDrapSizes.map((size) => ({
                  category,
                  size,
                  sku: createDrapSku(sku, size),
                }))
              : [{ category, size: null, sku: createCategorySku(sku, category) }],
          );

    const editingProducts = products.filter(
      (product) =>
        product.collection === editingGroup && product.kind === "single",
    );
    const editingCombos = products.filter(
      (product) =>
        product.collection === editingGroup && product.kind === "combo",
    );
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
    const skus = new Set(
      [
        ...categorySkus.map(({ sku: categorySku }) => categorySku),
        ...selectedDrapSizes.map(
          (size) => `${sku}-COMBO-${size.toUpperCase()}`,
        ),
      ].map((productSku) => productSku.toLocaleLowerCase("vi")),
    );
    if (
      products.some(
        (product) =>
          !replacedIds.has(product.id) &&
          skus.has(product.sku.toLocaleLowerCase("vi")),
      ) ||
      skus.size !== categorySkus.length + selectedDrapSizes.length
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
          name: category === "Drap" && size ? `${name} ${size}` : name,
          yarnIds: [...form.yarnIds],
          patternIds: [...form.patternIds],
          image: category === categorySkus[0].category ? form.image : null,
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
      onCreated();
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

  return {
    isDialogOpen,
    form,
    setForm,
    editingGroup,
    groupToDelete,
    setGroupToDelete,
    closeDialog,
    openCreateDialog,
    openEditDialog,
    handleSubmit,
    handleDeleteGroup,
  };
}
