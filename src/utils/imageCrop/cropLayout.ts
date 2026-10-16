export type CoverLayout = {
  W: number;
  H: number;
  offsetX: number;
  offsetY: number;
  drawW: number;
  drawH: number;
};

export type CropRect = { w: number; h: number };

export type CropOffset = { x: number; y: number };

export const AVATAR_CROP_ASPECT = { w: 1, h: 1 };
export const AVATAR_CROP_OUTPUT = { w: 512, h: 512 };

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
export const MIN_CROP_W = 72;
const IMG_EDGE_BLEED_PX = 1;

export function aspectRatio(aw = AVATAR_CROP_ASPECT.w, ah = AVATAR_CROP_ASPECT.h): number {
  return aw / ah;
}

export function heightForWidth(
  w: number,
  aw = AVATAR_CROP_ASPECT.w,
  ah = AVATAR_CROP_ASPECT.h,
): number {
  return (w * ah) / aw;
}

export function widthForHeight(
  h: number,
  aw = AVATAR_CROP_ASPECT.w,
  ah = AVATAR_CROP_ASPECT.h,
): number {
  return (h * aw) / ah;
}

export function computeEffectiveLayout(
  base: CoverLayout,
  zoom: number,
  pan: CropOffset,
): CoverLayout {
  const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
  const { W, H, offsetX, offsetY, drawW, drawH } = base;
  const cx = offsetX + drawW / 2;
  const cy = offsetY + drawH / 2;
  const eDrawW = drawW * z;
  const eDrawH = drawH * z;
  return {
    W,
    H,
    offsetX: cx - eDrawW / 2 + pan.x,
    offsetY: cy - eDrawH / 2 + pan.y,
    drawW: eDrawW,
    drawH: eDrawH,
  };
}

export function imageLayerBox(eff: CoverLayout) {
  const b = IMG_EDGE_BLEED_PX;
  return {
    left: eff.offsetX - b * 0.5,
    top: eff.offsetY - b * 0.5,
    width: eff.drawW + b,
    height: eff.drawH + b,
  };
}

export function clampPanForCoverZoom(base: CoverLayout, zoom: number, pan: CropOffset): CropOffset {
  const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
  const { W, H, offsetX, offsetY, drawW, drawH } = base;
  const cx = offsetX + drawW / 2;
  const cy = offsetY + drawH / 2;
  const eW = drawW * z;
  const eH = drawH * z;
  const minPanX = W - cx - eW / 2;
  const maxPanX = eW / 2 - cx;
  const minPanY = H - cy - eH / 2;
  const maxPanY = eH / 2 - cy;
  const x =
    minPanX <= maxPanX ? Math.min(maxPanX, Math.max(minPanX, pan.x)) : (minPanX + maxPanX) / 2;
  const y =
    minPanY <= maxPanY ? Math.min(maxPanY, Math.max(minPanY, pan.y)) : (minPanY + maxPanY) / 2;
  return { x, y };
}

function imageBoundsInStage(layout: CoverLayout) {
  const { W, H, offsetX, offsetY, drawW, drawH } = layout;
  return {
    minX: Math.max(0, offsetX),
    minY: Math.max(0, offsetY),
    maxX: Math.min(W, offsetX + drawW),
    maxY: Math.min(H, offsetY + drawH),
  };
}

export function maxCropRectForLayout(
  layout: CoverLayout,
  aw = AVATAR_CROP_ASPECT.w,
  ah = AVATAR_CROP_ASPECT.h,
): CropRect {
  const b = imageBoundsInStage(layout);
  const availW = b.maxX - b.minX;
  const availH = b.maxY - b.minY;
  let w = availW;
  let h = heightForWidth(w, aw, ah);
  if (h > availH) {
    h = availH;
    w = widthForHeight(h, aw, ah);
  }
  return { w: Math.floor(w), h: Math.floor(h) };
}

