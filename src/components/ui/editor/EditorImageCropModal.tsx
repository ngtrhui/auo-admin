'use client';

import { useRef, useState } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/core';

import { Button } from '@/components/ui/Button';
import EditorImageCropPanel, {
  type EditorImageCropPanelHandle,
} from '@/components/ui/editor/EditorImageCropPanel';
import Modal from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toaster';
import type { CropRectNormalized } from '@/utils/imageCrop/cropLayout';
import { isEditorAlive } from '@/utils/editor/editorGuard';
import {
  computeCropAspect,
  cropAttrsFromRect,
  updateImagePreserveSelection,
} from '@/utils/editor/editorImageManipulations';
import { getErrorMessage } from '@/utils/helper';

interface EditorImageCropModalProps {
  open: boolean;
  onClose: () => void;
  editor: TiptapEditor;
  /** Ảnh gốc để crop — luôn full image trên R2. */
  cropSourceSrc: string;
  /** Khung crop hiện tại (metadata), null = full ảnh. */
  initialCropRect?: CropRectNormalized | null;
  onApplied?: () => void;
}

export default function EditorImageCropModal({
  open,
  onClose,
  editor,
  cropSourceSrc,
  initialCropRect = null,
  onApplied,
}: EditorImageCropModalProps) {
  const panelRef = useRef<EditorImageCropPanelHandle>(null);
  const [isCropReady, setIsCropReady] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleClose = () => {
    if (isApplying) return;
    panelRef.current?.reset();
    setIsCropReady(false);
    onClose();
  };

  const handleApply = async () => {
    if (!panelRef.current?.isCropReady()) return;

    setIsApplying(true);
    try {
      const metadata = panelRef.current.exportCropMetadata();
      if (!metadata) {
        throw new Error('Không thể tính vùng cắt');
      }

      const r2Url = cropSourceSrc.trim();
      if (!r2Url) {
        throw new Error('Thiếu URL ảnh gốc');
      }

      if (!isEditorAlive(editor)) return;

      const { cropRect, naturalSize } = metadata;
      const cropAspect = computeCropAspect(cropRect, naturalSize.w, naturalSize.h);

      updateImagePreserveSelection(editor, {
        src: r2Url,
        originalSrc: r2Url,
        ...cropAttrsFromRect(cropRect),
        cropAspect,
        rotation: 0,
        flipX: false,
        flipY: false,
      });

      onApplied?.();
      handleClose();
    } catch (error) {
      showToast('error', getErrorMessage(error, 'Cắt ảnh thất bại'));
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Cắt ảnh"
      className="w-2xl"
      contentClassName="p-4"
      disabled={isApplying}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isApplying}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            loading={isApplying}
            disabled={!isCropReady}
          >
            Áp dụng
          </Button>
        </>
      }
    >
      {open && cropSourceSrc ? (
        <EditorImageCropPanel
          ref={panelRef}
          imageSrc={cropSourceSrc}
          initialCropRect={initialCropRect}
          disabled={isApplying}
          onReadyChange={setIsCropReady}
        />
      ) : null}
    </Modal>
  );
}
