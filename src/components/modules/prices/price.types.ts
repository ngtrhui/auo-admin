export type PriceMaterial = {
  id: string;
  name: string;
  pattern: string;
  group: { key: string; label: string };
  legacyId?: string;
};

export type ProductPriceRow = {
  id: string;
  name: string;
  category: string;
  size: string | null;
  productCount: number;
};

export type PriceValues = {
  products: Record<string, Record<string, number>>;
  pillows: Record<string, number>;
};

export type PriceDraft = {
  products: Record<string, Record<string, string>>;
  pillows: Record<string, string>;
};
