import {
  PRODUCT_CATEGORIES,
  PRODUCT_SIZES,
  type Product,
  type ProductCategory,
  type ProductFormState,
  type ProductGroup,
  type ProductSize,
} from "@/components/modules/product/product.types";

export const COMBO_COMPONENTS: ReadonlyArray<{
  category: ProductCategory;
  quantity: number;
}> = [
  { category: "Drap", quantity: 1 },
  { category: "Vỏ gối nằm", quantity: 2 },
  { category: "Vỏ gối ôm", quantity: 1 },
];

export function createEmptyProductForm(): ProductFormState {
  return {
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
  };
}

export function getComboStocks(products: Product[]) {
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

    stocksByComboId.set(
      combo.id,
      Math.max(
        0,
        Math.min(
          drap.product.stock,
          Math.floor(pillowcase.product.stock / 2),
          bolsterCase.product.stock,
        ),
      ),
    );
  }

  return stocksByComboId;
}

export function getProductSearchIndex(
  products: Product[],
  yarnNameById: Map<number, string>,
  patternNameById: Map<string, string>,
): Map<string, string> {
  return new Map(
    products.map((product) => {
      const searchableText = [
        product.collection,
        product.sku,
        product.name,
        product.category,
        product.description,
        ...product.yarnIds.map((id) => yarnNameById.get(id) ?? String(id)),
        ...product.patternIds.map(
          (id) => patternNameById.get(id) ?? String(id),
        ),
      ]
        .join(" ")
        .toLocaleLowerCase("vi");
      return [product.id, searchableText] as const;
    }),
  );
}

export function getProductGroups(
  products: Product[],
  comboStocks: Map<string, number>,
  yarnNameById: Map<number, string>,
  patternNameById: Map<string, string>,
): ProductGroup[] {
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
}

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
