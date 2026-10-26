export const PRODUCT_CATEGORIES = [
  "Chăn",
  "Drap",
  "Vỏ gối ôm",
  "Vỏ gối nằm",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type ProductSize = "1m6" | "1m8";
export const PRODUCT_SIZES: readonly ProductSize[] = ["1m6", "1m8"];
export type ProductKind = "single" | "combo";

export type ProductComponent = {
  productId: string;
  quantity: number;
};

export type Product = {
  id: string;
  collection: string;
  sku: string;
  name: string;
  yarnIds: number[];
  patternIds: string[];
  image: string | null;
  kind: ProductKind;
  category: ProductCategory | "Combo" | null;
  size: ProductSize | null;
  price: number;
  stock: number;
  description: string;
  components: ProductComponent[];
};

export type ProductGroup = {
  id: string;
  name: string;
  products: Product[];
  image: string | null;
  yarnNames: string[];
  patternNames: string[];
};

export type ProductForm = Omit<Product, "id">;

export type ProductFormState = ProductForm & {
  comboPrices: Partial<Record<ProductSize, number>>;
  drapSizes: ProductSize[];
  drapPrices: Partial<Record<ProductSize, number>>;
  drapStocks: Partial<Record<ProductSize, number>>;
  categories: ProductCategory[];
  categoryPrices: Partial<Record<ProductCategory, number>>;
  categoryStocks: Partial<Record<ProductCategory, number>>;
};