export function clampCropRectSize(
  rect: CropRect,
  layout: CoverLayout,
  aw = AVATAR_CROP_ASPECT.w,
  ah = AVATAR_CROP_ASPECT.h,
): CropRect {
  const maxR = maxCropRectForLayout(layout, aw, ah);
  let w = Math.min(rect.w, maxR.w);
  let h = heightForWidth(w, aw, ah);
  if (h > maxR.h) {
    h = maxR.h;
    w = widthForHeight(h, aw, ah);
  }
  const minH = heightForWidth(MIN_CROP_W, aw, ah);
  w = Math.max(MIN_CROP_W, Math.floor(w));
  h = Math.max(Math.floor(minH), Math.floor(h));
  if (w > maxR.w || h > maxR.h) {
    return maxR;
  }
  return { w, h };
}

export function defaultCropRectForLayout(
  layout: CoverLayout,
  aw = AVATAR_CROP_ASPECT.w,
  ah = AVATAR_CROP_ASPECT.h,
  displayTargetW = 172,
): CropRect {
  const maxR = maxCropRectForLayout(layout, aw, ah);
  let w = Math.min(displayTargetW, maxR.w);
  let h = Math.floor(heightForWidth(w, aw, ah));
  if (h > maxR.h) {
    h = maxR.h;
    w = Math.floor(widthForHeight(h, aw, ah));
  }
  return clampCropRectSize({ w, h }, layout, aw, ah);
}

export function clampCropOffset(pos: CropOffset, layout: CoverLayout, rect: CropRect): CropOffset {
  const b = imageBoundsInStage(layout);
  const minX = b.minX;
  const minY = b.minY;
  const maxX = b.maxX - rect.w;
  const maxY = b.maxY - rect.h;
  return {
    x: Math.min(Math.max(minX, pos.x), Math.max(minX, maxX)),
    y: Math.min(Math.max(minY, pos.y), Math.max(minY, maxY)),
  };
}

export function fitCropToLayout(
  offset: CropOffset,
  rect: CropRect,
  layout: CoverLayout,
  aw = AVATAR_CROP_ASPECT.w,
  ah = AVATAR_CROP_ASPECT.h,
): { offset: CropOffset; rect: CropRect } {
  const rect2 = clampCropRectSize(rect, layout, aw, ah);
  const offset2 = clampCropOffset(offset, layout, rect2);
  return { offset: offset2, rect: rect2 };
}

export function maxCropRectForLayoutFree(layout: CoverLayout): CropRect {
  const b = imageBoundsInStage(layout);
  return {
    w: Math.floor(b.maxX - b.minX),
    h: Math.floor(b.maxY - b.minY),
  };
}

export function clampCropRectSizeFree(rect: CropRect, layout: CoverLayout): CropRect {
  const maxR = maxCropRectForLayoutFree(layout);
  let w = Math.min(Math.max(MIN_CROP_W, Math.floor(rect.w)), maxR.w);
  let h = Math.min(Math.max(MIN_CROP_W, Math.floor(rect.h)), maxR.h);
  if (w > maxR.w) w = maxR.w;
  if (h > maxR.h) h = maxR.h;
  return { w, h };
}

export function defaultCropRectForLayoutFree(layout: CoverLayout, displayTargetW = 280): CropRect {
  const maxR = maxCropRectForLayoutFree(layout);
  const w = Math.min(displayTargetW, maxR.w);
  const h = Math.min(Math.floor((w / maxR.w) * maxR.h), maxR.h);
  return clampCropRectSizeFree({ w, h: Math.max(h, MIN_CROP_W) }, layout);
}

export function fitCropToLayoutFree(
  offset: CropOffset,
  rect: CropRect,
  layout: CoverLayout,
): { offset: CropOffset; rect: CropRect } {
  const rect2 = clampCropRectSizeFree(rect, layout);
  const offset2 = clampCropOffset(offset, layout, rect2);
  return { offset: offset2, rect: rect2 };
}

