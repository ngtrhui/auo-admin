"use client";

import {
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { FiChevronDown } from "react-icons/fi";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import type { Pattern } from "@/components/modules/pattern/pattern.types";
import type { Yarn } from "@/components/modules/yarn/yarn.types";
import FormField from "@/components/modules/product/ProductFormField";
import ProductGeneralFields from "@/components/modules/product/ProductGeneralFields";
import ProductImagePicker from "@/components/modules/product/ProductImagePicker";
import type { ProductFormState } from "@/components/modules/product/product.types";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_SIZES,
} from "@/components/modules/product/product.types";
import { getAvailableComboSizes } from "@/utils/product.utils";

interface ProductFormDialogProps {
  open: boolean;
  form: ProductFormState;
  onChange: Dispatch<SetStateAction<ProductFormState>>;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
  yarns: Yarn[];
  patterns: Pattern[];
}

export default function ProductFormDialog({
  open,
  form,
  onChange,
  onClose,
  onSubmit,
  isEditing,
  yarns,
  patterns,
}: ProductFormDialogProps) {
  const [areCategoriesExpanded, setAreCategoriesExpanded] = useState(true);
  const availableComboSizes = getAvailableComboSizes({
    categories: form.categories,
    drapSizes: form.drapSizes,
    drapStocks: form.drapStocks,
    categoryStocks: form.categoryStocks,
  });
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${isEditing ? "Cập nhật" : "Thêm"} nhóm sản phẩm`}
      maxWidth="1200px"
      className="h-[90vh] w-[calc(100vw-2rem)] min-w-0"
      contentClassName="min-h-0 flex-1 overflow-y-auto"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form="product-form">
            Lưu nhóm sản phẩm
          </Button>
        </>
      }
    >
      <form
        id="product-form"
        onSubmit={onSubmit}
        className="grid items-start gap-5 p-4 sm:p-6 lg:grid-cols-[280px_minmax(0,1fr)]"
      >
        <ProductImagePicker
          image={form.image}
          name={form.name}
          onChange={onChange}
        />

        <div className="min-w-0 space-y-5">
          <ProductGeneralFields
            form={form}
            onChange={onChange}
            isEditing={isEditing}
            yarns={yarns}
            patterns={patterns}
          />

          <section className="space-y-5 rounded-2xl border border-gray/10 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <button
                type="button"
                aria-expanded={areCategoriesExpanded}
                aria-controls="product-category-list"
                onClick={() =>
                  setAreCategoriesExpanded((expanded) => !expanded)
                }
                className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <FiChevronDown
                  aria-hidden
                  className={`size-4 shrink-0 text-gray transition-transform ${
                    areCategoriesExpanded ? "rotate-180" : ""
                  }`}
                />
                <h2 className="text-sm font-semibold text-black">Danh mục</h2>
              </button>
              <span className="rounded-full border border-primary/15 bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                {form.categories.length} / {PRODUCT_CATEGORIES.length}
              </span>
            </div>

            <div
              id="product-category-list"
              hidden={!areCategoriesExpanded}
              className="grid grid-cols-1 gap-2.5"
            >
              {PRODUCT_CATEGORIES.map((category) => {
                const isSelected = form.categories.includes(category);

                return (
                  <div
                    key={category}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
                      isSelected
                        ? "border-primary/35 bg-primary-light/30 shadow-sm"
                        : "border-gray/15 bg-gray-50/60 hover:border-gray/30"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        onChange((current) => ({
                          ...current,
                          categories: checked
                            ? [...current.categories, category]
                            : current.categories.filter(
                                (item) => item !== category,
                              ),
                          drapSizes:
                            category === "Drap" && !checked
                              ? []
                              : current.drapSizes,
                          categoryPrices: checked
                            ? {
                                ...current.categoryPrices,
                                [category]:
                                  current.categoryPrices[category] ?? 0,
                              }
                            : current.categoryPrices,
                          categoryStocks: checked
                            ? {
                                ...current.categoryStocks,
                                [category]:
                                  current.categoryStocks[category] ?? 0,
                              }
                            : current.categoryStocks,
                        }));
                      }}
                      label={category}
                      containerClassName=" flex-1"
                    />
                    {isSelected ? (
                      category === "Drap" ? (
                        <div className="grid w-full gap-3">
                          {PRODUCT_SIZES.map((size) => {
                            const isSizeSelected =
                              form.drapSizes.includes(size);

                            return (
                              <div
                                key={size}
                                className="space-y-3 rounded-lg border border-gray/15 bg-white p-3"
                              >
                                <Checkbox
                                  checked={isSizeSelected}
                                  onChange={(event) => {
                                    const checked = event.target.checked;
                                    onChange((current) => ({
                                      ...current,
                                      drapSizes: checked
                                        ? [...current.drapSizes, size]
                                        : current.drapSizes.filter(
                                            (item) => item !== size,
                                          ),
                                      drapPrices: {
                                        ...current.drapPrices,
                                        [size]: current.drapPrices[size] ?? 0,
                                      },
                                      drapStocks: {
                                        ...current.drapStocks,
                                        [size]: current.drapStocks[size] ?? 0,
                                      },
                                      comboPrices: {
                                        ...current.comboPrices,
                                        [size]: current.comboPrices[size] ?? 0,
                                      },
                                    }));
                                  }}
                                  label={`Drap ${size}`}
                                />
                                {isSizeSelected ? (
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    <FormField label="Giá bán (₫)" required>
                                      <Input
                                        required
                                        type="number"
                                        min={0}
                                        step={1000}
                                        value={form.drapPrices[size] ?? 0}
                                        onChange={(event) =>
                                          onChange((current) => ({
                                            ...current,
                                            drapPrices: {
                                              ...current.drapPrices,
                                              [size]:
                                                event.target.value === ""
                                                  ? 0
                                                  : Number(event.target.value),
                                            },
                                          }))
                                        }
                                        variant="standard"
                                        className="h-10 text-sm"
                                      />
                                    </FormField>
                                    <FormField label="Tồn kho" required>
                                      <Input
                                        required
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={form.drapStocks[size] ?? 0}
                                        onChange={(event) =>
                                          onChange((current) => ({
                                            ...current,
                                            drapStocks: {
                                              ...current.drapStocks,
                                              [size]:
                                                event.target.value === ""
                                                  ? 0
                                                  : Number(event.target.value),
                                            },
                                          }))
                                        }
                                        variant="standard"
                                        className="h-10 text-sm"
                                      />
                                    </FormField>
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="grid w-full grid-cols-2 gap-2 sm:w-72 sm:shrink-0">
                          <FormField label="Giá bán (₫)" required>
                            <Input
                              required
                              type="number"
                              min={0}
                              step={1000}
                              value={form.categoryPrices[category] ?? 0}
                              onChange={(event) =>
                                onChange((current) => ({
                                  ...current,
                                  categoryPrices: {
                                    ...current.categoryPrices,
                                    [category]:
                                      event.target.value === ""
                                        ? 0
                                        : Number(event.target.value),
                                  },
                                }))
                              }
                              variant="standard"
                              className="h-10 bg-white text-sm"
                            />
                          </FormField>
                          <FormField label="Tồn kho" required>
                            <Input
                              required
                              type="number"
                              min={0}
                              step={1}
                              value={form.categoryStocks[category] ?? 0}
                              onChange={(event) =>
                                onChange((current) => ({
                                  ...current,
                                  categoryStocks: {
                                    ...current.categoryStocks,
                                    [category]:
                                      event.target.value === ""
                                        ? 0
                                        : Number(event.target.value),
                                  },
                                }))
                              }
                              variant="standard"
                              className="h-10 bg-white text-sm"
                            />
                          </FormField>
                        </div>
                      )
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
          {availableComboSizes.length > 0 ? (
            <section className="space-y-4 rounded-2xl bg-primary-light/20 ">
              <div className="grid gap-3 sm:grid-cols-2">
                {availableComboSizes.map(({ size, stock }) => (
                  <div
                    key={size}
                    className="space-y-3 rounded-xl border border-primary/15 bg-white p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-black">
                        Combo 4 món {size}
                      </h3>
                      <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
                        Khả dụng: {stock} bộ
                      </span>
                    </div>
                    <FormField label={`Giá combo ${size} (₫)`} required>
                      <Input
                        required
                        type="number"
                        min={0}
                        step={1000}
                        value={form.comboPrices[size] ?? 0}
                        onChange={(event) =>
                          onChange((current) => ({
                            ...current,
                            comboPrices: {
                              ...current.comboPrices,
                              [size]:
                                event.target.value === ""
                                  ? 0
                                  : Number(event.target.value),
                            },
                          }))
                        }
                        variant="standard"
                        className="h-10"
                      />
                    </FormField>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          {form.categories.length === 0 ? (
            <div className="space-y-3 rounded-xl border border-dashed border-primary/30 bg-primary-light/20 p-4">
              <p className="text-xs font-medium text-primary">
                Giá và tồn kho áp dụng chung cho nhóm sản phẩm
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Giá bán chung (₫)" required>
                  <Input
                    required
                    type="number"
                    min={0}
                    step={1000}
                    value={form.price}
                    onChange={(event) =>
                      onChange((current) => ({
                        ...current,
                        price:
                          event.target.value === ""
                            ? 0
                            : Number(event.target.value),
                      }))
                    }
                    variant="standard"
                    className="h-10"
                  />
                </FormField>
                <FormField label="Tồn kho chung" required>
                  <Input
                    required
                    type="number"
                    min={0}
                    step={1}
                    value={form.stock}
                    onChange={(event) =>
                      onChange((current) => ({
                        ...current,
                        stock:
                          event.target.value === ""
                            ? 0
                            : Number(event.target.value),
                      }))
                    }
                    variant="standard"
                    className="h-10"
                  />
                </FormField>
              </div>
            </div>
          ) : null}
          <section className="space-y-4 rounded-2xl border border-gray/10 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-sm font-semibold text-black">Mô tả</h2>
            <Textarea
              value={form.description}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              maxLength={500}
              rows={3}
              placeholder="Nhập mô tả chung cho nhóm sản phẩm (không bắt buộc)"
            />
          </section>
        </div>
      </form>
    </Modal>
  );
}
