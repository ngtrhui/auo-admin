'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getCropImageValidationCode } from '@/constants/file-upload';
import type { ImageCropPreset } from '@/constants/image-crop-presets';
import { showToast } from '@/components/ui/Toaster';
import {
  EDIT_MAX_DIMENSION,
  prepareImageForEditing,
  WEBP_EXPORT_QUALITY,
} from '@/utils/compressImage';
import {
  applyResizeCorner,
  applyResizeCornerFree,
  applyResizeEdgeFree,
  clampCropOffset,
  clampCropRectSize,
  clampCropRectSizeFree,
  clampPanForCoverZoom,
  computeEffectiveLayout,
  computeNormalizedCropRect,
  cropCanvasToWebpFile,
  defaultCropRectForLayout,
  defaultCropRectForLayoutFree,
  fitCropToLayout,
  fitCropToLayoutFree,
  heightForWidth,
  isFullCropRect,
  marqueePreviewRectFree,
  MAX_ZOOM,
  MIN_ZOOM,
  normalizedCropToStageRect,
  paintCropPreview,
  paintCropPreviewDynamic,
  pointInRect,
  type CoverLayout,
  type CropOffset,
  type CropRect,
  type CropRectNormalized,
  type ResizeCorner,
  type ResizeEdge,
  widthForHeight,
} from '@/utils/imageCrop/cropLayout';

type MoveDrag = {
  kind: 'move';
  pointerId: number;
  startOffset: CropOffset;
  startX: number;
  startY: number;
};

type ResizeDrag =
  | {
      kind: 'resize';
      pointerId: number;
      mode: 'corner';
      corner: ResizeCorner;
      startCropOffset: CropOffset;
      startRect: CropRect;
    }
  | {
      kind: 'resize';
      pointerId: number;
      mode: 'edge';
      edge: ResizeEdge;
      startCropOffset: CropOffset;
      startRect: CropRect;
    };

type MarqueeDrag = {
  kind: 'marquee';
  pointerId: number;
  startX: number;
  startY: number;
};

type PanDrag = {
  kind: 'pan';
  pointerId: number;
  startPan: CropOffset;
  startX: number;
  startY: number;
};

type ActiveDrag = MoveDrag | ResizeDrag | MarqueeDrag | PanDrag;

export type UseAspectImageCropOptions = {
  preset: ImageCropPreset;
  aspect?: { w: number; h: number } | null;
  initialCropRect?: CropRectNormalized | null;
};

function resolveAspectOption(
  preset: ImageCropPreset,
  aspect?: { w: number; h: number } | null,
): { w: number; h: number } | null {
  if (aspect !== undefined) return aspect;
  if (preset.id === 'editor') return null;
  return preset.aspect;
}

const CORNER_DRAG_CURSORS: Record<ResizeCorner, string> = {
  nw: 'nwse-resize',
  ne: 'nesw-resize',
  se: 'nwse-resize',
  sw: 'nesw-resize',
};

const EDGE_DRAG_CURSORS: Record<ResizeEdge, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
};

function setDocumentDragCursor(cursor: string | null) {
  document.body.style.cursor = cursor ?? '';
}