export function marqueePreviewRectFree(
  startX: number,
  startY: number,
  pointerX: number,
  pointerY: number,
  layout: CoverLayout,
): CropOffset & CropRect {
  const dx = pointerX - startX;
  const dy = pointerY - startY;
  const w = Math.abs(dx);
  const h = Math.abs(dy);
  const x = dx >= 0 ? startX : startX - w;
  const y = dy >= 0 ? startY : startY - h;
  const cropR = clampCropRectSizeFree({ w: Math.max(w, 1), h: Math.max(h, 1) }, layout);
  const offset = clampCropOffset({ x, y }, layout, cropR);
  return { ...offset, ...cropR };
}

export function applyResizeCornerFree(
  corner: ResizeCorner,
  sx: number,
  sy: number,
  layout: CoverLayout,
  ox: number,
  oy: number,
  cur: CropRect,
): { offset: CropOffset; rect: CropRect } | null {
  let w = cur.w;
  let h = cur.h;
  let newOx = ox;
  let newOy = oy;

  switch (corner) {
    case 'se':
      w = Math.max(MIN_CROP_W, sx - ox);
      h = Math.max(MIN_CROP_W, sy - oy);
      break;
    case 'nw': {
      const brx = ox + cur.w;
      const bry = oy + cur.h;
      w = Math.max(MIN_CROP_W, brx - sx);
      h = Math.max(MIN_CROP_W, bry - sy);
      newOx = brx - w;
      newOy = bry - h;
      break;
    }
    case 'ne': {
      const bly = oy + cur.h;
      w = Math.max(MIN_CROP_W, sx - ox);
      h = Math.max(MIN_CROP_W, bly - sy);
      newOy = bly - h;
      break;
    }
    case 'sw': {
      const trx = ox + cur.w;
      w = Math.max(MIN_CROP_W, trx - sx);
      h = Math.max(MIN_CROP_W, sy - oy);
      newOx = trx - w;
      break;
    }
    default:
      break;
  }

  const rect = clampCropRectSizeFree({ w, h }, layout);
  const offset = clampCropOffset({ x: newOx, y: newOy }, layout, rect);
  return { offset, rect };
}

export function computeCropOutputPixels(
  layout: CoverLayout,
  cropOffset: CropOffset,
  cropRect: CropRect,
  naturalSize: { w: number; h: number },
  maxDimension = 2048,
): { w: number; h: number } {
  const nw = naturalSize.w;
  const nh = naturalSize.h;
  let nW = (cropRect.w / layout.drawW) * nw;
  let nH = (cropRect.h / layout.drawH) * nh;
  nW = Math.max(1, Math.floor(nW));
  nH = Math.max(1, Math.floor(nH));
  const maxEdge = Math.max(nW, nH);
  if (maxEdge > maxDimension) {
    const scale = maxDimension / maxEdge;
    nW = Math.max(1, Math.floor(nW * scale));
    nH = Math.max(1, Math.floor(nH * scale));
  }
  return { w: nW, h: nH };
}

export function paintCropPreviewDynamic(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  layout: CoverLayout,
  cropOffset: CropOffset,
  cropRect: CropRect,
  naturalSize: { w: number; h: number },
  maxDimension = 2048,
) {
  const { w: outW, h: outH } = computeCropOutputPixels(
    layout,
    cropOffset,
    cropRect,
    naturalSize,
    maxDimension,
  );
  if (canvas.width !== outW) canvas.width = outW;
  if (canvas.height !== outH) canvas.height = outH;
  paintCropPreview(canvas, img, layout, cropOffset, cropRect, naturalSize, outW, outH);
}

