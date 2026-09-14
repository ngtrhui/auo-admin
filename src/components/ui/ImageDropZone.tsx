'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { BiTrash } from 'react-icons/bi';
import { FiUploadCloud } from 'react-icons/fi';

import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { cn } from '@/utils/classNames';
import { formatFileSize } from '@/utils/format';
import { CROP_IMAGE_ACCEPT, getCropImageValidationCode } from '@/constants/file-upload';

const BLOG_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

export type ImageDropZoneProps = {
  previewUrl?: string | null;
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  /** Override aspect/size of the drop zone. Default keeps blog layout (`aspect-[16/5]`). */
  zoneClassName?: string;
  hint?: string;
};

function getImageValidationError(file: File): string | null {
  if (file.size > BLOG_IMAGE_MAX_BYTES) {
    return `Kích thước file tối đa là ${formatFileSize(BLOG_IMAGE_MAX_BYTES)}`;
  }

  const code = getCropImageValidationCode(file);
  if (code === 'invalidType') {
    return 'Chỉ chấp nhận file JPG, PNG, WebP';
  }

  return null;
}

export default function ImageDropZone({
  previewUrl,
  onFileSelect,
  onRemove,
  disabled = false,
  error,
  className,
  zoneClassName,
  hint = 'Định dạng: JPG, PNG, WebP (Tối đa 2MB)',
}: ImageDropZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateAndSelect = useCallback(
    (file: File | null) => {
      if (!file) return;

      const message = getImageValidationError(file);
      if (message) {
        setValidationError(message);
        return;
      }

      setValidationError(null);
      onFileSelect(file);
    },
    [onFileSelect],
  );

  const openFilePicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    validateAndSelect(file);
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = event.dataTransfer.files?.[0] ?? null;
    validateAndSelect(file);
  };

  const dropZoneClassName = cn(
    'overflow-hidden rounded-lg border transition-colors',
    zoneClassName ?? 'aspect-[16/5]',
    disabled && 'cursor-not-allowed opacity-60',
    isDragging
      ? 'border-primary bg-primary-light/40'
      : previewUrl
        ? 'cursor-pointer border-gray/20 bg-gray-50 hover:border-primary/50'
        : 'cursor-pointer border-dashed border-gray/30 bg-gray-50 hover:border-primary/50 hover:bg-primary-light/20',
  );

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={CROP_IMAGE_ACCEPT}
        className="hidden"
        disabled={disabled}
        onChange={handleInputChange}
      />

      {previewUrl ? (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={openFilePicker}
          onKeyDown={(event) => {
            if (disabled) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openFilePicker();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={dropZoneClassName}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={openFilePicker}
          onKeyDown={(event) => {
            if (disabled) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openFilePicker();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            dropZoneClassName,
            'flex flex-col items-center justify-center px-4 py-8 text-center',
          )}
        >
          <FiUploadCloud className="mb-2 size-8 text-primary" />
          <p className="text-sm font-semibold text-primary">Tải ảnh lên</p>
          <p className="mt-1 text-xs text-gray">{hint}</p>
        </div>
      )}

      {previewUrl && onRemove ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="h-8 px-2 text-coral hover:bg-coral/10 hover:text-coral"
            leftIcon={<BiTrash className="size-4" />}
            onClick={onRemove}
          >
            Xóa ảnh
          </Button>
        </div>
      ) : null}

      <FieldError message={validationError ?? error} />
    </div>
  );
}
