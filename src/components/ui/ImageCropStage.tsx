'use client';

import type { RefObject } from 'react';
import Loading from '@/components/ui/Loading';
import { cn } from '@/utils/classNames';
import {
  imageLayerBox,
  type CoverLayout,
  type CropRect,
  type ResizeCorner,
  type ResizeEdge,
} from '@/utils/imageCrop/cropLayout';

const CORNER_HANDLE_CLASS: Record<ResizeCorner, { box: string; cursor: string }> = {
  nw: {
    box: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2',
    cursor: 'cursor-nwse-resize',
  },
  ne: {
    box: 'right-0 top-0 translate-x-1/2 -translate-y-1/2',
    cursor: 'cursor-nesw-resize',
  },
  se: {
    box: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2',
    cursor: 'cursor-nwse-resize',
  },
  sw: {
    box: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2',
    cursor: 'cursor-nesw-resize',
  },
};

const EDGE_HIT_CLASS: Record<ResizeEdge, { box: string; cursor: string }> = {
  n: {
    box: 'left-3 right-3 top-0 h-3 -translate-y-1/2',
    cursor: 'cursor-ns-resize',
  },
  s: {
    box: 'left-3 right-3 bottom-0 h-3 translate-y-1/2',
    cursor: 'cursor-ns-resize',
  },
  e: {
    box: 'top-3 bottom-3 right-0 w-3 translate-x-1/2',
    cursor: 'cursor-ew-resize',
  },
  w: {
    box: 'top-3 bottom-3 left-0 w-3 -translate-x-1/2',
    cursor: 'cursor-ew-resize',
  },
};

const EDGE_MARKER_CLASS: Record<ResizeEdge, string> = {
  n: 'mx-auto mt-0.5 h-0.5 w-6',
  s: 'mx-auto mb-0.5 h-0.5 w-6',
  e: 'my-auto mr-0.5 h-6 w-0.5',
  w: 'my-auto ml-0.5 h-6 w-0.5',
};

const EDGE_HANDLE_DECOR = [
  'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2',
  'right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
  'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2',
  'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
] as const;

type MarqueeDrag = {
  kind: 'marquee';
  pointerId: number;
  startX: number;
  startY: number;
};

export type ImageCropStageProps = {
  stageRef: RefObject<HTMLDivElement | null>;
  imgRef: RefObject<HTMLImageElement | null>;
  stageClassName: string;
  imageSrc: string | null;
  cropImgReady: boolean;
  effectiveLayout: CoverLayout | null;
  cropRectClamped: CropRect | null;
  displayCrop: { x: number; y: number; w: number; h: number } | null;
  marqueeDrag: MarqueeDrag | null;
  showAvatarGrid?: boolean;
  allowFreeEdgeResize?: boolean;
  onStagePointerDownCapture: (e: React.PointerEvent) => void;
  onImageLoad: () => void;
  onShadePointerDown: (e: React.PointerEvent) => void;
  onCropMovePointerDown: (e: React.PointerEvent) => void;
  onResizeCornerPointerDown: (e: React.PointerEvent, corner: ResizeCorner) => void;
  onResizeEdgePointerDown?: (e: React.PointerEvent, edge: ResizeEdge) => void;
};

