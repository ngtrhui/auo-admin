"use client";

import {
  useRef,
  useMemo,
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  FiChevronDown,
  FiImage,
  FiTrash2,
  FiUploadCloud,
} from "react-icons/fi";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/components/ui/Toaster";
import type { Pattern } from "@/components/modules/pattern/pattern.types";
import type { Yarn } from "@/components/modules/yarn/yarn.types";
import { finalizeImageForUpload } from "@/utils/compressImage";
import type { ProductFormState } from "./product.types";
import { PRODUCT_CATEGORIES, PRODUCT_SIZES } from "./product.types";
import { getAvailableComboSizes } from "./product.utils";

const MAX_PRODUCT_IMAGE_BYTES = 10 * 1024 * 1024;

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
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [areCategoriesExpanded, setAreCategoriesExpanded] = useState(true);
  const availableComboSizes = getAvailableComboSizes({
    categories: form.categories,
    drapSizes: form.drapSizes,
    drapStocks: form.drapStocks,
    categoryStocks: form.categoryStocks,
  });
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

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showToast("error", "Ảnh sản phẩm chỉ nhận định dạng JPG, PNG hoặc WebP.");
      return;
    }
    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      showToast("error", "Ảnh sản phẩm không được lớn hơn 10 MB.");
      return;
    }

    setIsProcessingImage(true);
    try {
      const optimizedImage = await finalizeImageForUpload(file);
      const imageData = await readFileAsDataUrl(optimizedImage);
      onChange((current) => ({ ...current, image: imageData }));
    } catch (error) {
      console.error("Không thể xử lý ảnh sản phẩm.", error);
      showToast("error", "Không thể xử lý ảnh. Vui lòng thử lại.");
    } finally {
      setIsProcessingImage(false);
    }
  };

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
        <section className="space-y-4 rounded-2xl border border-primary/10 bg-linear-to-b from-primary-light/70 via-white to-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-0">
          <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-xl border border-gray/10 bg-white shadow-inner sm:aspect-square">
            {form.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.image}
                alt={`Ảnh nhóm sản phẩm ${form.name || "mới"}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <FiImage className="size-7" aria-hidden />
                </span>
                <span className="text-sm font-medium">Chưa có ảnh</span>
                <span className="text-xs">Tải ảnh để xem trước tại đây</span>
              </div>
            )}
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />
          <div className="grid gap-2">
            <Button
              type="button"
              variant="outlinePrimary"
              size="sm"
              leftIcon={<FiUploadCloud aria-hidden />}
              disabled={isProcessingImage}
              onClick={() => imageInputRef.current?.click()}
              fullWidth
            >
              {isProcessingImage
                ? "Đang xử lý ảnh..."
                : form.image
                  ? "Thay ảnh sản phẩm"
                  : "Tải ảnh lên"}
            </Button>
            {form.image ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<FiTrash2 aria-hidden />}
                disabled={isProcessingImage}
                onClick={() =>
                  onChange((current) => ({ ...current, image: null }))
                }
                fullWidth
                className="text-coral hover:bg-coral/5 hover:text-coral"
              >
                Xóa ảnh
              </Button>
            ) : null}
          </div>
          <p className="text-center text-[11px] leading-4 text-gray">
            JPG, PNG hoặc WebP · Tối đa 10 MB
          </p>
        </section>

        <div className="min-w-0 space-y-5">
          <section className="space-y-5 rounded-2xl border border-gray/10 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-sm font-semibold text-black">
              Thông tin chung
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Mã sản phẩm" required>
                <Input
                  required
                  maxLength={32}
                  value={form.sku}
                  readOnly={isEditing}
                  onChange={(event) =>
                    onChange((current) => ({
                      ...current,
                      sku: event.target.value,
                    }))
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
                  value={
                    form.yarnIds[0] !== undefined ? String(form.yarnIds[0]) : ""
                  }
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
                      patternIds: patterns.some(
                        (pattern) => pattern.id === patternId,
                      )
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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Không đọc được dữ liệu ảnh."));
      }
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error("Không đọc được dữ liệu ảnh."));
    };
    reader.readAsDataURL(file);
  });
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="block text-xs font-semibold text-black">
        {label}
        {required ? <span className="ml-0.5 text-[#C86F5E]">*</span> : null}
      </span>
      {children}
    </label>
  );
}
