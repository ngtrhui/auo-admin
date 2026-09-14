'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import { BsFiletypeXlsx } from 'react-icons/bs';

import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { cn } from '@/utils/classNames';
import { formatFileSize } from '@/utils/format';
import { validateFile } from '@/utils/validateFile';
import { BiTrash } from 'react-icons/bi';

export type FileUploadProps = {
  value?: File | null;
  onChange: (file: File | null) => void;
  allowedExtensions?: readonly string[];
  maxFileSize?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
  hint?: string;
};

export default function FileUpload({
  value,
  onChange,
  allowedExtensions,
  maxFileSize,
  disabled = false,
  className,
  label = 'Chọn file',
  hint,
}: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = allowedExtensions?.join(',');

  const validateAndSetFile = useCallback(
    (file: File | null) => {
      if (!file) {
        setError(null);
        onChange(null);
        return;
      }

      const validationError = validateFile(file, { allowedExtensions, maxFileSize });
      if (validationError) {
        setError(validationError);
        onChange(null);
        return;
      }

      setError(null);
      onChange(file);
    },
    [allowedExtensions, maxFileSize, onChange],
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    validateAndSetFile(file);
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
    validateAndSetFile(file);
  };

  const openFilePicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const clearFile = () => {
    validateAndSetFile(null);
  };

  const defaultHint =
    hint ??
    [
      allowedExtensions?.length ? `Định dạng: ${allowedExtensions.join(', ')}` : null,
      maxFileSize != null ? `Tối đa ${formatFileSize(maxFileSize)}` : null,
    ]
      .filter(Boolean)
      .join(' · ');

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={handleInputChange}
      />

      {value ? (
        <div className="flex items-center gap-4 rounded-xl border border-gray/20 bg-gray-50 p-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-green/10 text-green">
            <BsFiletypeXlsx className="size-8" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-black">{value.name}</p>
            <p className="mt-0.5 text-xs text-gray">{formatFileSize(value.size)}</p>
          </div>

          <Button
            type="button"
            variant="transparent"
            size="sm"
            disabled={disabled}
            className="text-gray hover:text-coral"
            onClick={clearFile}
            aria-label="Xóa file"
          >
            <BiTrash className="size-5 shrink-0 text-coral" />
          </Button>
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
            'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
            disabled && 'cursor-not-allowed opacity-60',
            isDragging
              ? 'border-primary bg-primary-light/40'
              : 'border-gray/30 bg-white hover:border-primary/50 hover:bg-primary-light/20',
          )}
        >
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary-light text-primary">
            <FiUploadCloud className="size-6" />
          </div>
          <p className="text-sm font-semibold text-black">{label}</p>
          <p className="mt-1 text-xs text-gray">Kéo thả file vào đây hoặc bấm để chọn từ máy</p>
          {defaultHint ? <p className="mt-2 text-xs text-gray/80">{defaultHint}</p> : null}
        </div>
      )}

      <FieldError message={error ?? undefined} />
    </div>
  );
}
