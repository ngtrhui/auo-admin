'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Select } from '@/components/ui/Select';
import ImageCropStage from '@/components/ui/ImageCropStage';
import { EDITOR_CROP_ASPECT_OPTIONS, EDITOR_CROP_PRESET } from '@/constants/image-crop-presets';
import { useAspectImageCrop } from '@/hooks/useAspectImageCrop';
import type { CropRectNormalized } from '@/utils/imageCrop/cropLayout';

export type EditorImageCropMetadata = {
  cropRect: CropRectNormalized;
  naturalSize: { w: number; h: number };
};

export type EditorImageCropPanelHandle = {
  exportCropMetadata: () => EditorImageCropMetadata | null;
  isCropReady: () => boolean;
  reset: () => void;
};

type EditorImageCropPanelProps = {
  imageSrc: string;
  initialCropRect?: CropRectNormalized | null;
  disabled?: boolean;
  onReadyChange?: (ready: boolean) => void;
};

const ASPECT_SELECT_OPTIONS = EDITOR_CROP_ASPECT_OPTIONS.map((option) => ({
  value: option.id,
  label: option.label,
}));

const EditorImageCropPanel = forwardRef<EditorImageCropPanelHandle, EditorImageCropPanelProps>(
  function EditorImageCropPanel(
    { imageSrc, initialCropRect = null, disabled = false, onReadyChange },
    ref,
  ) {
    const [aspectId, setAspectId] = useState('free');

    const selectedAspect = useMemo(
      () =>
        EDITOR_CROP_ASPECT_OPTIONS.find((option) => option.id === aspectId) ??
        EDITOR_CROP_ASPECT_OPTIONS[0],
      [aspectId],
    );

    const {
      stageRef,
      imgRef,
      previewCanvasRef,
      cropImgReady,
      effectiveLayout,
      cropRectClamped,
      displayCrop,
      marqueeDrag,
      resetEditor,
      loadImageFromUrl,
      onImageLoad,
      onCropMovePointerDown,
      onResizeCornerPointerDown,
      onResizeEdgePointerDown,
      onShadePointerDown,
      onStagePointerDownCapture,
      exportCropRectNormalized,
      naturalSize,
    } = useAspectImageCrop({
      preset: EDITOR_CROP_PRESET,
      aspect: selectedAspect.aspect,
      initialCropRect,
    });

    useEffect(() => {
      if (imageSrc.trim()) {
        loadImageFromUrl(imageSrc);
      }
    }, [imageSrc, loadImageFromUrl]);

    const isReady = cropImgReady && Boolean(imageSrc);

    useEffect(() => {
      onReadyChange?.(isReady);
    }, [isReady, onReadyChange]);

    useImperativeHandle(
      ref,
      () => ({
        exportCropMetadata: () => {
          const cropRect = exportCropRectNormalized();
          if (!cropRect || !naturalSize) return null;
          return { cropRect, naturalSize };
        },
        isCropReady: () => isReady,
        reset: () => {
          setAspectId('free');
          resetEditor();
        },
      }),
      [exportCropRectNormalized, isReady, naturalSize, resetEditor],
    );

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-black shrink-0">Tỉ lệ cắt</span>
          <Select
            options={ASPECT_SELECT_OPTIONS}
            value={aspectId}
            onChange={setAspectId}
            disabled={disabled}
            popoverZIndex={110}
            className="w-fit h-10 text-sm"
          />
        </div>

        <ImageCropStage
          stageRef={stageRef}
          imgRef={imgRef}
          stageClassName={EDITOR_CROP_PRESET.stageClassName}
          imageSrc={imageSrc}
          cropImgReady={cropImgReady}
          effectiveLayout={effectiveLayout}
          cropRectClamped={cropRectClamped}
          displayCrop={displayCrop}
          marqueeDrag={marqueeDrag}
          allowFreeEdgeResize={selectedAspect.aspect === null}
          onStagePointerDownCapture={onStagePointerDownCapture}
          onImageLoad={onImageLoad}
          onShadePointerDown={onShadePointerDown}
          onCropMovePointerDown={onCropMovePointerDown}
          onResizeCornerPointerDown={onResizeCornerPointerDown}
          onResizeEdgePointerDown={onResizeEdgePointerDown}
        />

        <p className="text-center text-xs text-gray">
          Scroll để zoom · Alt + kéo để di chuyển ảnh · Kéo vùng tối để chọn vùng crop
          {selectedAspect.aspect === null ? ' · Kéo cạnh hoặc góc để chỉnh khung' : ''}
        </p>

        <canvas
          ref={previewCanvasRef}
          className="sr-only"
          aria-hidden
        />
      </div>
    );
  },
);

export default EditorImageCropPanel;
