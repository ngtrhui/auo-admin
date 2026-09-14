'use client';

import { useEffect, useState } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { FiChevronDown } from 'react-icons/fi';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { AnimatePresence, motion } from '@/lib/motion';
import {
  EDITOR_IMAGE_SETTINGS_DEFAULT_VALUES,
  editorImageSettingsSchema,
  type EditorImageSettingsFormValues,
} from '@/schemas/editor-image-settings.schema';
import { cn } from '@/utils/classNames';
import { resolveEditorImageCropSource, type ImageAlign } from '@/utils/editor/editorImage';
import {
  applyImageSettings,
  readImageSettingsFromAttrs,
  type SelectedImageAttrs,
} from '@/utils/editor/editorImageManipulations';

const LINK_MODE_OPTIONS = [
  { value: 'none', label: 'Không có' },
  { value: 'media', label: 'Đường dẫn của ảnh' },
  { value: 'custom', label: 'URL tùy chỉnh' },
];

const ALIGN_OPTIONS: { value: ImageAlign; label: string }[] = [
  { value: 'left', label: 'Trái' },
  { value: 'center', label: 'Chính giữa' },
  { value: 'right', label: 'Phải' },
  { value: 'none', label: 'Không dùng' },
];

function SettingsFieldRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr] sm:items-start', className)}
    >
      <span className="pt-2 text-sm font-medium text-black sm:text-right">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function AlignButtonGroup({
  value,
  onChange,
  disabled,
}: {
  value: ImageAlign;
  onChange: (align: ImageAlign) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-gray/25">
      {ALIGN_OPTIONS.map((option, index) => (
        <Button
          key={option.value}
          type="button"
          variant="transparent"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={cn(
            'h-auto rounded-none px-3 py-2 text-xs text-black font-medium enabled:hover:bg-gray/10',
            index > 0 && 'border-l border-gray/25',
            value === option.value && 'bg-primary-light text-primary',
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

interface EditorImageSettingsModalProps {
  open: boolean;
  onClose: () => void;
  imageAttrs: SelectedImageAttrs | null;
  editor?: TiptapEditor;
  onSave?: (values: EditorImageSettingsFormValues) => void;
  saveLabel?: string;
  modalMode?: boolean;
}

export default function EditorImageSettingsModal({
  open,
  onClose,
  editor,
  imageAttrs,
  onSave,
  saveLabel = 'Cập nhật',
  modalMode,
}: EditorImageSettingsModalProps) {
  const [advancedOpen, setAdvancedOpen] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditorImageSettingsFormValues>({
    resolver: zodResolver(editorImageSettingsSchema),
    defaultValues: EDITOR_IMAGE_SETTINGS_DEFAULT_VALUES,
  });

  const linkMode = watch('linkMode');

  useEffect(() => {
    if (!open || !imageAttrs) return;
    reset(readImageSettingsFromAttrs(imageAttrs));
    setAdvancedOpen(true);
  }, [open, imageAttrs, reset]);

  const previewSrc = imageAttrs
    ? resolveEditorImageCropSource(imageAttrs.src, imageAttrs.originalSrc)
    : '';

  const onSubmit = (values: EditorImageSettingsFormValues) => {
    if (onSave) {
      onSave(values);
    } else if (editor) {
      applyImageSettings(editor, values);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chi tiết hình ảnh"
      className="w-full"
      contentClassName="p-0 overflow-hidden"
      maxWidth={modalMode ? '900px' : '900px'}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
          >
            {saveLabel}
          </Button>
        </>
      }
    >
      <form
        className="flex min-h-[420px] flex-col md:flex-row"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex-1 space-y-5 overflow-y-auto bg-gray/5 p-6">
          <SettingsFieldRow label="Văn bản thay thế">
            <div className="space-y-1.5">
              <Textarea
                {...register('alt')}
                rows={3}
                className="text-sm max-h-40"
                placeholder="Mô tả nội dung ảnh"
                error={errors.alt?.message}
              />
              <p className="text-xs text-gray">
                <span className="text-primary">Xem cách mô tả nội dung ảnh</span>
                {' · '}
                Để trống nếu ảnh chỉ dùng làm hiệu ứng trang trí.
              </p>
            </div>
          </SettingsFieldRow>

          <SettingsFieldRow label="Chú thích">
            <Textarea
              {...register('caption')}
              rows={3}
              className="text-sm max-h-40"
              placeholder="Chú thích hiển thị dưới ảnh"
              error={errors.caption?.message}
            />
          </SettingsFieldRow>

          <div className="space-y-4 border-t border-gray/15 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray">Cài đặt hiển thị</p>

            <SettingsFieldRow label="Căn chỉnh">
              <Controller
                name="align"
                control={control}
                render={({ field }) => (
                  <AlignButtonGroup
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </SettingsFieldRow>

            <SettingsFieldRow label="Liên kết tới">
              <Controller
                name="linkMode"
                control={control}
                render={({ field }) => (
                  <Select
                    options={LINK_MODE_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    popoverZIndex={110}
                    ariaLabel="Liên kết tới"
                    className="text-sm h-10"
                    containerClassName="w-60"
                  />
                )}
              />
            </SettingsFieldRow>
          </div>

          <div className="border-t border-gray/15 pt-4">
            <Button
              type="button"
              variant="transparent"
              size="sm"
              fullWidth
              onClick={() => setAdvancedOpen((prev) => !prev)}
              aria-expanded={advancedOpen}
              contentClassName="text-left text-xs font-bold uppercase tracking-wide text-gray"
              rightIcon={
                <motion.span
                  animate={{ rotate: advancedOpen ? 180 : 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="inline-flex shrink-0 text-gray"
                >
                  <FiChevronDown
                    className="size-4"
                    aria-hidden
                  />
                </motion.span>
              }
              className="h-auto justify-start gap-2 rounded-lg px-0 py-1 enabled:hover:bg-transparent enabled:hover:text-black"
            >
              Tùy chọn nâng cao
            </Button>

            <AnimatePresence initial={false}>
              {advancedOpen ? (
                <motion.div
                  key="advanced-options"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 pt-4">
                    <SettingsFieldRow label="Tiêu đề hình ảnh">
                      <Input
                        {...register('title')}
                        variant="standard"
                        placeholder="Thuộc tính title của ảnh"
                        error={errors.title?.message}
                        className="text-sm h-10"
                      />
                    </SettingsFieldRow>

                    <SettingsFieldRow label="Lớp ảnh CSS">
                      <Input
                        {...register('imageClass')}
                        variant="standard"
                        placeholder="post-img"
                        error={errors.imageClass?.message}
                        className="text-sm h-10"
                      />
                    </SettingsFieldRow>

                    <SettingsFieldRow label="">
                      <Controller
                        name="linkTarget"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            label="Mở liên kết trong 1 thẻ mới"
                            className="select-none"
                            checked={field.value}
                            onChange={(event) => field.onChange(event.target.checked)}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        )}
                      />
                    </SettingsFieldRow>

                    {linkMode === 'custom' ? (
                      <SettingsFieldRow label="Đường dẫn">
                        <Input
                          {...register('linkHref')}
                          variant="standard"
                          placeholder="https://"
                          error={errors.linkHref?.message}
                          className="text-sm h-10"
                        />
                      </SettingsFieldRow>
                    ) : null}

                    <SettingsFieldRow label="Liên kết lớp CSS">
                      <Input
                        {...register('linkClass')}
                        variant="standard"
                        placeholder="custom-link-class"
                        error={errors.linkClass?.message}
                        className="text-sm h-10"
                      />
                    </SettingsFieldRow>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex min-h-[240px] items-center justify-center border-t border-gray/15 bg-white p-6 md:w-[42%] md:shrink-0 md:border-t-0 md:border-l">
          {previewSrc ? (
            <div className="flex max-h-[360px] w-full flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt={imageAttrs?.alt ?? 'Preview ảnh'}
                className="max-h-[320px] w-auto max-w-full object-contain"
              />
              {watch('caption') ? (
                <p className="text-center text-sm font-medium text-black italic">
                  {watch('caption')}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-gray">Không có ảnh để xem trước</p>
          )}
        </div>
      </form>
    </Modal>
  );
}
