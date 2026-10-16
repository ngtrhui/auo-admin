import imageCompression, { type Options } from 'browser-image-compression';

const DEFAULT_OPTIONS: Options = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 2048,
  useWebWorker: true,
  maxIteration: 4,
  initialQuality: 0.75,
  fileType: 'image/webp',
};

export const WEBP_EXPORT_QUALITY = DEFAULT_OPTIONS.initialQuality ?? 0.75;
export const EDIT_MAX_DIMENSION = 2048;

const MAX_UPLOAD_BYTES = (DEFAULT_OPTIONS.maxSizeMB ?? 0.5) * 1024 * 1024;

function resolveEditingMimeType(file: File): string {
  const t = file.type?.trim().toLowerCase();
  if (t === 'image/jpg') return 'image/jpeg';
  if (t === 'image/jpeg' || t === 'image/png' || t === 'image/webp') return t;
  const n = file.name.toLowerCase();
  if (n.endsWith('.webp')) return 'image/webp';
  if (n.endsWith('.png')) return 'image/png';
  return 'image/jpeg';
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Không đọc được ảnh.'));
    };
    img.src = url;
  });
}

function canvasToFile(
  canvas: HTMLCanvasElement,
  fileName: string,
  mime: string,
  quality: number,
): Promise<File | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        resolve(
          new File([blob], fileName, {
            type: mime,
            lastModified: Date.now(),
          }),
        );
      },
      mime,
      quality,
    );
  });
}

/**
 * Chuẩn bị ảnh cho editor: giữ gốc hoặc resize nhẹ khi cạnh dài > EDIT_MAX_DIMENSION.
 * Không dùng browser-image-compression (không nén lossy mạnh).
 */
export async function prepareImageForEditing(file: File): Promise<File> {
  const img = await loadImageFromFile(file);
  const maxEdge = Math.max(img.naturalWidth, img.naturalHeight);
  if (maxEdge <= EDIT_MAX_DIMENSION) return file;

  const scale = EDIT_MAX_DIMENSION / maxEdge;
  const outW = Math.round(img.naturalWidth * scale);
  const outH = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.drawImage(img, 0, 0, outW, outH);
  const mime = resolveEditingMimeType(file);
  const quality = mime === 'image/png' ? undefined : 1;
  const resized = await canvasToFile(canvas, file.name, mime, quality ?? 1);
  return resized ?? file;
}

/**
 * Nén ảnh trên trình duyệt (browser-image-compression).
 */
export async function compressImage(file: File, options?: Options): Promise<File> {
  return imageCompression(file, { ...DEFAULT_OPTIONS, ...options });
}

function withWebpName(file: File): File {
  if (/\.webp$/i.test(file.name)) return file;
  const base = file.name.replace(/\.[^.]+$/, '') || `image-${Date.now()}`;
  return new File([file], `${base}.webp`, {
    type: file.type,
    lastModified: file.lastModified,
  });
}

/**
 * Lưới an toàn trước upload: đảm bảo ảnh là webp và <= maxSizeMB.
 * Đã đạt thì giữ nguyên (chỉ chuẩn hoá tên .webp), chưa đạt thì nén về webp.
 */
export async function finalizeImageForUpload(file: File): Promise<File> {
  if (file.type === 'image/webp' && file.size <= MAX_UPLOAD_BYTES) {
    return withWebpName(file);
  }
  const compressed = await compressImage(file);
  return withWebpName(compressed);
}
