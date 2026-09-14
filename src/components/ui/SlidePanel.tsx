'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/classNames';
import { IoClose } from 'react-icons/io5';
import { Button } from './Button';

const subscribeNoop = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  titleClassName?: string;
  className?: string;
  /** `left`: menu nav; `right`: panel tài khoản / form (mặc định). */
  side?: 'left' | 'right';
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showCloseButton?: boolean;
  contentClassName?: string;
  /** Footer luôn dính đáy panel; phần nội dung phía trên cuộn độc lập. */
  footer?: React.ReactNode;
  footerClassName?: string;
  /** Panel chiếm full viewport width (vd. bộ lọc mobile). */
  fullWidth?: boolean;
  disabled?: boolean;
  /**
   * Render vào `document.body` để overlay/backdrop không bị kẹt trong stacking context
   * (vd. header sticky). Mặc định bật.
   */
  usePortal?: boolean;
}

const SlidePanel: React.FC<SlidePanelProps> = ({
  isOpen,
  onClose,
  children,
  title,
  titleClassName = '',
  className = '',
  side = 'right',
  width = 'lg',
  showCloseButton = true,
  contentClassName,
  footer,
  footerClassName,
  fullWidth = false,
  usePortal = true,
}) => {
  const mounted = useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const widthClasses = {
    sm: 'w-80 sm:w-80 md:w-96',
    md: 'w-80 sm:w-96 md:w-[450px]',
    lg: 'w-80 sm:w-96 md:w-[500px] lg:w-[550px]',
    xl: 'w-80 sm:w-96 md:w-[500px] lg:w-[600px] xl:w-[650px]',
    '2xl': 'max-w-full w-full sm:w-96 md:w-[500px] lg:w-[600px] xl:w-[700px] 2xl:w-[750px]',
    '3xl': 'max-w-full w-full sm:w-[95vw] md:w-[720px] lg:w-[860px] xl:w-[960px] 2xl:w-[1040px]',
  };

  const panel = (
    <>
      {isOpen ? (
        <div
          className="fixed top-0 right-0 bottom-0 left-0 z-100 bg-black/30 transition-opacity duration-300"
          onClick={handleBackdropClick}
        />
      ) : null}

      <div
        className={cn(
          'fixed top-0 z-120 flex h-dvh transform flex-col border-2 border-gray/20 bg-white transition-transform duration-300 ease-in-out',
          fullWidth ? 'w-full max-w-full' : 'max-w-[90vw]',
          side === 'left' ? 'left-0' : 'right-0',
          !fullWidth && widthClasses[width],
          side === 'left'
            ? isOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            : isOpen
              ? 'translate-x-0'
              : 'translate-x-full',
          !isOpen && 'pointer-events-none',
          className,
        )}
      >
        {showCloseButton ? (
          <Button
            variant="transparent"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute top-2 right-2 h-8 w-8 min-h-8 rounded-full bg-gray/20 p-0 text-black hover:bg-main-gray/20 lg:top-4 lg:right-4"
          >
            <IoClose className="size-5" />
          </Button>
        ) : null}

        {title != null ? (
          <div
            className={cn(
              'flex shrink-0 items-center justify-between border-b border-gray/20 bg-white p-3 sm:p-4',
              titleClassName,
            )}
          >
            {typeof title === 'string' ? (
              <h2 className="line-clamp-2 pr-10 text-base font-semibold text-black sm:text-lg">
                {title}
              </h2>
            ) : (
              title
            )}
          </div>
        ) : null}

        <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden')}>
          <div
            className={cn(
              'min-h-0 w-full flex-1 overflow-y-auto scrollbar',
              !footer && !contentClassName && 'flex items-start justify-center',
              contentClassName,
            )}
          >
            {children}
          </div>
          {footer ? (
            <div className={cn('shrink-0 border-t py-2 border-gray/20 bg-white', footerClassName)}>
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );

  if (usePortal) {
    if (!mounted || typeof document === 'undefined') return null;
    return createPortal(panel, document.body);
  }

  return panel;
};

export default SlidePanel;
