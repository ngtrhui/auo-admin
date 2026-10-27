"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { FiImage, FiTrash2, FiUploadCloud } from "react-icons/fi";

import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toaster";
import { finalizeImageForUpload } from "@/utils/compressImage";
import type { ProductFormState } from "@/components/modules/product/product.types";

const MAX_PRODUCT_IMAGE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ProductImagePickerProps {
  image: string | null;
  name: string;
  onChange: Dispatch<SetStateAction<ProductFormState>>;
}

export default function ProductImagePicker({
  image,
  name,
  onChange,
}: ProductImagePickerProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      showToast("error", "Ảnh sản phẩm chỉ nhận định dạng JPG, PNG hoặc WebP.");
      return;
    }
    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      showToast("error", "Ảnh sản phẩm không được lớn hơn 10 MB.");
      return;
    }

    setIsProcessing(true);
    try {
      const optimizedImage = await finalizeImageForUpload(file);
      const imageData = await readFileAsDataUrl(optimizedImage);
      onChange((current) => ({ ...current, image: imageData }));
    } catch (error) {
      console.error("Không thể xử lý ảnh sản phẩm.", error);
      showToast("error", "Không thể xử lý ảnh. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-primary/10 bg-linear-to-b from-primary-light/70 via-white to-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-0">
      <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-xl border border-gray/10 bg-white shadow-inner sm:aspect-square">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`Ảnh nhóm sản phẩm ${name || "mới"}`}
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
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={handleImageChange}
      />
      <div className="grid gap-2">
        <Button
          type="button"
          variant="outlinePrimary"
          size="sm"
          leftIcon={<FiUploadCloud aria-hidden />}
          disabled={isProcessing}
          onClick={() => imageInputRef.current?.click()}
          fullWidth
        >
          {isProcessing
            ? "Đang xử lý ảnh..."
            : image
              ? "Thay ảnh sản phẩm"
              : "Tải ảnh lên"}
        </Button>
        {image ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<FiTrash2 aria-hidden />}
            disabled={isProcessing}
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
