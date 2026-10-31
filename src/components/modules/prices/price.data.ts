import type { PriceMaterial, PriceValues } from "./price.types";

export const PRICE_STORAGE_KEY = "auo-admin-price-list-v1";
export const PRICE_MATERIAL_ORDER_STORAGE_KEY =
  "auo-admin-price-material-order-v1";
export const PRICE_PRODUCT_ORDER_STORAGE_KEY =
  "auo-admin-price-product-order-v1";

type LegacyPriceMaterial = Omit<PriceMaterial, "group"> & {
  group?: PriceMaterial["group"];
};

export const MATERIALS: LegacyPriceMaterial[] = [
  {
    id: "40s-plain",
    name: "Tencel 40s Microfiber",
    pattern: "Trơn",
    group: { key: "tencel-40s", label: "Tencel 40s Microfiber" },
  },
  {
    id: "40s-pattern",
    name: "Tencel 40s Microfiber",
    pattern: "Họa tiết",
    group: { key: "tencel-40s", label: "Tencel 40s Microfiber" },
  },
  { id: "50s", name: "Tencel 50s", pattern: "Đơn giá" },
  {
    id: "60s-plain",
    name: "Tencel 60s",
    pattern: "Trơn",
    group: { key: "tencel-60s", label: "Tencel 60s" },
  },
  {
    id: "60s-pattern",
    name: "Tencel 60s",
    pattern: "Họa tiết",
    group: { key: "tencel-60s", label: "Tencel 60s" },
  },
  { id: "knit", name: "Dệt kim", pattern: "Đơn giá" },
  { id: "100s", name: "Tencel 100s", pattern: "Đơn giá" },
];

export const LEGACY_MATERIAL_IDS = [
  "40s-plain",
  "40s-pattern",
  "50s",
  "60s-plain",
  "60s-pattern",
  "knit",
  "100s",
] as const;

export const PILLOWS = [
  { id: "sleeping-pillow", name: "Gối nằm" },
  { id: "bolster-pillow", name: "Gối ôm" },
] as const;

export const DEFAULT_PRICES: PriceValues = {
  products: {
    "set-4-1m6": {
      "40s-plain": 500,
      "40s-pattern": 600,
      "50s": 850,
      "60s-plain": 945,
      "60s-pattern": 1050,
      knit: 1200,
      "100s": 1600,
    },
    "set-4-1m8": {
      "40s-plain": 550,
      "40s-pattern": 650,
      "50s": 900,
      "60s-plain": 995,
      "60s-pattern": 1100,
      knit: 1300,
      "100s": 1800,
    },
    blanket: {
      "40s-plain": 600,
      "40s-pattern": 650,
      "50s": 900,
      "60s-plain": 945,
      "60s-pattern": 1100,
      knit: 1400,
      "100s": 1600,
    },
    "sheet-1m6": {
      "40s-plain": 300,
      "40s-pattern": 350,
      "50s": 450,
      "60s-plain": 500,
      "60s-pattern": 550,
      knit: 700,
      "100s": 820,
    },
    "sheet-1m8": {
      "40s-plain": 320,
      "40s-pattern": 380,
      "50s": 500,
      "60s-plain": 550,
      "60s-pattern": 600,
      knit: 750,
      "100s": 920,
    },
    "pillowcase-flat": {
      "40s-plain": 90,
      "40s-pattern": 100,
      "50s": 140,
      "60s-plain": 160,
      "60s-pattern": 180,
      knit: 200,
      "100s": 240,
    },
    "pillowcase-bolster": {
      "40s-plain": 100,
      "40s-pattern": 120,
      "50s": 160,
      "60s-plain": 180,
      "60s-pattern": 200,
      knit: 220,
      "100s": 300,
    },
  },
  pillows: {
    "sleeping-pillow": 280,
    "bolster-pillow": 320,
  },
};