/** Marquee preview — raw size (no min clamp); cap max only. */
export function marqueePreviewRect(
  startX: number,
  startY: number,
  pointerX: number,
  pointerY: number,
  layout: CoverLayout,
  aw = AVATAR_CROP_ASPECT.w,
  ah = AVATAR_CROP_ASPECT.h,
): CropOffset & CropRect {
  const dx = pointerX - startX;
  const dy = pointerY - startY;
  let w = Math.abs(dx);
  let h = heightForWidth(w, aw, ah);
  if (Math.abs(dy) > h) {
    h = Math.abs(dy);
    w = widthForHeight(h, aw, ah);
  }
  const maxR = maxCropRectForLayout(layout, aw, ah);
  w = Math.min(w, maxR.w);
  h = Math.min(h, maxR.h);
  const x = dx >= 0 ? startX : startX - w;
  const y = dy >= 0 ? startY : startY - h;
  const offset = clampCropOffset({ x, y }, layout, { w: Math.max(w, 1), h: Math.max(h, 1) });
  return { ...offset, w, h };
}

export type ResizeCorner = 'nw' | 'ne' | 'sw' | 'se';

export type ResizeEdge = 'n' | 's' | 'e' | 'w';

export function applyResizeEdgeFree(
  edge: ResizeEdge,
  sx: number,
  sy: number,
  layout: CoverLayout,
  ox: number,
  oy: number,
  cur: CropRect,
): { offset: CropOffset; rect: CropRect } | null {
  let w = cur.w;
  let h = cur.h;
  let newOx = ox;
  let newOy = oy;

  switch (edge) {
    case 'e':
      w = Math.max(MIN_CROP_W, sx - ox);
      break;
    case 'w': {
      const brx = ox + cur.w;
      w = Math.max(MIN_CROP_W, brx - sx);
      newOx = brx - w;
      break;
    }
    case 's':
      h = Math.max(MIN_CROP_W, sy - oy);
      break;
    case 'n': {
      const bry = oy + cur.h;
      h = Math.max(MIN_CROP_W, bry - sy);
      newOy = bry - h;
      break;
    }
    default:
      break;
  }

  const rect = clampCropRectSizeFree({ w, h }, layout);
  const offset = clampCropOffset({ x: newOx, y: newOy }, layout, rect);
  return { offset, rect };
}

export function applyResizeCorner(
  corner: ResizeCorner,
  sx: number,
  sy: number,
  layout: CoverLayout,
  ox: number,
  oy: number,
  cur: CropRect,
  aw = AVATAR_CROP_ASPECT.w,
  ah = AVATAR_CROP_ASPECT.h,
): { offset: CropOffset; rect: CropRect } | null {
  let w = cur.w;
  let h = cur.h;
  let newOx = ox;
  let newOy = oy;

  const fitFromPointer = (px: number, py: number, anchorX: number, anchorY: number) => {
    const rawW = Math.abs(px - anchorX);
    const rawH = Math.abs(py - anchorY);
    let cw = rawW;
    let ch = heightForWidth(cw, aw, ah);
    if (ch > rawH) {
      ch = rawH;
      cw = widthForHeight(ch, aw, ah);
    }
    return { w: cw, h: ch };
  };

  switch (corner) {
    case 'se': {
      const f = fitFromPointer(sx, sy, ox, oy);
      w = f.w;
      h = f.h;
      newOx = ox;
      newOy = oy;
      break;
    }
    case 'nw': {
      const brx = ox + cur.w;
      const bry = oy + cur.h;
      const f = fitFromPointer(sx, sy, brx, bry);
      w = f.w;
      h = f.h;
      newOx = brx - w;
      newOy = bry - h;
      break;
    }
    case 'ne': {
      const blx = ox;
      const bly = oy + cur.h;
      const f = fitFromPointer(sx, sy, blx, bly);
      w = f.w;
      h = f.h;
      newOx = blx;
      newOy = bly - h;
      break;
    }
    case 'sw': {
      const trx = ox + cur.w;
      const topY = oy;
      const f = fitFromPointer(sx, sy, trx, topY);
      w = f.w;
      h = f.h;
      newOx = trx - w;
      newOy = topY;
      break;
    }
    default:
      break;
  }

  const rect = clampCropRectSize({ w, h }, layout, aw, ah);
  const offset = clampCropOffset({ x: newOx, y: newOy }, layout, rect);
  return { offset, rect };
}