export function useAspectImageCrop({
  preset,
  aspect: aspectOption,
  initialCropRect = null,
}: UseAspectImageCropOptions) {
  const lockedAspect = resolveAspectOption(preset, aspectOption);
  const isFreeAspect = lockedAspect === null;
  const aw = lockedAspect?.w ?? 1;
  const ah = lockedAspect?.h ?? 1;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const pickGenerationRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewPaintRafRef = useRef<number | null>(null);
  const lastImageKeyRef = useRef<string | null>(null);
  const prevContainSigRef = useRef<string | null>(null);
  const zoomRef = useRef(1);
  const imagePanRef = useRef({ x: 0, y: 0 });
  const activeDragRef = useRef<ActiveDrag | null>(null);
  const effectiveLayoutRef = useRef<CoverLayout | null>(null);
  const cropRectClampedRef = useRef<CropRect | null>(null);
  const cropOffsetRef = useRef<CropOffset>({ x: 0, y: 0 });
  const cropRectRef = useRef<CropRect | null>(null);
  const marqueePreviewRef = useRef<(CropOffset & CropRect) | null>(null);
  const pendingInitialCropRef = useRef<CropRectNormalized | null>(
    initialCropRect && !isFullCropRect(initialCropRect) ? initialCropRect : null,
  );

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [cropOffset, setCropOffset] = useState<CropOffset>({ x: 0, y: 0 });
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [marqueeDrag, setMarqueeDrag] = useState<MarqueeDrag | null>(null);
  const [marqueePreview, setMarqueePreview] = useState<(CropOffset & CropRect) | null>(null);
  const [cropImgReady, setCropImgReady] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [markedRemoved, setMarkedRemoved] = useState(false);

  const containLayout = useMemo((): CoverLayout | null => {
    if (!naturalSize || stageSize.w <= 0 || stageSize.h <= 0) return null;
    const W = stageSize.w;
    const H = stageSize.h;
    const nw = naturalSize.w;
    const nh = naturalSize.h;
    const scale = Math.min(W / nw, H / nh);
    const drawW = nw * scale;
    const drawH = nh * scale;
    return {
      W,
      H,
      offsetX: (W - drawW) / 2,
      offsetY: (H - drawH) / 2,
      drawW,
      drawH,
    };
  }, [naturalSize, stageSize.w, stageSize.h]);

  const effectiveLayout = useMemo(() => {
    if (!containLayout) return null;
    const pan = zoom <= MIN_ZOOM ? { x: 0, y: 0 } : imagePan;
    return computeEffectiveLayout(containLayout, zoom, pan);
  }, [containLayout, zoom, imagePan]);

  const cropRectClamped = useMemo(() => {
    if (!effectiveLayout || !cropRect) return null;
    return isFreeAspect
      ? clampCropRectSizeFree(cropRect, effectiveLayout)
      : clampCropRectSize(cropRect, effectiveLayout, aw, ah);
  }, [effectiveLayout, cropRect, isFreeAspect, aw, ah]);

  useEffect(() => {
    marqueePreviewRef.current = marqueePreview;
    zoomRef.current = zoom;
    imagePanRef.current = imagePan;
    effectiveLayoutRef.current = effectiveLayout;
    cropRectClampedRef.current = cropRectClamped;
    cropOffsetRef.current = cropOffset;
    cropRectRef.current = cropRect;
  }, [marqueePreview, zoom, imagePan, effectiveLayout, cropRectClamped, cropOffset, cropRect]);

  useEffect(() => {
    if (!containLayout) return;
    setImagePan((p) => {
      const c = clampPanForCoverZoom(containLayout, zoomRef.current, p);
      if (c.x === p.x && c.y === p.y) return p;
      return c;
    });
  }, [containLayout]);

  const revokeBlob = useCallback((url: string | null) => {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  }, []);

  const resetEditor = useCallback(() => {
    pickGenerationRef.current += 1;
    lastImageKeyRef.current = null;
    prevContainSigRef.current = null;
    setImageSrc((prev) => {
      revokeBlob(prev);
      return null;
    });
    setNaturalSize(null);
    setStageSize({ w: 0, h: 0 });
    setZoom(1);
    setImagePan({ x: 0, y: 0 });
    setCropOffset({ x: 0, y: 0 });
    setCropRect(null);
    activeDragRef.current = null;
    setMarqueeDrag(null);
    setMarqueePreview(null);
    setIsDragOver(false);
    setCropImgReady(false);
    setIsCompressing(false);
    setMarkedRemoved(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (previewCanvasRef.current) {
      const pc = previewCanvasRef.current;
      const pctx = pc.getContext('2d');
      pctx?.clearRect(0, 0, pc.width, pc.height);
    }
  }, [revokeBlob]);

  const applyLoadedImage = useCallback(
    (url: string, width: number, height: number, gen: number) => {
      if (pickGenerationRef.current !== gen) {
        revokeBlob(url.startsWith('blob:') ? url : null);
        return;
      }
      setNaturalSize({ w: width, h: height });
      setImageSrc(url);
      setIsCompressing(false);
    },
    [revokeBlob],
  );

  const loadImageFromUrl = useCallback(
    (url: string) => {
      if (!url.trim()) return;
      setCropImgReady(false);
      setIsCompressing(true);
      const gen = ++pickGenerationRef.current;
      const loader = new window.Image();
      loader.crossOrigin = 'anonymous';
      loader.onload = () => {
        applyLoadedImage(url, loader.naturalWidth, loader.naturalHeight, gen);
      };
      loader.onerror = () => {
        if (pickGenerationRef.current === gen) {
          setIsCompressing(false);
          showToast('error', 'Không tải được ảnh để cắt');
        }
      };
      loader.src = url;
    },
    [applyLoadedImage],
  );

  useEffect(() => {
    const el = stageRef.current;
    if (!el || !imageSrc) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setStageSize({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    setStageSize({ w: r.width, h: r.height });
    return () => ro.disconnect();
  }, [imageSrc]);

  useEffect(() => {
    if (!containLayout || !imageSrc) return;
    const sig = `${Math.round(containLayout.W)}|${Math.round(containLayout.H)}|${Math.round(containLayout.drawW)}|${Math.round(containLayout.drawH)}`;

    if (lastImageKeyRef.current !== imageSrc) {
      lastImageKeyRef.current = imageSrc;
      prevContainSigRef.current = sig;
      setZoom(1);
      setImagePan({ x: 0, y: 0 });
      const eff0 = computeEffectiveLayout(containLayout, 1, { x: 0, y: 0 });
      const pendingCrop = pendingInitialCropRef.current;
      if (pendingCrop && naturalSize) {
        const staged = normalizedCropToStageRect(pendingCrop, eff0, naturalSize);
        const rect = isFreeAspect
          ? clampCropRectSizeFree(staged.rect, eff0)
          : clampCropRectSize(staged.rect, eff0, aw, ah);
        const offset = clampCropOffset(staged.offset, eff0, rect);
        setCropRect(rect);
        setCropOffset(offset);
        pendingInitialCropRef.current = null;
      } else {
        const rect0 = isFreeAspect
          ? defaultCropRectForLayoutFree(eff0, preset.displayTargetW)
          : defaultCropRectForLayout(eff0, aw, ah, preset.displayTargetW);
        setCropRect(rect0);
        const cx = eff0.offsetX + (eff0.drawW - rect0.w) / 2;
        const cy = eff0.offsetY + (eff0.drawH - rect0.h) / 2;
        setCropOffset(clampCropOffset({ x: cx, y: cy }, eff0, rect0));
      }
      return;
    }

    if (prevContainSigRef.current === sig) return;
    prevContainSigRef.current = sig;
    const eff = computeEffectiveLayout(containLayout, zoomRef.current, imagePanRef.current);
    setCropRect((prev) => {
      const baseRect =
        prev ??
        (isFreeAspect
          ? defaultCropRectForLayoutFree(eff, preset.displayTargetW)
          : defaultCropRectForLayout(eff, aw, ah, preset.displayTargetW));
      const rect = isFreeAspect
        ? clampCropRectSizeFree(baseRect, eff)
        : clampCropRectSize(baseRect, eff, aw, ah);
      setCropOffset((po) => clampCropOffset(po, eff, rect));
      return rect;
    });
  }, [imageSrc, containLayout, isFreeAspect, aw, ah, preset.displayTargetW, naturalSize]);

  useEffect(() => {
    pendingInitialCropRef.current =
      initialCropRect && !isFullCropRect(initialCropRect) ? initialCropRect : null;
  }, [initialCropRect, imageSrc]);

  useEffect(() => {
    if (!effectiveLayout || !cropRectRef.current || !imageSrc) return;
    if (lastImageKeyRef.current !== imageSrc) return;
    const fitted = isFreeAspect
      ? fitCropToLayoutFree(cropOffsetRef.current, cropRectRef.current, effectiveLayout)
      : fitCropToLayout(cropOffsetRef.current, cropRectRef.current, effectiveLayout, aw, ah);
    const cur = cropOffsetRef.current;
    const rect = cropRectRef.current;
    const offsetChanged =
      Math.abs(fitted.offset.x - cur.x) > 0.5 || Math.abs(fitted.offset.y - cur.y) > 0.5;
    const rectChanged = fitted.rect.w !== rect.w || fitted.rect.h !== rect.h;
    if (!offsetChanged && !rectChanged) return;
    setCropRect(fitted.rect);
    setCropOffset(fitted.offset);
  }, [zoom, imagePan, effectiveLayout, imageSrc, isFreeAspect, aw, ah]);

  useEffect(() => {
    if (!effectiveLayout || !cropRectRef.current) return;
    const fitted = isFreeAspect
      ? fitCropToLayoutFree(cropOffsetRef.current, cropRectRef.current, effectiveLayout)
      : fitCropToLayout(cropOffsetRef.current, cropRectRef.current, effectiveLayout, aw, ah);
    setCropRect(fitted.rect);
    setCropOffset(fitted.offset);
  }, [isFreeAspect, aw, ah, effectiveLayout]);

  useEffect(() => {
    if (
      !cropImgReady ||
      !effectiveLayout ||
      !cropRectClamped ||
      !naturalSize ||
      !imageSrc ||
      !imgRef.current
    ) {
      return;
    }
    const img = imgRef.current;
    if (!img.complete || img.naturalWidth === 0) return;

    const paint = () => {
      previewPaintRafRef.current = null;
      const c = previewCanvasRef.current;
      const el = imgRef.current;
      if (
        !c ||
        !el ||
        !el.complete ||
        el.naturalWidth === 0 ||
        !effectiveLayout ||
        !cropRectClamped
      ) {
        return;
      }
      if (isFreeAspect || preset.id === 'editor') {
        paintCropPreviewDynamic(
          c,
          el,
          effectiveLayout,
          cropOffset,
          cropRectClamped,
          naturalSize,
          EDIT_MAX_DIMENSION,
        );
      } else {
        paintCropPreview(
          c,
          el,
          effectiveLayout,
          cropOffset,
          cropRectClamped,
          naturalSize,
          preset.output.w,
          preset.output.h,
        );
      }
    };

    if (previewPaintRafRef.current !== null) {
      cancelAnimationFrame(previewPaintRafRef.current);
    }
    previewPaintRafRef.current = requestAnimationFrame(paint);
    return () => {
      if (previewPaintRafRef.current !== null) {
        cancelAnimationFrame(previewPaintRafRef.current);
      }
    };
  }, [
    cropOffset,
    effectiveLayout,
    cropRectClamped,
    naturalSize,
    imageSrc,
    cropImgReady,
    isFreeAspect,
    preset.id,
    preset.output.w,
    preset.output.h,
  ]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || !imageSrc || !containLayout) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const factor = Math.exp(-e.deltaY * 0.0015);
      setZoom((zPrev) => {
        const zOld = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zPrev));
        const zNew = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zOld * factor));
        if (Math.abs(zNew - zOld) < 1e-6) return zOld;
        if (zNew <= MIN_ZOOM) {
          setImagePan({ x: 0, y: 0 });
          return zNew;
        }
        setImagePan((panPrev) => {
          const effOld = computeEffectiveLayout(containLayout, zOld, panPrev);
          const fx = Math.min(1, Math.max(0, (sx - effOld.offsetX) / effOld.drawW));
          const fy = Math.min(1, Math.max(0, (sy - effOld.offsetY) / effOld.drawH));
          const eDrawW = containLayout.drawW * zNew;
          const eDrawH = containLayout.drawH * zNew;
          const cx = containLayout.offsetX + containLayout.drawW / 2;
          const cy = containLayout.offsetY + containLayout.drawH / 2;
          const raw = {
            x: sx - fx * eDrawW - cx + eDrawW / 2,
            y: sy - fy * eDrawH - cy + eDrawH / 2,
          };
          return clampPanForCoverZoom(containLayout, zNew, raw);
        });
        return zNew;
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [imageSrc, containLayout]);

  const stageLocalFromClient = useCallback((clientX: number, clientY: number) => {
    const el = stageRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  }, []);

  const onPickFile = useCallback(
    (raw: File | undefined) => {
      if (!raw || !raw.type.startsWith('image/')) return;
      const code = getCropImageValidationCode(raw);
      if (code) {
        showToast(
          'error',
          code === 'maxSize'
            ? 'Ảnh vượt quá 20 MB'
            : 'Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP.',
        );
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setCropImgReady(false);
      setImageSrc((prev) => {
        revokeBlob(prev);
        return null;
      });
      setNaturalSize(null);
      setIsCompressing(true);
      const gen = ++pickGenerationRef.current;

      void (async () => {
        let working = raw;
        try {
          working = await prepareImageForEditing(raw);
        } catch {
          /* use original */
        } finally {
          if (pickGenerationRef.current === gen) setIsCompressing(false);
        }
        if (pickGenerationRef.current !== gen) return;

        const url = URL.createObjectURL(working);
        const loader = new window.Image();
        loader.onload = () => {
          applyLoadedImage(url, loader.naturalWidth, loader.naturalHeight, gen);
        };
        loader.onerror = () => revokeBlob(url);
        loader.src = url;
      })();
    },
    [applyLoadedImage, revokeBlob],
  );

  const beginPanDrag = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      if (!containLayout || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      stageRef.current?.setPointerCapture(e.pointerId);
      activeDragRef.current = {
        kind: 'pan',
        pointerId: e.pointerId,
        startPan: { ...imagePanRef.current },
        startX: e.clientX,
        startY: e.clientY,
      };
    },
    [containLayout],
  );

  const onCropMovePointerDown = (e: React.PointerEvent) => {
    const layout = effectiveLayoutRef.current;
    const rect = cropRectClampedRef.current;
    if (!layout || !rect || e.altKey || activeDragRef.current) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    activeDragRef.current = {
      kind: 'move',
      pointerId: e.pointerId,
      startOffset: { ...cropOffset },
      startX: e.clientX,
      startY: e.clientY,
    };
  };

  const onResizeCornerPointerDown = (e: React.PointerEvent, corner: ResizeCorner) => {
    const layout = effectiveLayoutRef.current;
    const rect = cropRectClampedRef.current;
    if (!layout || !rect || e.altKey) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    activeDragRef.current = {
      kind: 'resize',
      pointerId: e.pointerId,
      mode: 'corner',
      corner,
      startCropOffset: { ...cropOffset },
      startRect: { ...rect },
    };
    setDocumentDragCursor(CORNER_DRAG_CURSORS[corner]);
  };

  const onResizeEdgePointerDown = (e: React.PointerEvent, edge: ResizeEdge) => {
    const layout = effectiveLayoutRef.current;
    const rect = cropRectClampedRef.current;
    if (!layout || !rect || e.altKey || !isFreeAspect) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    activeDragRef.current = {
      kind: 'resize',
      pointerId: e.pointerId,
      mode: 'edge',
      edge,
      startCropOffset: { ...cropOffset },
      startRect: { ...rect },
    };
    setDocumentDragCursor(EDGE_DRAG_CURSORS[edge]);
  };

  const onShadePointerDown = (e: React.PointerEvent) => {
    if (!effectiveLayoutRef.current || !stageRef.current) return;
    if (e.button !== 0) return;
    if (e.altKey) {
      beginPanDrag(e);
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    stageRef.current.setPointerCapture(e.pointerId);
    const { x, y } = stageLocalFromClient(e.clientX, e.clientY);
    const drag: MarqueeDrag = { kind: 'marquee', pointerId: e.pointerId, startX: x, startY: y };
    activeDragRef.current = drag;
    setMarqueeDrag(drag);
    setMarqueePreview({ x, y, w: 0, h: 0 });
  };

  const onStagePointerDownCapture = (e: React.PointerEvent) => {
    const layout = effectiveLayoutRef.current;
    const rect = cropRectClampedRef.current;
    if (!layout || !rect || e.button !== 0) return;

    const target = e.target as HTMLElement;
    const onCropUi =
      target.closest('[data-crop-frame]') !== null || target.closest('[data-crop-handle]') !== null;
    const onShadeUi = target.closest('[data-crop-shade]') !== null;
    if (onCropUi) {
      if (e.altKey) beginPanDrag(e);
      return;
    }
    if (onShadeUi) return;

    const { x, y } = stageLocalFromClient(e.clientX, e.clientY);
    const inImg = pointInRect(x, y, layout.offsetX, layout.offsetY, layout.drawW, layout.drawH);
    if (e.altKey && inImg) {
      beginPanDrag(e);
      return;
    }
    const letterboxPan = zoomRef.current > MIN_ZOOM && !inImg && target === stageRef.current;
    if (letterboxPan) beginPanDrag(e);
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = activeDragRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;
      const layout = effectiveLayoutRef.current;
      const rect = cropRectClampedRef.current;

      if (drag.kind === 'move' && layout && rect) {
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        setCropOffset(
          clampCropOffset({ x: drag.startOffset.x + dx, y: drag.startOffset.y + dy }, layout, rect),
        );
        return;
      }

      if (drag.kind === 'resize' && layout) {
        const { x: sx, y: sy } = stageLocalFromClient(e.clientX, e.clientY);
        const applied =
          drag.mode === 'edge' && isFreeAspect
            ? applyResizeEdgeFree(
                drag.edge,
                sx,
                sy,
                layout,
                drag.startCropOffset.x,
                drag.startCropOffset.y,
                drag.startRect,
              )
            : drag.mode === 'corner'
              ? isFreeAspect
                ? applyResizeCornerFree(
                    drag.corner,
                    sx,
                    sy,
                    layout,
                    drag.startCropOffset.x,
                    drag.startCropOffset.y,
                    drag.startRect,
                  )
                : applyResizeCorner(
                    drag.corner,
                    sx,
                    sy,
                    layout,
                    drag.startCropOffset.x,
                    drag.startCropOffset.y,
                    drag.startRect,
                    aw,
                    ah,
                  )
              : null;
        if (applied) {
          setCropOffset(applied.offset);
          setCropRect(applied.rect);
        }
        return;
      }

      if (drag.kind === 'marquee' && layout) {
        const { x: cx, y: cy } = stageLocalFromClient(e.clientX, e.clientY);
        if (isFreeAspect) {
          setMarqueePreview(marqueePreviewRectFree(drag.startX, drag.startY, cx, cy, layout));
        } else {
          const dx = cx - drag.startX;
          const dy = cy - drag.startY;
          let w = Math.abs(dx);
          let h = heightForWidth(w, aw, ah);
          if (Math.abs(dy) > h) {
            h = Math.abs(dy);
            w = widthForHeight(h, aw, ah);
          }
          const x = dx >= 0 ? drag.startX : drag.startX - w;
          const y = dy >= 0 ? drag.startY : drag.startY - h;
          const cropR = clampCropRectSize({ w, h }, layout, aw, ah);
          const ox = clampCropOffset({ x, y }, layout, cropR);
          setMarqueePreview({ ...ox, ...cropR });
        }
        return;
      }

      if (drag.kind === 'pan' && containLayout) {
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        setImagePan(
          clampPanForCoverZoom(containLayout, zoomRef.current, {
            x: drag.startPan.x + dx,
            y: drag.startPan.y + dy,
          }),
        );
      }
    };

    const onUp = (e: PointerEvent) => {
      const drag = activeDragRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;
      if (drag.kind === 'marquee') {
        const layout = effectiveLayoutRef.current;
        const mp = marqueePreviewRef.current;
        if (layout && mp && mp.w >= preset.minMarqueeW && mp.h >= preset.minMarqueeH) {
          const cropR = isFreeAspect
            ? clampCropRectSizeFree({ w: mp.w, h: mp.h }, layout)
            : clampCropRectSize({ w: mp.w, h: mp.h }, layout, aw, ah);
          setCropRect(cropR);
          setCropOffset(clampCropOffset({ x: mp.x, y: mp.y }, layout, cropR));
        }
        setMarqueeDrag(null);
        setMarqueePreview(null);
      }
      activeDragRef.current = null;
      setDocumentDragCursor(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      setDocumentDragCursor(null);
    };
  }, [
    containLayout,
    stageLocalFromClient,
    isFreeAspect,
    aw,
    ah,
    preset.minMarqueeW,
    preset.minMarqueeH,
  ]);

  const displayCrop = marqueePreview
    ? marqueePreview
    : cropRectClamped
      ? { ...cropOffset, w: cropRectClamped.w, h: cropRectClamped.h }
      : null;

  const exportWebpFile = useCallback(async () => {
    if (!previewCanvasRef.current) return null;
    return cropCanvasToWebpFile(
      previewCanvasRef.current,
      preset.exportFileName,
      WEBP_EXPORT_QUALITY,
    );
  }, [preset.exportFileName]);

  const exportCropRectNormalized = useCallback((): CropRectNormalized | null => {
    if (!effectiveLayout || !cropRectClamped || !naturalSize) return null;
    return computeNormalizedCropRect(effectiveLayout, cropOffset, cropRectClamped, naturalSize);
  }, [effectiveLayout, cropOffset, cropRectClamped, naturalSize]);

  const onImageLoad = useCallback(() => {
    setCropImgReady(true);
  }, []);

  return {
    fileInputRef,
    imgRef,
    stageRef,
    previewCanvasRef,
    imageSrc,
    isCompressing,
    isDragOver,
    cropImgReady,
    effectiveLayout,
    cropRectClamped,
    displayCrop,
    marqueeDrag,
    markedRemoved,
    setMarkedRemoved,
    resetEditor,
    onPickFile,
    onImageLoad,
    setIsDragOver,
    onCropMovePointerDown,
    onResizeCornerPointerDown,
    onResizeEdgePointerDown,
    onShadePointerDown,
    onStagePointerDownCapture,
    exportWebpFile,
    exportCropRectNormalized,
    loadImageFromUrl,
    naturalSize,
    isFreeAspect,
  };
}
