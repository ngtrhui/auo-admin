'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HiChevronDown } from 'react-icons/hi';
import { cn } from '@/utils/classNames';

export type DropdownAlign = 'left' | 'right' | 'center';

/** `bottom`: mở phía dưới trigger (mặc định). `top`: mở phía trên. Với `usePortal`, tự lật nếu viewport thiếu chỗ. */
export type DropdownPlacement = 'bottom' | 'top';

/** Props gắn vào trigger khi `hoverMode={false}` (mở bằng click). Khi `hoverMode={true}`, nhận object rỗng. */
export type DropdownTriggerProps = {
  id: string;
  'aria-expanded': boolean;
  'aria-haspopup': 'menu';
  'aria-controls': string;
  onClick: React.MouseEventHandler<HTMLElement>;
};

export type DropdownTriggerRenderArgs = {
  arrow: React.ReactNode;
  /** Luôn có thể spread `{...triggerProps}`; khi hover mode thì rỗng. */
  triggerProps: DropdownTriggerProps | Record<string, never>;
};

const alignPositionClasses: Record<DropdownAlign, string> = {
  left: 'left-0 right-auto translate-x-0',
  right: 'right-0 left-auto translate-x-0',
  center: 'left-1/2 right-auto -translate-x-1/2',
};

function placementClasses(placement: DropdownPlacement, hoverMode: boolean): string {
  if (placement === 'top') {
    return hoverMode ? 'bottom-full' : 'bottom-full mb-2';
  }
  return hoverMode ? 'top-full' : 'top-full mt-2';
}