export default function ImageCropStage({
  stageRef,
  imgRef,
  stageClassName,
  imageSrc,
  cropImgReady,
  effectiveLayout,
  cropRectClamped,
  displayCrop,
  marqueeDrag,
  showAvatarGrid = false,
  allowFreeEdgeResize = false,
  onStagePointerDownCapture,
  onImageLoad,
  onShadePointerDown,
  onCropMovePointerDown,
  onResizeCornerPointerDown,
  onResizeEdgePointerDown,
}: ImageCropStageProps) {
  return (
    <div
      ref={stageRef}
      onPointerDownCapture={onStagePointerDownCapture}
      className={stageClassName}
    >
      {(!cropImgReady || !effectiveLayout || !cropRectClamped) && (
        <div className="absolute inset-0 z-3 flex items-center justify-center bg-neutral-200">
          <Loading
            size="md"
            showMessage={false}
          />
        </div>
      )}
      {effectiveLayout && cropRectClamped && imageSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={imageSrc}
          alt=""
          draggable={false}
          crossOrigin="anonymous"
          onLoad={onImageLoad}
          className={cn(
            'pointer-events-none absolute max-w-none select-none',
            showAvatarGrid && 'transform-[translateZ(0)]',
          )}
          style={imageLayerBox(effectiveLayout)}
        />
      )}
      {cropImgReady && effectiveLayout && cropRectClamped && displayCrop && (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-1"
            aria-hidden
          >
            <div
              data-crop-shade
              className="pointer-events-auto absolute inset-x-0 top-0 touch-none bg-black/55"
              style={{ height: displayCrop.y }}
              onPointerDown={onShadePointerDown}
            />
            <div
              data-crop-shade
              className="pointer-events-auto absolute inset-x-0 bottom-0 touch-none bg-black/55"
              style={{ top: displayCrop.y + displayCrop.h }}
              onPointerDown={onShadePointerDown}
            />
            <div
              data-crop-shade
              className="pointer-events-auto absolute left-0 touch-none bg-black/55"
              style={{
                top: displayCrop.y,
                width: displayCrop.x,
                height: displayCrop.h,
              }}
              onPointerDown={onShadePointerDown}
            />
            <div
              data-crop-shade
              className="pointer-events-auto absolute right-0 touch-none bg-black/55"
              style={{
                top: displayCrop.y,
                left: displayCrop.x + displayCrop.w,
                height: displayCrop.h,
              }}
              onPointerDown={onShadePointerDown}
            />
          </div>
          <div
            data-crop-frame
            role="presentation"
            className="absolute z-2 touch-none border border-primary shadow-[0_0_0_0.5px_rgba(255,255,255,0.45)]"
            style={{
              left: displayCrop.x,
              top: displayCrop.y,
              width: displayCrop.w,
              height: displayCrop.h,
            }}
          >
            <div
              className={cn(
                'absolute inset-3 z-0',
                marqueeDrag ? 'cursor-crosshair' : 'cursor-move',
              )}
              onPointerDown={onCropMovePointerDown}
            />
            {showAvatarGrid ? (
              <div
                className="pointer-events-none absolute inset-0 z-1"
                aria-hidden
              >
                <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/65" />
                <div className="absolute top-0 bottom-0 left-2/3 w-px bg-white/65" />
                <div className="absolute left-0 right-0 top-1/3 h-px bg-white/65" />
                <div className="absolute left-0 right-0 top-2/3 h-px bg-white/65" />
                <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-white/90" />
                <div className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 bg-white/90" />
              </div>
            ) : null}
            {allowFreeEdgeResize && onResizeEdgePointerDown
              ? (Object.keys(EDGE_HIT_CLASS) as ResizeEdge[]).map((edge) => (
                  <div
                    key={edge}
                    data-crop-handle
                    role="presentation"
                    className={cn(
                      'absolute z-20 flex bg-transparent',
                      EDGE_HIT_CLASS[edge].box,
                      EDGE_HIT_CLASS[edge].cursor,
                      edge === 'e' || edge === 'w'
                        ? 'justify-center'
                        : 'items-center justify-center',
                    )}
                    onPointerDown={(ev) => onResizeEdgePointerDown(ev, edge)}
                  >
                    <span
                      className={cn(
                        'pointer-events-none border border-primary bg-white',
                        EDGE_MARKER_CLASS[edge],
                      )}
                      aria-hidden
                    />
                  </div>
                ))
              : EDGE_HANDLE_DECOR.map((cls) => (
                  <span
                    key={cls}
                    className={cn(
                      'pointer-events-none absolute z-1 size-2 border border-primary bg-white',
                      cls,
                    )}
                    aria-hidden
                  />
                ))}
            {(Object.keys(CORNER_HANDLE_CLASS) as ResizeCorner[]).map((corner) => (
              <span
                key={corner}
                data-crop-handle
                role="presentation"
                className={cn(
                  'absolute z-30 flex size-5 items-center justify-center',
                  CORNER_HANDLE_CLASS[corner].box,
                  CORNER_HANDLE_CLASS[corner].cursor,
                )}
                onPointerDown={(ev) => onResizeCornerPointerDown(ev, corner)}
              >
                <span
                  className="size-2.5 border border-primary bg-white"
                  aria-hidden
                />
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
