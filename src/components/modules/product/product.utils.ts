import {
  PRODUCT_SIZES,
  type ProductCategory,
  type ProductSize,
} from "./product.types";

export function getProductSize(
  ...values: (string | null | undefined)[]
): ProductSize | null {
  const sizes = new Set<ProductSize>();

  for (const value of values) {
    if (!value) continue;

    for (const match of value.matchAll(
      /(?:^|[^a-z0-9])1\s*m\s*([68])(?=$|[^a-z0-9])/gi,
    )) {
      sizes.add(match[1] === "6" ? "1m6" : "1m8");
    }
  }

  return sizes.size === 1 ? Array.from(sizes)[0] : null;
}

export function getProductBaseSku(sku: string): string {
  return sku.replace(/-(?:CHAN|DRAP|GOI-OM|GOI-NAM)(?:-1M[68])?$/i, "");
}

export function getAvailableComboSizes({
  categories,
  drapSizes,
  drapStocks,
  categoryStocks,
}: {
  categories: ProductCategory[];
  drapSizes: ProductSize[];
  drapStocks: Partial<Record<ProductSize, number>>;
  categoryStocks: Partial<Record<ProductCategory, number>>;
}): { size: ProductSize; stock: number }[] {
  if (
    !categories.includes("Drap") ||
    !categories.includes("Vỏ gối nằm") ||
    !categories.includes("Vỏ gối ôm")
  ) {
    return [];
  }

  const sharedSetAvailability = Math.min(
    Math.floor((categoryStocks["Vỏ gối nằm"] ?? 0) / 2),
    categoryStocks["Vỏ gối ôm"] ?? 0,
  );

  return PRODUCT_SIZES.flatMap((size) => {
    if (!drapSizes.includes(size)) return [];

    const stock = Math.max(
      0,
      Math.min(drapStocks[size] ?? 0, sharedSetAvailability),
    );
    return stock > 0 ? [{ size, stock }] : [];
  });
}