function findScrollableParent(element: HTMLElement | null): HTMLElement | null {
  if (!element) return null;
  let parent = element.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY || style.overflow;
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      parent.scrollHeight > parent.clientHeight
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

function isTriggerVisibleInScrollArea(
  triggerRect: DOMRect,
  scrollableParent: HTMLElement | null,
): boolean {
  if (scrollableParent) {
    const parentRect = scrollableParent.getBoundingClientRect();
    return (
      triggerRect.bottom > parentRect.top &&
      triggerRect.top < parentRect.bottom &&
      triggerRect.right > parentRect.left &&
      triggerRect.left < parentRect.right
    );
  }
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const vw = window.innerWidth || document.documentElement.clientWidth;
  return (
    triggerRect.bottom > 0 && triggerRect.top < vh && triggerRect.right > 0 && triggerRect.left < vw
  );
}

/**
 * Portal: chọn placement thực tế theo viewport — ưu tiên `preferred` (mặc định bottom),
 * nếu phía đó không đủ chỗ cho cả menu thì lật sang phía còn lại để menu vẫn hiện được
 * và trigger không bị che bởi panel (khi cả hai phía đều thiếu chỗ, chọn phía còn nhiều không gian hơn).
 */
function resolvePortalPlacement(
  triggerRect: DOMRect,
  menuHeight: number,
  preferred: DropdownPlacement,
  gap: number,
): DropdownPlacement {
  const pad = 8;
  const vh = window.innerHeight || document.documentElement.clientHeight;

  const bottomEdge = triggerRect.bottom + gap + menuHeight;
  const fitsBelow = bottomEdge <= vh - pad;

  const topEdge = triggerRect.top - gap - menuHeight;
  const fitsAbove = topEdge >= pad;

  const spaceBelow = vh - pad - triggerRect.bottom - gap;
  const spaceAbove = triggerRect.top - gap - pad;

  if (preferred === 'bottom') {
    if (fitsBelow) return 'bottom';
    if (fitsAbove) return 'top';
    return spaceBelow >= spaceAbove ? 'bottom' : 'top';
  }

  if (fitsAbove) return 'top';
  if (fitsBelow) return 'bottom';
  return spaceAbove >= spaceBelow ? 'top' : 'bottom';
}

/**
 * Portal: `position: fixed` theo viewport — tính góc trên-trái của menu (không dùng transform),
 * để căn chỉnh đúng với nút trigger.
 */
function applyPortalMenuPosition(
  menu: HTMLElement,
  triggerRect: DOMRect,
  placement: DropdownPlacement,
  align: DropdownAlign,
  gap: number,
  matchTriggerWidth?: boolean,
): void {
  const mw = matchTriggerWidth ? triggerRect.width : menu.offsetWidth;
  const mh = menu.offsetHeight;

  let top: number;
  if (placement === 'bottom') {
    top = triggerRect.bottom + gap;
  } else {
    top = triggerRect.top - gap - mh;
  }

  let left: number;
  if (align === 'left') {
    left = triggerRect.left;
  } else if (align === 'right') {
    left = triggerRect.right - mw;
  } else {
    left = triggerRect.left + triggerRect.width / 2 - mw / 2;
  }

  const pad = 8;
  top = Math.max(pad, Math.min(top, window.innerHeight - mh - pad));
  left = Math.max(pad, Math.min(left, window.innerWidth - mw - pad));

  menu.style.position = 'fixed';
  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;
  menu.style.transform = 'none';
}

function clearPortalMenuStyles(menu: HTMLElement | null) {
  if (!menu) return;
  menu.style.removeProperty('position');
  menu.style.removeProperty('top');
  menu.style.removeProperty('left');
  menu.style.removeProperty('transform');
  menu.style.removeProperty('width');
  menu.style.removeProperty('min-width');
  menu.style.removeProperty('max-width');
  menu.style.removeProperty('box-sizing');
}

interface DropdownProps {
  children: React.ReactNode;
  trigger: (args: DropdownTriggerRenderArgs) => React.ReactNode;
  showArrow?: boolean;
  ariaLabel?: string;
  className?: string;
  containerClassName?: string;
  align?: DropdownAlign;
  /**
   * Vị trí menu so với trigger. Mặc định mở xuống dưới.
   * Với `usePortal`: viewport không đủ chỗ một phía thì tự động lật sang phía còn lại.
   */
  placement?: DropdownPlacement;
  usePortal?: boolean;
  /** Với `usePortal`: menu có cùng chiều rộng với trigger. */
  matchTriggerWidth?: boolean;
  hoverMode?: boolean;
  closeOnClickOutside?: boolean;
  closeOnItemClick?: boolean;
  arrowClassName?: string;
  /** Called when open state changes (click mode only; not hover mode). */
  onOpenChange?: (open: boolean) => void;
}

const emptyTriggerProps = {} as Record<string, never>;

const Dropdown = ({
  children,
  trigger,
  showArrow = true,
  ariaLabel,
  className,
  containerClassName,
  align = 'left',
  placement = 'bottom',
  usePortal = false,
  matchTriggerWidth = false,
  hoverMode = false,
  closeOnClickOutside = true,
  closeOnItemClick = true,
  arrowClassName,
  onOpenChange,
}: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const menuId = `${baseId}-menu`;

  const setOpenState = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      setOpen((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        if (resolved !== prev) {
          queueMicrotask(() => onOpenChange?.(resolved));
        }
        return resolved;
      });
    },
    [onOpenChange],
  );

  const toggle = useCallback(() => {
    setOpenState((o) => !o);
  }, [setOpenState]);

  useEffect(() => {
    if (hoverMode || !open || !closeOnClickOutside) return;
    const handlePointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      const inTrigger = containerRef.current?.contains(target) ?? false;
      const inMenu = menuRef.current?.contains(target) ?? false;
      if (!inTrigger && !inMenu) {
        setOpenState(false);
      }
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
    };
  }, [hoverMode, open, closeOnClickOutside, setOpenState]);

  useEffect(() => {
    if (hoverMode || !open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenState(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [hoverMode, open, setOpenState]);

  useLayoutEffect(() => {
    if (hoverMode || !usePortal || !open) {
      const closedMenu = menuRef.current;
      clearPortalMenuStyles(closedMenu);
      return;
    }

    const root = containerRef.current;
    const menu = menuRef.current;
    if (!root || !menu || typeof document === 'undefined') return;

    const gap = 8;

    const update = (checkVisibility = false) => {
      const m = menuRef.current;
      const r = containerRef.current;
      if (!m || !r) return;

      const triggerEl = r.firstElementChild as HTMLElement | null;
      if (!triggerEl) return;
      const rect = triggerEl.getBoundingClientRect();

      const scrollParent = findScrollableParent(r);

      if (checkVisibility && !isTriggerVisibleInScrollArea(rect, scrollParent)) {
        queueMicrotask(() => setOpenState(false));
        return;
      }
      // applyPortalMenuPosition(m, rect, placement, align, gap);
      if (matchTriggerWidth) {
        const w = `${rect.width}px`;
        m.style.width = w;
        m.style.minWidth = w;
        m.style.maxWidth = w;
        m.style.boxSizing = 'border-box';
      }

      const mh = m.offsetHeight;
      const resolvedPlacement =
        mh > 0 ? resolvePortalPlacement(rect, mh, placement, gap) : placement;
      applyPortalMenuPosition(m, rect, resolvedPlacement, align, gap, matchTriggerWidth);
    };

    update();
    requestAnimationFrame(() => update());

    const onScrollOrResize = () => update(true);
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    const scrollParent = findScrollableParent(root);
    scrollParent?.addEventListener('scroll', onScrollOrResize, true);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      scrollParent?.removeEventListener('scroll', onScrollOrResize, true);
      clearPortalMenuStyles(menu);
    };
  }, [open, usePortal, matchTriggerWidth, placement, align, hoverMode, setOpenState]);

  const triggerProps: DropdownTriggerProps | Record<string, never> = hoverMode
    ? emptyTriggerProps
    : {
        id: triggerId,
        'aria-expanded': open,
        'aria-haspopup': 'menu',
        'aria-controls': menuId,
        onClick: (e) => {
          e.stopPropagation();
          toggle();
        },
      };

  const arrow = showArrow ? (
    <HiChevronDown
      className={cn(
        'w-6 h-6 shrink-0 transition-transform duration-200 ease-out',
        hoverMode ? 'group-hover:rotate-180' : open && 'rotate-180',
        arrowClassName,
      )}
      aria-hidden
    />
  ) : null;

  const panelVisible = hoverMode ? undefined : open;

  const portalActive = Boolean(usePortal && !hoverMode && open && typeof document !== 'undefined');

  const menuPanel = (
    <div
      ref={menuRef}
      id={menuId}
      className={cn(
        'z-50 transition-none',
        usePortal && !hoverMode
          ? ''
          : cn('absolute', placementClasses(placement, hoverMode), alignPositionClasses[align]),
        hoverMode
          ? 'opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto'
          : panelVisible
            ? 'opacity-100 visible pointer-events-auto'
            : 'opacity-0 invisible pointer-events-none',
        'rounded-lg bg-white text-black shadow-[0px_4px_4px_0px_#0063FF1A] overflow-hidden',
        className,
      )}
      onPointerDown={(e) => {
        if (portalActive) e.stopPropagation();
      }}
    >
      <div
        role="menu"
        aria-label={ariaLabel}
        className="h-full"
        onClick={(e) => {
          if (hoverMode || !closeOnItemClick) return;
          const el = (e.target as HTMLElement).closest('[role="menuitem"], [data-dropdown-close]');
          if (el) setOpenState(false);
        }}
      >
        {children}
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex h-full flex-col items-start',
        hoverMode && 'group',
        containerClassName,
      )}
    >
      {trigger({ arrow, triggerProps })}
      {portalActive ? createPortal(menuPanel, document.body) : null}
      {!usePortal || hoverMode ? menuPanel : null}
    </div>
  );
};

export default Dropdown;
