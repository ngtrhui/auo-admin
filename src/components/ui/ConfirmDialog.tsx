'use client';

import { Button, ButtonVariant } from '@/components/ui/Button';
import { IoMdClose } from 'react-icons/io';
import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/classNames';
import { AnimatePresence, motion } from '@/lib/motion';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  /** Khi `isLoading`, ưu tiên hơn bản dịch mặc định (ví dụ tác vụ không phải xóa). */
  confirmLoadingText?: string;
  icon?: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
  confirmDisabled?: boolean;
  confirmVariant?: ButtonVariant;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  confirmLoadingText,
  icon,
  showCloseButton = true,
  className = '',
  children,
  isLoading = false,
  confirmDisabled = false,
  confirmVariant = 'danger',
}) => {
  const confirmLabel = confirmText ?? 'Xác nhận';
  const cancelLabel = cancelText ?? 'Hủy';
  const titleLabel = title ?? 'Xác nhận';
  const loadingLabel = confirmLoadingText ?? 'Đang xử lý...';
  const onCancelRef = useRef(onCancel);
  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (isLoading) return;
      if (e.target === e.currentTarget) {
        onCancel();
      }
    },
    [isLoading, onCancel],
  );

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || isLoading) return;
      onCancelRef.current();
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, isLoading]);

  if (typeof document === 'undefined') return null;

  const dialog = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 z-10">
          {showCloseButton ? (
            <Button
              onClick={onCancel}
              disabled={isLoading}
              className="size-8 hover:text-black hover:bg-[#E3E3E3]/80 absolute bg-[#E3E3E3]/50 rounded-full text-black top-3 right-3 z-10 h-8 min-h-8 w-8 shrink-0 border-none p-0"
              variant="transparent"
              aria-label="Đóng"
            >
              <IoMdClose
                className="size-5"
                aria-hidden
              />
            </Button>
          ) : null}
        </div>

        <div
          className={cn(
            'bg-white rounded-md shadow-2xl p-6 max-h-[90vh] min-w-75 max-w-[90vw] relative',
            className,
          )}
          onClick={handleDialogClick}
        >
          <div className="flex flex-col items-center justify-between gap-4">
            <div className="flex gap-3">
              {icon && <>{icon}</>}
              <div className="flex flex-col flex-1">
                <div
                  id="confirm-dialog-title"
                  className="font-semibold text-sm text-black"
                >
                  {titleLabel}
                </div>
                <div className="text-xs leading-relaxed text-gray">{message}</div>
              </div>
            </div>
            {children}
            <div className="flex gap-4 w-full justify-center">
              <Button
                variant={confirmVariant}
                className="px-5 min-w-16 py-2 font-bold "
                onClick={onConfirm}
                disabled={isLoading || confirmDisabled}
              >
                {isLoading ? loadingLabel : confirmLabel}
              </Button>
              <Button
                variant="outlinePrimary"
                className="px-5 min-w-16 py-2 font-bold"
                onClick={onCancel}
                disabled={isLoading}
              >
                {cancelLabel}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(<AnimatePresence>{open && dialog}</AnimatePresence>, document.body);
};

export default ConfirmDialog;
