"use client";

import { useMemo, type Dispatch, type SetStateAction } from "react";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Pattern } from "@/components/modules/pattern/pattern.types";
import type { Yarn } from "@/components/modules/yarn/yarn.types";
import FormField from "@/components/modules/product/ProductFormField";
import type { ProductFormState } from "@/components/modules/product/product.types";

interface ProductGeneralFieldsProps {
  form: ProductFormState;
  onChange: Dispatch<SetStateAction<ProductFormState>>;
  isEditing: boolean;
  yarns: Yarn[];
  patterns: Pattern[];
}

export default function ProductGeneralFields({
  form,
  onChange,
  isEditing,
  yarns,
  patterns,
}: ProductGeneralFieldsProps) {
  const yarnOptions = useMemo(
    () =>
      yarns.map((yarn) => ({
        value: String(yarn.id),
        label: yarn.name,
      })),
    [yarns],
  );
  const patternOptions = useMemo(
    () =>
      patterns.map((pattern) => ({
        value: pattern.id,
        label: pattern.name,
      })),
    [patterns],
  );

  return (
    <section className="space-y-5 rounded-2xl border border-gray/10 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-sm font-semibold text-black">Thông tin chung</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Mã sản phẩm" required>
          <Input
            required
            maxLength={32}
            value={form.sku}
            readOnly={isEditing}
            onChange={(event) =>
              onChange((current) => ({ ...current, sku: event.target.value }))
            }
            placeholder="HONG-PHAN"
            variant="standard"
            className="h-10"
          />
        </FormField>
        <FormField label="Tên nhóm sản phẩm" required>
          <Input
            required
            maxLength={120}
            value={form.name}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                collection: event.target.value,
                name: event.target.value,
              }))
            }
            placeholder="Hồng phấn"
            variant="standard"
            className="h-10"
          />
        </FormField>
        <FormField label="Chất liệu">
          <Select
            selectionMode="single"
            options={yarnOptions}
            value={form.yarnIds[0] !== undefined ? String(form.yarnIds[0]) : ""}
            onChange={(selectedId) =>
              onChange((current) => ({
                ...current,
                yarnIds:
                  selectedId !== "" &&
                  yarns.some((yarn) => yarn.id === Number(selectedId))
                    ? [Number(selectedId)]
                    : [],
              }))
            }
            ariaLabel="Chất liệu nhóm sản phẩm"
            placeholder="Chọn chất liệu"
            className="h-10 w-full"
            popoverZIndex={110}
          />
        </FormField>
        <FormField label="Kiểu mẫu">
          <Select
            selectionMode="single"
            options={patternOptions}
            value={form.patternIds[0] ?? ""}
            onChange={(patternId) =>
              onChange((current) => ({
                ...current,
                patternIds: patterns.some((pattern) => pattern.id === patternId)
                  ? [patternId]
                  : [],
              }))
            }
            ariaLabel="Kiểu mẫu nhóm sản phẩm"
            placeholder="Chọn kiểu mẫu"
            className="h-10 w-full"
            popoverZIndex={110}
          />
        </FormField>
      </div>
    </section>
  );
}