export type CropRectNormalized = { x: number; y: number; w: number; h: number };

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

export function computeNormalizedCropRect(
  layout: CoverLayout,
  cropOffset: CropOffset,
  cropRect: CropRect,
  naturalSize: { w: number; h: number },
): CropRectNormalized {
  const nw = naturalSize.w;
  const nh = naturalSize.h;
  const nx = ((cropOffset.x - layout.offsetX) / layout.drawW) * nw;
  const ny = ((cropOffset.y - layout.offsetY) / layout.drawH) * nh;
  const nW = (cropRect.w / layout.drawW) * nw;
  const nH = (cropRect.h / layout.drawH) * nh;

  const x = clamp01(nx / nw);
  const y = clamp01(ny / nh);
  let w = clamp01(nW / nw);
  let h = clamp01(nH / nh);
  if (x + w > 1) w = Math.max(0, 1 - x);
  if (y + h > 1) h = Math.max(0, 1 - y);

  return { x, y, w, h };
}

export function normalizedCropToStageRect(
  crop: CropRectNormalized,
  layout: CoverLayout,
  naturalSize: { w: number; h: number },
): { offset: CropOffset; rect: CropRect } {
  const nx = crop.x * naturalSize.w;
  const ny = crop.y * naturalSize.h;
  const nW = crop.w * naturalSize.w;
  const nH = crop.h * naturalSize.h;
  const w = (nW / naturalSize.w) * layout.drawW;
  const h = (nH / naturalSize.h) * layout.drawH;
  const x = layout.offsetX + (nx / naturalSize.w) * layout.drawW;
  const y = layout.offsetY + (ny / naturalSize.h) * layout.drawH;
  return {
    offset: { x, y },
    rect: { w: Math.max(1, w), h: Math.max(1, h) },
  };
}

export function isFullCropRect(crop: CropRectNormalized | null | undefined): boolean {
  if (!crop) return true;
  return crop.x <= 0.001 && crop.y <= 0.001 && crop.w >= 0.999 && crop.h >= 0.999;
}

export function pointInRect(
  x: number,
  y: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): boolean {
  return x >= rx && y >= ry && x <= rx + rw && y <= ry + rh;
}

export function paintCropPreview(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  layout: CoverLayout,
  cropOffset: CropOffset,
  cropRect: CropRect,
  naturalSize: { w: number; h: number },
  outW = AVATAR_CROP_OUTPUT.w,
  outH = AVATAR_CROP_OUTPUT.h,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const nw = naturalSize.w;
  const nh = naturalSize.h;
  let nx0 = ((cropOffset.x - layout.offsetX) / layout.drawW) * nw;
  let ny0 = ((cropOffset.y - layout.offsetY) / layout.drawH) * nh;
  let nW = (cropRect.w / layout.drawW) * nw;
  let nH = (cropRect.h / layout.drawH) * nh;

  const x1 = Math.max(0, nx0);
  const y1 = Math.max(0, ny0);
  const x2 = Math.min(nw, nx0 + nW);
  const y2 = Math.min(nh, ny0 + nH);
  ctx.clearRect(0, 0, outW, outH);
  if (x2 <= x1 || y2 <= y1) return;
  nx0 = x1;
  ny0 = y1;
  nW = x2 - x1;
  nH = y2 - y1;
  ctx.drawImage(img, nx0, ny0, nW, nH, 0, 0, outW, outH);
}

export async function cropCanvasToWebpFile(
  canvas: HTMLCanvasElement,
  fileName = 'image.webp',
  quality = 0.75,
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
            type: 'image/webp',
            lastModified: Date.now(),
          }),
        );
      },
      'image/webp',
      quality,
    );
  });
}
