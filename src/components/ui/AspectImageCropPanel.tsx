'use client';

import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/Button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import ImageCropStage from '@/components/ui/ImageCropStage';
import Loading from '@/components/ui/Loading';
import { CROP_IMAGE_ACCEPT } from '@/constants/file-upload';
import type { ImageCropPreset } from '@/constants/image-crop-presets';
import { useAspectImageCrop } from '@/hooks/useAspectImageCrop';
import { cn } from '@/utils/classNames';

export type AspectImageCropPanelHandle = {
  reset: () => void;
  exportWebpFile: () => Promise<File | null>;
  hasNewImage: () => boolean;
  isCropReady: () => boolean;
  isMarkedRemoved: () => boolean;
  markRemoved: () => void;
  unmarkRemoved: () => void;
  clearNewImage: () => void;
};

export type AspectImageCropUiState = {
  hasNewImage: boolean;
  cropReady: boolean;
  markedRemoved: boolean;
  isCompressing: boolean;
};

type AspectImageCropPanelProps = {
  preset: ImageCropPreset;
  currentImageUrl: string;
  disabled?: boolean;
  uploadTitle: string;
  previewTitle: string;
  pickCta: string;
  formatsHint: string;
  previewAlt: string;
  onStateChange?: (state: AspectImageCropUiState) => void;
};

const AspectImageCropPanel = forwardRef<AspectImageCropPanelHandle, AspectImageCropPanelProps>(
  function AspectImageCropPanel(
    {
      preset,
      currentImageUrl,
      disabled = false,
      uploadTitle,
      previewTitle,
      pickCta,
      formatsHint,
      previewAlt,
      onStateChange,
    },
    ref,
  ) {
    const {
      stageRef,
      fileInputRef,
      imgRef,
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
      onShadePointerDown,
      onStagePointerDownCapture,
      exportWebpFile,
    } = useAspectImageCrop({ preset });

    const trimmedCurrent = currentImageUrl.trim();
    const isCirclePreview = preset.previewVariant === 'circle';

    useEffect(() => {
      onStateChange?.({
        hasNewImage: Boolean(imageSrc),
        cropReady: cropImgReady && Boolean(imageSrc),
        markedRemoved,
        isCompressing,
      });
    }, [imageSrc, cropImgReady, markedRemoved, isCompressing, onStateChange]);

    useImperativeHandle(
      ref,
      () => ({
        reset: resetEditor,
        exportWebpFile,
        hasNewImage: () => Boolean(imageSrc),
        isCropReady: () => cropImgReady && Boolean(imageSrc),
        isMarkedRemoved: () => markedRemoved,
        markRemoved: () => setMarkedRemoved(true),
        unmarkRemoved: () => setMarkedRemoved(false),
        clearNewImage: () => {
          resetEditor();
        },
      }),
      [resetEditor, exportWebpFile, imageSrc, cropImgReady, markedRemoved, setMarkedRemoved],
    );

    const previewShowsCanvas = imageSrc && !isCompressing && cropImgReady;
    const previewFallbackSrc = markedRemoved && !imageSrc ? '' : trimmedCurrent;

    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-6">
        <div className="min-w-0 space-y-3 lg:col-span-2">
          <p className="text-sm font-semibold text-black">{uploadTitle}</p>
          <div
            role={!imageSrc && !isCompressing ? 'button' : undefined}
            tabIndex={!imageSrc && !isCompressing && !disabled ? 0 : undefined}
            className={cn(
              'flex min-h-[240px] flex-col rounded-2xl border-2 border-dashed transition-colors',
              isCompressing && !imageSrc
                ? isCirclePreview
                  ? 'border-[#E0E0E0] bg-neutral-200 p-0'
                  : 'border-gray/30 bg-gray/10'
                : isCirclePreview
                  ? isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-[#E0E0E0] bg-white'
                  : isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-gray/30 bg-white',
              !imageSrc && !isCompressing && !disabled && 'cursor-pointer hover:bg-gray/5',
            )}
            onClick={() => {
              if (!imageSrc && !isCompressing && !disabled) {
                fileInputRef.current?.click();
              }
            }}
            onKeyDown={(e) => {
              if (
                !imageSrc &&
                !isCompressing &&
                !disabled &&
                (e.key === 'Enter' || e.key === ' ')
              ) {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (!disabled) setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (!disabled && !isCompressing) {
                onPickFile(e.dataTransfer.files[0]);
              }
            }}
          >
            {!imageSrc ? (
              isCompressing ? (
                <div
                  className={cn(
                    'flex flex-1 items-center justify-center',
                    isCirclePreview ? 'min-h-[240px] rounded-2xl bg-neutral-200' : 'py-12',
                  )}
                >
                  <Loading
                    size="md"
                    showMessage={false}
                  />
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10">
                  <ImageWithFallback
                    src="/images/change_image.webp"
                    alt=""
                    width={100}
                    height={100}
                    className="object-contain drop-shadow-md"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-auto px-4 py-2 text-sm font-semibold text-primary"
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    {pickCta}
                  </Button>
                  <p className="text-center text-xs text-gray-400">{formatsHint}</p>
                </div>
              )
            ) : (
              <div
                className="flex min-h-[240px] flex-1 flex-col p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <ImageCropStage
                  stageRef={stageRef}
                  imgRef={imgRef}
                  stageClassName={preset.stageClassName}
                  imageSrc={imageSrc}
                  cropImgReady={cropImgReady}
                  effectiveLayout={effectiveLayout}
                  cropRectClamped={cropRectClamped}
                  displayCrop={displayCrop}
                  marqueeDrag={marqueeDrag}
                  showAvatarGrid={isCirclePreview}
                  onStagePointerDownCapture={onStagePointerDownCapture}
                  onImageLoad={onImageLoad}
                  onShadePointerDown={onShadePointerDown}
                  onCropMovePointerDown={onCropMovePointerDown}
                  onResizeCornerPointerDown={onResizeCornerPointerDown}
                />
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          <p className="text-center text-sm font-semibold text-black">{previewTitle}</p>
          <div className="flex min-h-[120px] justify-center">
            <div
              className={cn(
                'flex shrink-0 items-center justify-center overflow-hidden border border-gray/25 bg-gray/10',
                isCirclePreview ? 'size-[120px] rounded-full' : 'w-full max-w-[320px] rounded-lg',
              )}
              style={
                isCirclePreview
                  ? undefined
                  : {
                      aspectRatio: `${preset.aspect.w} / ${preset.aspect.h}`,
                    }
              }
            >
              {previewShowsCanvas ? (
                <canvas
                  ref={previewCanvasRef}
                  width={preset.output.w}
                  height={preset.output.h}
                  className={cn(
                    'block h-full w-full',
                    isCirclePreview ? 'rounded-full object-contain' : 'object-cover',
                  )}
                  aria-hidden
                />
              ) : (
                <ImageWithFallback
                  src={previewFallbackSrc}
                  alt={previewAlt}
                  width={preset.output.w}
                  height={preset.output.h}
                  className={cn(
                    'h-full w-full',
                    isCirclePreview ? 'rounded-full object-contain' : 'object-cover',
                  )}
                />
              )}
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={CROP_IMAGE_ACCEPT}
          className="sr-only"
          disabled={disabled || isCompressing}
          onChange={(e) => onPickFile(e.target.files?.[0])}
        />
      </div>
    );
  },
);

export default AspectImageCropPanel;
