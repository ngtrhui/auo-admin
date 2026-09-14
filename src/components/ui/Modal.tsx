'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { IoMdClose } from 'react-icons/io';
import { cn } from '@/utils/classNames';
import { AnimatePresence, motion } from '@/lib/motion';
interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode | string;
  headerClassName?: string;
  showCloseButton?: boolean;
  disabled?: boolean;
  closeOnOverlayClick?: boolean;
  /** Nhãn cho dialog (a11y). Nên set khi không có tiêu đề visible. */
  'aria-label'?: string;
  footer?: React.ReactNode;
  footerClassName?: string;
  positionFooter?: 'start' | 'end' | 'center';
  contentClassName?: string;
  containerClassName?: string;
  /** Fixed max width for the dialog panel (e.g. `"672px"`). Overrides default `max-w-[95vw]`. */
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  className = '',
  headerClassName = '',
  showCloseButton = true,
  disabled = false,
  closeOnOverlayClick = true,
  'aria-label': ariaLabel,
  footer,
  title,
  footerClassName = '',
  positionFooter = 'end',
  contentClassName = '',
  maxWidth,
  containerClassName = '',
}) => {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleOverlayClick = useCallback(() => {
    if (closeOnOverlayClick && !disabled) onClose();
  }, [closeOnOverlayClick, onClose, disabled]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disabled) onCloseRef.current();
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, disabled]);

  // if (!open) return null;
  if (typeof document === 'undefined') return null;

  const hasHeader = title != null && title !== '';

  const dialog = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className={cn(
        'fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4',
        containerClassName,
      )}
      onClick={handleOverlayClick}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {showCloseButton ? (
          <Button
            onClick={() => {
              if (!disabled) onClose();
            }}
            disabled={disabled}
            className="size-6.5 hover:text-black hover:bg-[#E3E3E3]/80 absolute bg-[#E3E3E3]/50 rounded-full text-black top-3 right-3 z-10 h-8 min-h-8 w-8 shrink-0 border-none p-0"
            variant="transparent"
            aria-label="Đóng"
          >
            <IoMdClose
              className="size-5"
              aria-hidden
            />
          </Button>
        ) : null}

        <div
          className={cn(
            'relative min-w-75 max-h-[calc(100vh-2rem)] rounded-lg bg-white',
            maxWidth ? 'w-full' : 'max-w-[95vw]',
            'flex flex-col overflow-hidden',
            className,
          )}
          style={maxWidth ? { maxWidth } : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          {hasHeader && (
            <div
              className={cn(
                'flex items-center justify-start border-b relative',
                'px-4 py-3 shrink-0  border-gray/20',
                headerClassName,
              )}
            >
              {typeof title === 'string' ? (
                <h2 className="min-w-0 flex-1 truncate text-base text-center font-bold text-black md:text-lg">
                  {title}
                </h2>
              ) : (
                title
              )}
            </div>
          )}

          <div className={cn('flex-1 scrollbar', contentClassName)}>{children}</div>

          {/* Footer */}
          {footer && (
            <div
              className={cn(
                'flex items-center justify-end border-t border-gray/20',
                positionFooter === 'start' && 'justify-start',
                positionFooter === 'center' && 'justify-center',
                'gap-3 px-4 lg:px-8 py-2 lg:py-4 shrink-0',
                footerClassName,
              )}
            >
              {footer}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(<AnimatePresence>{open && dialog}</AnimatePresence>, document.body);
};

export default Modal;
