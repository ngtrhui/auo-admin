import { formatFileSize } from '@/utils/format';

export type FileValidationOptions = {
  allowedExtensions?: readonly string[];
  maxFileSize?: number;
};

export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  if (parts.length < 2) return '';
  return `.${parts.pop()!.toLowerCase()}`;
}

export function validateFile(file: File, options: FileValidationOptions): string | null {
  if (options.maxFileSize != null && file.size > options.maxFileSize) {
    return `Kích thước file tối đa là ${formatFileSize(options.maxFileSize)}`;
  }

  if (options.allowedExtensions?.length) {
    const extension = getFileExtension(file.name);
    const isAllowed = options.allowedExtensions.some(
      (allowed) => allowed.toLowerCase() === extension,
    );

    if (!isAllowed) {
      return `Chỉ chấp nhận file ${options.allowedExtensions.join(', ')}`;
    }
  }

  return null;
}
