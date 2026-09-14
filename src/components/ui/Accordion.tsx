'use client';

import { useId, useState, type ReactNode } from 'react';
import { FiChevronDown } from 'react-icons/fi';

import { Button } from '@/components/ui/Button';
import { AnimatePresence, motion } from '@/lib/motion';
import { cn } from '@/utils/classNames';

export interface AccordionProps {
  children: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  contentClassName?: string;
  headerActions?: ReactNode;
  showToggle?: boolean;
  expandAriaLabel?: string;
  collapseAriaLabel?: string;
}

export default function Accordion({
  children,
  title,
  description,
  icon,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  className,
  contentClassName,
  headerActions,
  showToggle = true,
  expandAriaLabel = 'Mở rộng',
  collapseAriaLabel = 'Thu gọn',
}: AccordionProps) {
  const contentId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const isOpen = isControlled ? openProp : uncontrolledOpen;

  const toggle = () => {
    const next = !isOpen;

    if (!isControlled) {
      setUncontrolledOpen(next);
    }

    onOpenChange?.(next);
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg bg-white p-3 shadow-[0px_3px_8px_0px_#0063FF33] space-y-2 lg:p-4',
        className,
      )}
    >
      <div className="flex items-start md:gap-3 sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {icon ? (
            <div className="flex md:size-11 size-8 shrink-0 items-center justify-center rounded-lg bg-primary-light">
              {icon}
            </div>
          ) : null}

          <div className="min-w-0">
            <p className="md:text-base text-sm font-bold text-black">{title}</p>
            {description ? <p className="md:text-sm text-xs text-gray">{description}</p> : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
          {headerActions}

          {showToggle ? (
            <Button
              type="button"
              variant="transparent"
              size="sm"
              className="md:size-10 size-8 shrink-0 p-0 text-gray enabled:hover:bg-gray/10 enabled:hover:text-black"
              aria-expanded={isOpen}
              aria-controls={contentId}
              aria-label={isOpen ? collapseAriaLabel : expandAriaLabel}
              onClick={toggle}
            >
              <FiChevronDown
                className={cn(
                  'size-5 transition-transform duration-300 ease-out',
                  isOpen && 'rotate-180',
                )}
              />
            </Button>
          ) : null}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={contentId}
            key="accordion-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className={cn('overflow-hidden border-t border-gray/20 pt-2', contentClassName)}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
