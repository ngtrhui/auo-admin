'use client';

import { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { FiImage, FiLink } from 'react-icons/fi';
import { HiOutlinePhotograph } from 'react-icons/hi';

import { Button } from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import EditorImageSettingsModal from '@/components/ui/editor/EditorImageSettingsModal';
import {
  EDITOR_IMAGE_SETTINGS_DEFAULT_VALUES,
  type EditorImageSettingsFormValues,
} from '@/schemas/editor-image-settings.schema';
import { cn } from '@/utils/classNames';
import {
  buildImageNodeAttrsFromSettings,
  buildSelectedImageAttrsFromDraft,
} from '@/utils/editor/editorImageManipulations';
import type { MediaAsset } from '@/types/media';

const MediaBrowser = dynamic(() => import('@/components/modules/media/MediaBrowser'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  ),
});

const PREVIEW_LIMIT = 3;

type PendingImagePick = {
  asset: MediaAsset;
  settings: EditorImageSettingsFormValues;
};

interface EditorImageInsertProps {
  editor: TiptapEditor;
  disabled?: boolean;
  elevatedOverlay?: boolean;
}

const menuItemClassName =
  'h-auto! justify-start rounded-none px-4 py-2.5 text-sm text-black hover:bg-gray/10';

export default function EditorImageInsert({
  editor,
  disabled,
  elevatedOverlay = false,
}: EditorImageInsertProps) {
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [pendingPicks, setPendingPicks] = useState<Record<string, PendingImagePick>>({});
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const selectedCount = selectedOrder.length;

  const previewIds = useMemo(() => selectedOrder.slice(0, PREVIEW_LIMIT), [selectedOrder]);

  const overflowCount = Math.max(0, selectedOrder.length - PREVIEW_LIMIT);

  const resetMediaPickerState = useCallback(() => {
    setPendingPicks({});
    setSelectedOrder([]);
    setEditingAssetId(null);
    setIsSettingsOpen(false);
  }, []);

  const insertImage = (src: string, alt?: string) => {
    editor.chain().focus().setImage({ src, alt }).run();
  };

  const handleToggleAsset = (asset: MediaAsset) => {
    setPendingPicks((prev) => {
      if (prev[asset.id]) {
        setSelectedOrder((order) => order.filter((id) => id !== asset.id));
        const next = { ...prev };
        delete next[asset.id];
        return next;
      }

      setSelectedOrder((order) => (order.includes(asset.id) ? order : [...order, asset.id]));
      return {
        ...prev,
        [asset.id]: {
          asset,
          settings: {
            ...EDITOR_IMAGE_SETTINGS_DEFAULT_VALUES,
            alt: asset.fileName,
          },
        },
      };
    });
  };

  const handleClearSelection = () => {
    resetMediaPickerState();
  };

  const handleEditAsset = (asset: MediaAsset) => {
    setEditingAssetId(asset.id);
    setIsSettingsOpen(true);
  };

  const handleSaveDraftSettings = (values: EditorImageSettingsFormValues) => {
    if (!editingAssetId) return;

    setPendingPicks((prev) => {
      const pick = prev[editingAssetId];
      if (!pick) return prev;

      return {
        ...prev,
        [editingAssetId]: {
          ...pick,
          settings: values,
        },
      };
    });
    setEditingAssetId(null);
  };

  const handleInsertSelected = () => {
    if (!selectedCount) return;

    const nodes = selectedOrder
      .filter((id) => pendingPicks[id])
      .map((id) => {
        const pick = pendingPicks[id];
        return {
          type: 'image' as const,
          attrs: buildImageNodeAttrsFromSettings(
            pick.asset.publicUrl,
            pick.asset.fileName,
            pick.settings,
          ),
        };
      });

    if (nodes.length) {
      editor.chain().focus().insertContent(nodes).run();
    }

    resetMediaPickerState();
    setIsMediaLibraryOpen(false);
  };

  const handleInsertUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;
    insertImage(url);
    setImageUrl('');
    setIsUrlModalOpen(false);
  };

  const openMediaLibrary = () => {
    resetMediaPickerState();
    setIsMediaLibraryOpen(true);
  };

  const openUrlModal = () => {
    setImageUrl('');
    setIsUrlModalOpen(true);
  };

  const closeMediaLibrary = () => {
    resetMediaPickerState();
    setIsMediaLibraryOpen(false);
  };

  const editingPick = editingAssetId ? pendingPicks[editingAssetId] : null;

  const pickerBottomBar = (
    <div className="flex w-full items-center justify-between gap-4">
      {selectedCount > 0 ? (
        <div className="flex min-w-0 items-center gap-3">
          <div className="shrink-0">
            <p className="text-xs text-gray font-medium">Đã chọn {selectedCount} item</p>
            <Button
              variant="danger"
              type="button"
              className="text-xs h-auto p-0 bg-transparent enabled:hover:bg-transparent text-coral enabled:hover:text-coral hover:underline"
              onClick={handleClearSelection}
            >
              Xóa
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            {previewIds.map((id) => {
              const pick = pendingPicks[id];
              if (!pick) return null;

              return (
                <div
                  key={id}
                  className="size-11 shrink-0 overflow-hidden rounded border-2 border-primary"
                >
                  <ImageWithFallback
                    src={pick.asset.publicUrl}
                    alt={pick.asset.fileName}
                    width={44}
                    height={44}
                    className="size-full object-cover"
                    unoptimized
                  />
                </div>
              );
            })}
            {overflowCount > 0 ? (
              <div className="flex size-11 shrink-0 items-center justify-center rounded bg-gray/10 text-xs font-medium text-gray">
                +{overflowCount}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <span />
      )}
      <Button
        type="button"
        onClick={handleInsertSelected}
        disabled={selectedCount === 0}
        className="shrink-0"
      >
        Chèn vào bài viết
      </Button>
    </div>
  );

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <Dropdown
              usePortal
              showArrow={false}
              align="left"
              placement="bottom"
              ariaLabel="Chèn ảnh"
              className={cn('min-w-[220px] py-1', elevatedOverlay && 'z-110')}
              containerClassName="shrink-0"
              trigger={({ triggerProps }) => (
                <Button
                  type="button"
                  variant="transparent"
                  disabled={disabled}
                  onMouseDown={(e) => e.preventDefault()}
                  title="Chèn ảnh"
                  aria-label="Chèn ảnh"
                  className={cn(
                    'h-auto rounded p-2 text-black enabled:hover:bg-gray/20',
                    disabled && 'cursor-not-allowed opacity-50',
                  )}
                  {...triggerProps}
                >
                  <FiImage className="size-5" />
                </Button>
              )}
            >
              <div className="flex flex-col">
                <Button
                  type="button"
                  role="menuitem"
                  variant="transparent"
                  leftIcon={<HiOutlinePhotograph className="size-5" />}
                  className={menuItemClassName}
                  onClick={openMediaLibrary}
                >
                  Chọn từ thư viện media
                </Button>
                <Button
                  type="button"
                  role="menuitem"
                  variant="transparent"
                  leftIcon={<FiLink className="size-5" />}
                  className={menuItemClassName}
                  onClick={openUrlModal}
                >
                  Nhập URL
                </Button>
              </div>
            </Dropdown>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">Chèn ảnh</TooltipContent>
      </Tooltip>

      <Modal
        open={isMediaLibraryOpen}
        onClose={closeMediaLibrary}
        title="Chọn ảnh từ thư viện"
        maxWidth="1200px"
        className="flex h-[min(80vh,750px)] flex-col"
        contentClassName="flex min-h-0 flex-1 flex-col overflow-hidden p-0"
      >
        <MediaBrowser
          mode="picker"
          imageOnly
          compact
          multiPick
          selectedAssetIds={selectedOrder}
          onToggleAsset={handleToggleAsset}
          onEditAsset={handleEditAsset}
          pickerBottomBar={pickerBottomBar}
        />
      </Modal>

      <EditorImageSettingsModal
        open={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setEditingAssetId(null);
        }}
        imageAttrs={
          editingPick
            ? buildSelectedImageAttrsFromDraft(
                editingPick.asset.publicUrl,
                editingPick.asset.fileName,
                editingPick.settings,
              )
            : null
        }
        onSave={handleSaveDraftSettings}
        saveLabel="Lưu"
        modalMode={elevatedOverlay}
      />

      <Modal
        open={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        title="Chèn ảnh từ URL"
        className="w-full max-w-md"
        contentClassName="p-4"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUrlModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleInsertUrl}
              disabled={!imageUrl.trim()}
            >
              Chèn
            </Button>
          </>
        }
      >
        <Input
          label="URL ảnh"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleInsertUrl();
            }
          }}
          autoFocus
        />
      </Modal>
    </>
  );
}
