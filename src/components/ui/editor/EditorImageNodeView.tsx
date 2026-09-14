'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NodeSelection } from '@tiptap/pm/state';
import { NodeViewWrapper, useEditorState, type NodeViewProps } from '@tiptap/react';

import { cn } from '@/utils/classNames';
import {
  DEFAULT_BORDER_COLOR,
  readBorderFromRecord,
  type BorderStyleAttrs,
} from '@/utils/editor/editorBlockBorder';
import {
  type ImageAlign,
  normalizeImageLinkMode,
  resolveImageLinkHref,
} from '@/utils/editor/editorImage';
import { setImageWidth } from '@/utils/editor/editorImageManipulations';
import {
  alignToTextAlign,
  buildCenteredTransform,
  buildFlowTransform,
  computeImageFrameLayout,
  computeResizeWidthPercent,
  hasCrossedDragThreshold,
  RESIZE_HANDLES,
  type ResizeHandle,
} from './editorImageLayout';

const HANDLE_POSITION: Record<ResizeHandle, string> = {
  nw: '-top-[7px] -left-[7px] cursor-nwse-resize',
  n: '-top-[7px] left-1/2 -translate-x-1/2 cursor-ns-resize',
  ne: '-top-[7px] -right-[7px] cursor-nesw-resize',
  e: 'top-1/2 -right-[7px] -translate-y-1/2 cursor-ew-resize',
  se: '-bottom-[7px] -right-[7px] cursor-nwse-resize',
  s: '-bottom-[7px] left-1/2 -translate-x-1/2 cursor-ns-resize',
  sw: '-bottom-[7px] -left-[7px] cursor-nesw-resize',
  w: 'top-1/2 -left-[7px] -translate-y-1/2 cursor-ew-resize',
};

/** Mở rộng vùng chạm trên mobile, không đổi vị trí nút 12px. */
const HANDLE_TOUCH_SLOP =
  '[@media(pointer:coarse)]:after:absolute [@media(pointer:coarse)]:after:-inset-4 [@media(pointer:coarse)]:after:content-[""]';

function lockScrollDuringImageResize() {
  document.body.style.touchAction = 'none';
}

function unlockScrollDuringImageResize() {
  document.body.style.touchAction = '';
}

function releasePointerIfCaptured(el: HTMLElement | null | undefined, pointerId: number) {
  if (!el?.hasPointerCapture(pointerId)) return;
  try {
    el.releasePointerCapture(pointerId);
  } catch {
    /* already released */
  }
}

interface ResizeHandlesProps {
  editor: NodeViewProps['editor'];
  getPos: NodeViewProps['getPos'];
  frameRef: React.RefObject<HTMLDivElement | null>;
  aspect: number;
  vertical: boolean;
  widthPercent: number;
  disabled?: boolean;
}

interface DragState {
  pointerId: number;
  handle: ResizeHandle;
  startX: number;
  startY: number;
  startWidthPx: number;
  parentWidthPx: number;
  moved: boolean;
  frameCaptured: boolean;
  percent: number;
  pos: number | null;
  originalWidth: string;
  captureEl: HTMLElement;
}

function ResizeHandles({
  editor,
  getPos,
  frameRef,
  aspect,
  vertical,
  widthPercent,
  disabled = false,
}: ResizeHandlesProps) {
  const dragRef = useRef<DragState | null>(null);

  const applyPreview = useCallback(
    (percent: number) => {
      const frame = frameRef.current;
      if (!frame) return;
      frame.style.width = vertical ? `calc(${percent}% / ${aspect})` : `${percent}%`;
    },
    [aspect, frameRef, vertical],
  );

  const onPointerDown = useCallback(
    (handle: ResizeHandle) => (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.preventDefault();
      event.stopPropagation();

      const frame = frameRef.current;
      const parent = frame?.parentElement;
      const parentWidthPx = parent?.clientWidth ?? frame?.clientWidth ?? 1;
      const startWidthPx = (parentWidthPx * widthPercent) / 100;

      dragRef.current = {
        pointerId: event.pointerId,
        handle,
        startX: event.clientX,
        startY: event.clientY,
        startWidthPx,
        parentWidthPx,
        moved: false,
        frameCaptured: false,
        percent: widthPercent,
        pos: getPos?.() ?? null,
        originalWidth: frame?.style.width ?? '',
        captureEl: event.currentTarget,
      };

      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [disabled, frameRef, getPos, widthPercent],
  );

  useEffect(() => {
    const beginActiveDrag = (drag: DragState, event: PointerEvent) => {
      drag.moved = true;
      lockScrollDuringImageResize();
      const frame = frameRef.current;
      if (frame && !drag.frameCaptured) {
        try {
          frame.setPointerCapture(event.pointerId);
          drag.frameCaptured = true;
        } catch {
          /* ignore */
        }
      }
    };

    const endDrag = (event: PointerEvent, drag: DragState) => {
      releasePointerIfCaptured(drag.captureEl, event.pointerId);
      releasePointerIfCaptured(frameRef.current, event.pointerId);
      unlockScrollDuringImageResize();
      dragRef.current = null;
      const frame = frameRef.current;

      if (!drag.moved) {
        if (frame) frame.style.width = drag.originalWidth;
        return;
      }

      const finalPercent = Math.round(drag.percent);
      applyPreview(finalPercent);
      setImageWidth(editor, finalPercent, drag.pos);
    };

    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;

      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;

      if (!drag.moved && hasCrossedDragThreshold(deltaX, deltaY)) {
        beginActiveDrag(drag, event);
      }
      if (!drag.moved) return;

      event.preventDefault();

      const percent = computeResizeWidthPercent({
        startWidthPx: drag.startWidthPx,
        parentWidthPx: drag.parentWidthPx,
        deltaX,
        deltaY,
        handle: drag.handle,
        aspect,
      });
      drag.percent = percent;
      applyPreview(percent);
    };

    const onPointerUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      event.preventDefault();
      endDrag(event, drag);
    };

    const onPointerCancel = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      event.preventDefault();
      endDrag(event, drag);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      unlockScrollDuringImageResize();
    };
  }, [applyPreview, aspect, editor, frameRef]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-5 touch-none select-none"
      aria-hidden
      onMouseDown={(event) => event.preventDefault()}
    >
      {RESIZE_HANDLES.map((handle) => (
        <div
          key={handle}
          role="presentation"
          className={cn(
            'pointer-events-auto absolute size-3 touch-none select-none rounded-sm border border-primary bg-white shadow-sm',
            HANDLE_POSITION[handle],
            HANDLE_TOUCH_SLOP,
          )}
          onPointerDown={onPointerDown(handle)}
        />
      ))}
    </div>
  );
}

