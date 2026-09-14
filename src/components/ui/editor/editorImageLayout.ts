import {
  cropRectFromAttrs,
  getImageWidthPercent,
  hasActiveCrop,
  IMAGE_WIDTH_MAX,
  IMAGE_WIDTH_MIN,
  IMAGE_WIDTH_STEP,
  normalizeRotation,
  type CropRectNormalized,
  type ImageAlign,
} from '@/utils/editor/editorImage';

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const RESIZE_HANDLES: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

export const DRAG_THRESHOLD_PX = 3;

/** Kích thước tối thiểu (px) khi kéo resize, tránh đổ khung về 0. */
const MIN_DRAG_WIDTH_PX = 24;

export function alignToTextAlign(align: ImageAlign): 'left' | 'center' | 'right' | undefined {
  if (align === 'center') return 'center';
  if (align === 'right') return 'right';
  if (align === 'none') return undefined;
  return 'left';
}

/** Transform cho lớp căn giữa tuyệt đối (dùng khi cropped hoặc xoay 90/270). */
export function buildCenteredTransform(rotation: number, flipX: boolean, flipY: boolean): string {
  const parts = ['translate(-50%, -50%)'];
  if (rotation) parts.push(`rotate(${rotation}deg)`);
  if (flipX) parts.push('scaleX(-1)');
  if (flipY) parts.push('scaleY(-1)');
  return parts.join(' ');
}

/** Transform khi ảnh nằm theo dòng (full, không xoay dọc). */
export function buildFlowTransform(
  rotation: number,
  flipX: boolean,
  flipY: boolean,
): string | undefined {
  const parts: string[] = [];
  if (rotation) parts.push(`rotate(${rotation}deg)`);
  if (flipX) parts.push('scaleX(-1)');
  if (flipY) parts.push('scaleY(-1)');
  return parts.length ? parts.join(' ') : undefined;
}

export interface ImageFrameLayout {
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  crop: CropRectNormalized | null;
  cropped: boolean;
  vertical: boolean;
  /** Aspect thực của nội dung (crop hoặc ảnh gốc), null nếu ảnh full chưa load. */
  contentAspect: number | null;
  /** contentAspect với fallback 1 để tính CSS an toàn. */
  effectiveAspect: number;
  /** Bề rộng gốc (width attr hoặc 100%). */
  base: string;
  widthPercent: number;
  /** true: ảnh full không xoay → dựng theo dòng, height tự nhiên. */
  flowMode: boolean;
  frameWidth: string;
  frameAspectRatio?: string;
}

function parseCropAspectAttr(raw: unknown): number | null {
  const value =
    typeof raw === 'number' ? raw : typeof raw === 'string' ? Number.parseFloat(raw) : NaN;
  return Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * Tính bố cục khung ảnh trong editor NodeView từ attrs của node.
 * Khi xoay 90/270 sẽ hoán đổi kích thước khung để ring/handle bọc đúng ảnh dọc.
 */
export function computeImageFrameLayout(
  attrs: Record<string, unknown>,
  naturalAspect: number | null,
): ImageFrameLayout {
  const rotation = normalizeRotation(Number(attrs.rotation ?? 0));
  const flipX = Boolean(attrs.flipX);
  const flipY = Boolean(attrs.flipY);

  const crop = cropRectFromAttrs(attrs);
  const cropped = hasActiveCrop(crop);

  let contentAspect: number | null;
  if (cropped && crop) {
    contentAspect = parseCropAspectAttr(attrs.cropAspect) ?? (crop.h > 0 ? crop.w / crop.h : 1);
  } else {
    contentAspect = naturalAspect;
  }

  const vertical = rotation === 90 || rotation === 270;
  const width = (attrs.width as string | null) ?? null;
  const base = width || '100%';
  const widthPercent = getImageWidthPercent(width);
  const flowMode = !cropped && !vertical;
  const effectiveAspect = contentAspect ?? 1;

  let frameWidth = base;
  let frameAspectRatio: string | undefined;

  if (flowMode) {
    frameWidth = base;
  } else if (contentAspect) {
    frameWidth = vertical ? `calc(${base} / ${effectiveAspect})` : base;
    frameAspectRatio = String(vertical ? 1 / effectiveAspect : effectiveAspect);
  } else {
    // full + xoay nhưng chưa biết aspect (trước khi ảnh load) → tạm vuông.
    frameWidth = base;
    frameAspectRatio = '1';
  }

  return {
    rotation,
    flipX,
    flipY,
    crop,
    cropped,
    vertical,
    contentAspect,
    effectiveAspect,
    base,
    widthPercent,
    flowMode,
    frameWidth,
    frameAspectRatio,
  };
}

/** Làm tròn width về bội số STEP trong khoảng [MIN, MAX]. */
export function snapWidth(percent: number): number {
  const clamped = Math.min(IMAGE_WIDTH_MAX, Math.max(IMAGE_WIDTH_MIN, percent));
  return Math.round(clamped / IMAGE_WIDTH_STEP) * IMAGE_WIDTH_STEP;
}

export function hasCrossedDragThreshold(deltaX: number, deltaY: number): boolean {
  return Math.hypot(deltaX, deltaY) > DRAG_THRESHOLD_PX;
}

export interface ResizeWidthInput {
  startWidthPx: number;
  parentWidthPx: number;
  deltaX: number;
  deltaY: number;
  handle: ResizeHandle;
  aspect: number;
}

/** Tính % width mới (đã clamp [MIN, MAX], chưa snap) từ thao tác kéo handle. */
export function computeResizeWidthPercent({
  startWidthPx,
  parentWidthPx,
  deltaX,
  deltaY,
  handle,
  aspect,
}: ResizeWidthInput): number {
  let widthDeltaPx = 0;

  if (handle === 'e' || handle === 'w') {
    widthDeltaPx = handle === 'e' ? deltaX : -deltaX;
  } else if (handle === 'n' || handle === 's') {
    const heightDeltaPx = handle === 's' ? deltaY : -deltaY;
    widthDeltaPx = heightDeltaPx * aspect;
  } else {
    const fromX = handle.includes('e') ? deltaX : handle.includes('w') ? -deltaX : 0;
    const fromY = handle.includes('s') ? deltaY : handle.includes('n') ? -deltaY : 0;
    widthDeltaPx = Math.abs(fromX) >= Math.abs(fromY * aspect) ? fromX : fromY * aspect;
  }

  const safeParent = parentWidthPx > 0 ? parentWidthPx : 1;
  const newWidthPx = Math.max(MIN_DRAG_WIDTH_PX, startWidthPx + widthDeltaPx);
  const rawPercent = (newWidthPx / safeParent) * 100;
  return Math.min(IMAGE_WIDTH_MAX, Math.max(IMAGE_WIDTH_MIN, rawPercent));
}
