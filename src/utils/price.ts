import {
  DEFAULT_PRICES,
  LEGACY_MATERIAL_IDS,
  MATERIALS,
  PILLOWS,
} from "@/components/modules/prices/price.data";
import type { Pattern } from "@/components/modules/pattern/pattern.types";
import type { Product } from "@/components/modules/product/product.types";
import type { Yarn } from "@/components/modules/yarn/yarn.types";
import type {
  PriceDraft,
  PriceMaterial,
  PriceValues,
  ProductPriceRow,
} from "@/components/modules/prices/price.types";

function getLegacyProductId(row: ProductPriceRow): string | undefined {
  if (row.category === "Combo" && row.size) {
    return `set-4-${row.size}`;
  }
  if (row.category === "Drap" && row.size) {
    return `sheet-${row.size}`;
  }
  if (row.category === "Chăn") return "blanket";
  if (row.category === "Vỏ gối nằm") return "pillowcase-flat";
  if (row.category === "Vỏ gối ôm") return "pillowcase-bolster";
  return undefined;
}

function getLegacyMaterialId(
  yarnName: string,
  patternName: string,
  patternId: string,
): string | undefined {
  const yarn = yarnName.toLocaleLowerCase("vi");
  const pattern = `${patternName} ${patternId}`.toLocaleLowerCase("vi");
  const isPatterned = /hoa|họa|pattern/.test(pattern);

  if (/40s/.test(yarn)) return isPatterned ? "40s-pattern" : "40s-plain";
  if (/50s/.test(yarn)) return "50s";
  if (/60s/.test(yarn)) return isPatterned ? "60s-pattern" : "60s-plain";
  if (/100s/.test(yarn)) return "100s";
  if (/kim|knit/.test(yarn)) return "knit";
  return undefined;
}

export function getPriceRows(products: Product[]): ProductPriceRow[] {
  const rows = new Map<string, ProductPriceRow>();

  for (const product of products) {
    const category = product.category ?? "Chưa phân loại";
    const size = product.size;
    const id = `product:${encodeURIComponent(category)}:${size ?? "default"}`;
    const existing = rows.get(id);

    if (existing) {
      existing.productCount += 1;
    } else {
      rows.set(id, {
        id,
        name: size ? `${category} ${size}` : category,
        category,
        size,
        productCount: 1,
      });
    }
  }

  return [...rows.values()].sort(
    (left, right) =>
      left.category.localeCompare(right.category, "vi") ||
      (left.size ?? "").localeCompare(right.size ?? "", "vi"),
  );
}

export function moveKeyBefore(
  keys: string[],
  sourceKey: string,
  targetKey: string,
): string[] {
  const sourceIndex = keys.indexOf(sourceKey);
  const targetIndex = keys.indexOf(targetKey);
  if (
    sourceIndex < 0 ||
    targetIndex < 0 ||
    sourceIndex === targetIndex
  ) {
    return keys;
  }

  const nextKeys = [...keys];
  const [movedKey] = nextKeys.splice(sourceIndex, 1);
  nextKeys.splice(targetIndex, 0, movedKey);
  return nextKeys;
}

export function orderPriceMaterials(
  materials: PriceMaterial[],
  savedOrder: string[],
): PriceMaterial[] {
  const groupKeys = [...new Set(materials.map((material) => material.group.key))];
  const knownGroupKeys = new Set(groupKeys);
  const materialGroupById = new Map(
    materials.map((material) => [material.id, material.group.key]),
  );
  const restoredGroupKeys = savedOrder
    .map((key) =>
      knownGroupKeys.has(key) ? key : materialGroupById.get(key),
    )
    .filter((key): key is string => key !== undefined);
  const orderedGroupKeys = [
    ...new Set([
      ...restoredGroupKeys,
      ...groupKeys.filter((key) => !restoredGroupKeys.includes(key)),
    ]),
  ];
  const groupPosition = new Map(
    orderedGroupKeys.map((key, index) => [key, index]),
  );
  return [...materials].sort(
    (left, right) =>
      (groupPosition.get(left.group.key) ?? 0) -
      (groupPosition.get(right.group.key) ?? 0),
  );
}

export function getPriceMaterials(
  yarns: Yarn[],
  patterns: Pattern[],
): PriceMaterial[] {
  const patternsById = new Map(patterns.map((pattern) => [pattern.id, pattern]));

  const catalogMaterials = yarns.flatMap((yarn) => {
    const yarnPatterns = yarn.patternIds
      .map((patternId) => patternsById.get(patternId))
      .filter((pattern): pattern is Pattern => pattern !== undefined);
    const variants =
      yarnPatterns.length > 0
        ? yarnPatterns.map((pattern) => ({
            id: `yarn:${yarn.id}:pattern:${pattern.id}`,
            pattern: pattern.name,
            patternId: pattern.id,
          }))
        : [
            {
              id: `yarn:${yarn.id}:base`,
              pattern: "Đơn giá",
              patternId: "",
            },
          ];

    return variants.map((variant) => ({
      id: variant.id,
      name: yarn.name,
      pattern: variant.pattern,
      legacyId: getLegacyMaterialId(
        yarn.name,
        variant.pattern,
        variant.patternId,
      ),
    }));
  });

  const representedLegacyIds = new Set(
    catalogMaterials.flatMap((material) =>
      material.legacyId ? [material.legacyId] : [],
    ),
  );
  const legacyMaterials = MATERIALS.filter(
    (material) => !representedLegacyIds.has(material.id),
  ).map((material) => ({
    id: `legacy:${material.id}`,
    name: material.name,
    pattern: material.pattern,
    legacyId: material.id,
  }));
  const allMaterials = [...catalogMaterials, ...legacyMaterials];
  const legacyGroupById = new Map(
    MATERIALS.map((material) => [
      material.id,
      material.group ?? { key: material.id, label: material.name },
    ]),
  );

  const getOrder = (material: (typeof allMaterials)[number]) => {
    const legacyIndex = material.legacyId
      ? LEGACY_MATERIAL_IDS.findIndex((id) => id === material.legacyId)
      : -1;
    return legacyIndex < 0
      ? LEGACY_MATERIAL_IDS.length + allMaterials.indexOf(material)
      : legacyIndex;
  };

  return allMaterials
    .sort((left, right) => getOrder(left) - getOrder(right))
    .map((material) => ({
      ...material,
      group:
        (material.legacyId
          ? legacyGroupById.get(material.legacyId)
          : undefined) ?? {
          key: `material:${material.id}`,
          label: material.name,
        },
    }));
}