const IMAGE_ERROR_MIN_SIZE = 120;

function borderAttrsToCss(border: BorderStyleAttrs): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (border.borderWidth) {
    style.borderWidth = `${border.borderWidth}px`;
    style.borderStyle = border.borderStyle ?? 'solid';
    style.borderColor = border.borderColor ?? DEFAULT_BORDER_COLOR;
  }
  if (border.borderRadius) {
    style.borderRadius = `${border.borderRadius}px`;
  }
  return style;
}

export default function EditorImageNodeView({ node, selected, editor, getPos }: NodeViewProps) {
  const frameRef = useRef<HTMLDivElement>(null);

  const nodeSelected =
    useEditorState({
      editor,
      selector: ({ editor: ed }) => {
        if (!ed || typeof getPos !== 'function') return false;
        const pos = getPos();
        if (pos == null) return false;
        const sel = ed.state.selection;
        return sel instanceof NodeSelection && sel.from === pos;
      },
    }) ?? false;

  const showControls = (selected || nodeSelected) && editor.isEditable;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedMeta, setLoadedMeta] = useState<{ src: string; aspect: number } | null>(null);

  const attrs = node.attrs as Record<string, unknown>;
  // Không để src rỗng lọt xuống <img> (React sẽ cảnh báo src=""); fallback originalSrc.
  const src = (attrs.src as string) || (attrs.originalSrc as string | null) || undefined;
  const loadError = Boolean(src && failedSrc === src);
  const naturalAspect = loadedMeta && loadedMeta.src === src ? loadedMeta.aspect : null;
  const alt = (attrs.alt as string | null) ?? '';
  const caption = (attrs.caption as string | null)?.trim() || '';
  const align = ((attrs.align as ImageAlign) ?? 'left') as ImageAlign;
  const linkMode = normalizeImageLinkMode(attrs.linkMode);
  const hasLink = Boolean(
    resolveImageLinkHref(
      linkMode,
      attrs.src as string,
      attrs.originalSrc as string | null,
      attrs.linkHref as string | null,
    ),
  );

  const layout = useMemo(
    () => computeImageFrameLayout(attrs, naturalAspect),
    [attrs, naturalAspect],
  );
  const {
    rotation,
    flipX,
    flipY,
    crop,
    cropped,
    vertical,
    effectiveAspect,
    widthPercent,
    flowMode,
    frameWidth,
    frameAspectRatio,
  } = layout;

  const handleImgLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      if (!src) return;

      const img = event.currentTarget;
      setFailedSrc((prev) => (prev === src ? null : prev));

      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setLoadedMeta({ src, aspect: img.naturalWidth / img.naturalHeight });
      }
    },
    [src],
  );

  const handleImgError = useCallback(() => {
    if (src) setFailedSrc(src);
  }, [src]);

  // Lưu tỉ lệ ảnh gốc vào node khi ảnh xoay dọc (90/270) đã load, để HTML xuất ra
  // chừa đúng box lúc hiển thị. Chỉ chạy khi editable, ảnh không crop và giá trị đổi.
  useEffect(() => {
    if (!editor.isEditable || !vertical || cropped) return;
    if (naturalAspect == null || !Number.isFinite(naturalAspect)) return;
    if (typeof getPos !== 'function') return;

    const stored = typeof attrs.naturalAspect === 'number' ? attrs.naturalAspect : null;
    if (stored != null && Math.abs(stored - naturalAspect) < 1e-4) return;

    const pos = getPos();
    if (pos == null) return;

    const node = editor.state.doc.nodeAt(pos);
    if (!node || node.type.name !== 'image') return;

    const tr = editor.state.tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      naturalAspect,
    });
    tr.setMeta('addToHistory', false);
    editor.view.dispatch(tr);
  }, [editor, vertical, cropped, naturalAspect, attrs.naturalAspect, getPos]);

  const wrapperStyle: React.CSSProperties = {
    display: 'block',
    maxWidth: '100%',
    ...(alignToTextAlign(align) ? { textAlign: alignToTextAlign(align) } : {}),
    margin: '0.5rem 0',
    // Vùng trống của node là full-width; cho nó "trong suốt" với con trỏ để
    // click cạnh ảnh rơi xuống editor và bỏ chọn. Chỉ frame nhận pointer.
    pointerEvents: 'none',
  };

  const border = readBorderFromRecord(attrs);
  const borderCss = borderAttrsToCss(border);
  const clipStyle: React.CSSProperties = {
    boxSizing: 'border-box',
    overflow: border.borderRadius ? 'hidden' : undefined,
    ...borderCss,
  };

  const frameStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    maxWidth: '100%',
    verticalAlign: 'top',
    lineHeight: 0,
    pointerEvents: 'auto',
    width: frameWidth,
    aspectRatio: loadError ? undefined : frameAspectRatio,
    ...(loadError
      ? {
          minWidth: IMAGE_ERROR_MIN_SIZE,
          minHeight: IMAGE_ERROR_MIN_SIZE,
          backgroundColor: 'rgb(243 244 246)',
        }
      : {}),
    // Giữ radius trên frame để ring chọn bám đúng góc bo; KHÔNG overflow:hidden
    // ở frame để không cắt mất các nút resize (offset âm ra ngoài frame).
    ...(border.borderRadius ? { borderRadius: `${border.borderRadius}px` } : {}),
  };

  return (
    <NodeViewWrapper
      className="rc-image-wrapper"
      style={wrapperStyle}
      data-align={align !== 'left' ? align : undefined}
      data-rotation={rotation ? String(rotation) : undefined}
    >
      <div
        ref={frameRef}
        className={cn(
          'rc-image-frame',
          showControls && 'rounded-sm ring-2 ring-primary/60',
          hasLink && 'cursor-pointer ring-1 ring-primary/20',
        )}
        style={frameStyle}
      >
        {flowMode ? (
          <div
            className="rc-image-clip"
            style={{
              display: 'block',
              width: '100%',
              ...clipStyle,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              draggable={false}
              onLoad={handleImgLoad}
              onError={handleImgError}
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                maxWidth: '100%',
                minHeight: loadError ? IMAGE_ERROR_MIN_SIZE : undefined,
                transform: buildFlowTransform(rotation, flipX, flipY),
                transformOrigin: 'center center',
              }}
            />
          </div>
        ) : (
          <div
            className="rc-image-clip"
            style={{
              position: 'absolute',
              inset: 0,
              ...clipStyle,
            }}
          >
            <div
              className="rc-image-transform"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transformOrigin: 'center center',
                transform: buildCenteredTransform(rotation, flipX, flipY),
                width: vertical ? `calc(100% * ${effectiveAspect})` : '100%',
                height: vertical ? undefined : '100%',
                aspectRatio: vertical ? String(effectiveAspect) : undefined,
              }}
            >
              {cropped && crop ? (
                <div
                  className="rc-image-crop-viewport rc-image-crop-viewport--cropped"
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    lineHeight: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={alt}
                    draggable={false}
                    onLoad={handleImgLoad}
                    onError={handleImgError}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      display: 'block',
                      height: 'auto',
                      maxWidth: 'none',
                      width: `calc(100% / ${crop.w})`,
                      transform: `translate(calc(-100% * ${crop.x}), calc(-100% * ${crop.y}))`,
                    }}
                  />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={alt}
                  draggable={false}
                  onLoad={handleImgLoad}
                  onError={handleImgError}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              )}
            </div>
          </div>
        )}

        {showControls ? (
          <ResizeHandles
            editor={editor}
            getPos={getPos}
            frameRef={frameRef}
            aspect={effectiveAspect}
            vertical={vertical}
            widthPercent={widthPercent}
            disabled={!editor.isEditable}
          />
        ) : null}

        <div className="rc-image-toolbar-host" />
      </div>

      {caption ? (
        <figcaption className="rc-image-caption pointer-events-none mt-2 text-center text-sm font-medium text-black italic">
          {caption}
        </figcaption>
      ) : null}
    </NodeViewWrapper>
  );
}
