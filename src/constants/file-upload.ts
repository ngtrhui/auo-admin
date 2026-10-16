export const CROP_IMAGE_MAX_BYTES = 20 * 1024 * 1024;

export const CROP_IMAGE_UPLOAD_ALLOWED_MIMES = new Set<string>([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const CROP_IMAGE_ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp';

export function resolveCropImageMimeType(file: File): string {
  const t = file.type?.trim().toLowerCase();
  if (t) {
    if (t === 'image/jpg') return 'image/jpeg';
    return t;
  }
  const n = file.name.toLowerCase();
  if (n.endsWith('.png')) return 'image/png';
  if (n.endsWith('.webp')) return 'image/webp';
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
  return '';
}

export type CropImageValidationCode = 'maxSize' | 'invalidType';

export function getCropImageValidationCode(file: File): CropImageValidationCode | null {
  if (file.size > CROP_IMAGE_MAX_BYTES) return 'maxSize';
  const mime = resolveCropImageMimeType(file);
  if (!mime || !CROP_IMAGE_UPLOAD_ALLOWED_MIMES.has(mime)) return 'invalidType';
  return null;
}