export function createDefaultDraft(
  rows: ProductPriceRow[],
  materials: PriceMaterial[],
): PriceDraft {
  return {
    products: Object.fromEntries(
      rows.map((row) => {
        const legacyProductId = getLegacyProductId(row);
        return [
          row.id,
          Object.fromEntries(
            materials.map((material) => [
              material.id,
              String(
                (legacyProductId &&
                  material.legacyId &&
                  DEFAULT_PRICES.products[legacyProductId]?.[
                    material.legacyId
                  ]) ??
                  "",
              ),
            ]),
          ),
        ];
      }),
    ),
    pillows: Object.fromEntries(
      PILLOWS.map((pillow) => [
        pillow.id,
        String(DEFAULT_PRICES.pillows[pillow.id] ?? ""),
      ]),
    ),
  };
}

export function reconcileDraft(
  draft: PriceDraft,
  rows: ProductPriceRow[],
  materials: PriceMaterial[],
): PriceDraft {
  const defaults = createDefaultDraft(rows, materials);
  return {
    products: Object.fromEntries(
      rows.map((row) => [
        row.id,
        Object.fromEntries(
          materials.map((material) => [
            material.id,
            draft.products[row.id]?.[material.id] ??
              defaults.products[row.id]?.[material.id] ??
              "",
          ]),
        ),
      ]),
    ),
    pillows: Object.fromEntries(
      PILLOWS.map((pillow) => [
        pillow.id,
        draft.pillows[pillow.id] ?? defaults.pillows[pillow.id] ?? "",
      ]),
    ),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidPrice(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0
  );
}

export function parseStoredPrices(
  value: unknown,
  rows: ProductPriceRow[],
  materials: PriceMaterial[],
): PriceDraft {
  if (
    !isRecord(value) ||
    !isRecord(value.products) ||
    !isRecord(value.pillows)
  ) {
    throw new Error("Cấu trúc bảng giá không hợp lệ.");
  }

  const draft = createDefaultDraft(rows, materials);
  for (const row of rows) {
    const legacyProductId = getLegacyProductId(row);
    const storedPrices =
      value.products[row.id] ??
      (legacyProductId ? value.products[legacyProductId] : undefined);
    if (storedPrices === undefined) continue;

    if (Array.isArray(storedPrices)) {
      const oldPrices = Object.fromEntries(
        LEGACY_MATERIAL_IDS.map((materialId, index) => [
          materialId,
          storedPrices[index],
        ]),
      );
      for (const material of materials) {
        const price =
          oldPrices[material.legacyId ?? ""] ??
          (material.legacyId
            ? DEFAULT_PRICES.products[legacyProductId ?? ""]?.[
                material.legacyId
              ]
            : undefined);
        if (price === undefined) continue;
        if (!isValidPrice(price)) {
          throw new Error(`Giá của "${row.name}" không hợp lệ.`);
        }
        draft.products[row.id][material.id] = String(price);
      }
      continue;
    }

    if (!isRecord(storedPrices)) {
      throw new Error(`Giá của "${row.name}" không hợp lệ.`);
    }

    for (const material of materials) {
      const price =
        storedPrices[material.id] ??
        (material.legacyId
          ? storedPrices[material.legacyId] ??
            DEFAULT_PRICES.products[legacyProductId ?? ""]?.[
              material.legacyId
            ]
          : undefined);
      if (price === undefined) continue;
      if (!isValidPrice(price)) {
        throw new Error(
          `Giá của "${row.name}" - ${material.name} không hợp lệ.`,
        );
      }
      draft.products[row.id][material.id] = String(price);
    }
  }

  for (const pillow of PILLOWS) {
    const price = value.pillows[pillow.id];
    if (price === undefined) continue;
    if (!isValidPrice(price)) {
      throw new Error(`Giá của "${pillow.name}" không hợp lệ.`);
    }
    draft.pillows[pillow.id] = String(price);
  }

  return draft;
}

export function parseDraft(
  draft: PriceDraft,
  rows: ProductPriceRow[],
  materials: PriceMaterial[],
): PriceValues | null {
  const products: Record<string, Record<string, number>> = {};
  for (const row of rows) {
    const productPrices: Record<string, number> = {};
    for (const material of materials) {
      const value = draft.products[row.id]?.[material.id];
      if (
        !value ||
        !/^\d+$/.test(value) ||
        !Number.isSafeInteger(Number(value)) ||
        Number(value) <= 0
      ) {
        return null;
      }
      productPrices[material.id] = Number(value);
    }
    products[row.id] = productPrices;
  }

  const pillows: Record<string, number> = {};
  for (const pillow of PILLOWS) {
    const value = draft.pillows[pillow.id];
    if (
      !value ||
      !/^\d+$/.test(value) ||
      !Number.isSafeInteger(Number(value)) ||
      Number(value) <= 0
    ) {
      return null;
    }
    pillows[pillow.id] = Number(value);
  }

  return { products, pillows };
}
