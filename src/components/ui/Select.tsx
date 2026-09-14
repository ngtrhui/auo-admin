'use client';

import {
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import type { Key } from 'react-aria-components';
import { HiCheck, HiChevronDown } from 'react-icons/hi';
import {
  Button,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  ListLayout, // thêm
  OverlayTriggerStateContext,
  Popover,
  Select as SelectRac,
  SelectStateContext,
  SelectValue,
  SelectableCollectionContext,
  SelectionIndicator,
  Virtualizer, // thêm
} from 'react-aria-components';
import { cn } from '@/utils/classNames';
import { RequiredMark } from '@/components/ui/FieldLabel';

/** RAC useOverlayPosition set inline zIndex: 100000 — override bằng style. */
const DEFAULT_POPOVER_Z_INDEX = 90;
const OPTION_ROW_HEIGHT = 40;
const EMPTY_LIST_ITEM_ID = '__empty';

export interface SelectOption {
  value: string;
  label: string;
}

type SelectFieldProps = {
  options: SelectOption[];
  placeholder?: string;
  label?: ReactNode;
  labelClassName?: string;
  /** Nhãn a11y khi không có `label` hiển thị. Mặc định dùng `placeholder`. */
  ariaLabel?: string;
  error?: string;
  required?: boolean;
  id?: string;
  icon?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  /** z-index popover — mặc định 90 (dưới header 100); trong modal dùng 110. */
  popoverZIndex?: number;
  popoverClassName?: string;

  popoverHeader?: ReactNode;
  popoverHeaderClassName?: string;
  popoverFooter?: ReactNode;
  popoverFooterClassName?: string;
  popoverContentClassName?: string;
  disabled?: boolean;
};

export type SelectProps =
  | (SelectFieldProps & {
      selectionMode?: 'single';
      value?: string;
      onChange?: (value: string) => void;
    })
  | (SelectFieldProps & {
      selectionMode: 'multiple';
      value?: string[];
      onChange?: (value: string[]) => void;
    });

function SelectTriggerChevron() {
  const state = useContext(OverlayTriggerStateContext);
  const isOpen = Boolean(state?.isOpen);
  return (
    <HiChevronDown
      className={cn(
        'h-6 w-6 shrink-0 text-gray transition-transform duration-200 ease-out',
        isOpen && 'rotate-180',
      )}
      aria-hidden
    />
  );
}

function SelectDismissOnInteractOutside({
  triggerRef,
  instanceId,
}: {
  triggerRef: RefObject<HTMLButtonElement | null>;
  instanceId: string;
}) {
  const state = useContext(SelectStateContext);

  useEffect(() => {
    if (!state?.isOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const trigger = triggerRef.current;
      const popover = document.querySelector(
        `[data-select-instance="${instanceId}"][data-trigger="Select"]`,
      );

      const inTrigger = trigger?.contains(target);
      const inPopover = popover?.contains(target);

      if (inPopover) return;

      if (inTrigger) {
        // Chặn onPress của RAC — nếu không, close() rồi toggle mở lại ngay.
        e.preventDefault();
        e.stopPropagation();
        state.close();
        return;
      }

      state.close();
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [state?.isOpen, state, triggerRef, instanceId]);

  return null;
}

const listItemClass = (isMultiple: boolean) =>
  cn(
    'flex h-full min-w-0 w-full cursor-pointer items-center gap-2 overflow-hidden px-3 py-2 text-sm text-black outline-hidden transition-colors',
    'hover:bg-gray/10 data-focus-visible:bg-gray/10',
    !isMultiple &&
      'data-selected:bg-primary-light data-selected:font-medium data-selected:text-primary',
  );

function SelectOptionItem({
  option,
  itemClassName,
  isMultiple,
}: {
  option: SelectOption;
  itemClassName: string;
  isMultiple: boolean;
}) {
  return (
    <ListBoxItem
      id={option.value}
      textValue={option.label}
      className={itemClassName}
    >
      <span className="min-w-0 flex-1 truncate">{option.label}</span>
      {isMultiple ? (
        <SelectionIndicator className="ml-auto flex size-4 shrink-0 items-center justify-center">
          <HiCheck
            className="size-4 text-primary"
            aria-hidden
          />
        </SelectionIndicator>
      ) : null}
    </ListBoxItem>
  );
}
function Select(props: SelectProps): ReactElement {
  const {
    options,
    placeholder: placeholderProp,
    label,
    labelClassName,
    ariaLabel,
    error,
    required,
    id: idProp,
    icon,
    className,
    containerClassName,
    popoverClassName,
    popoverHeader,
    popoverHeaderClassName,
    popoverFooter,
    popoverFooterClassName,
    popoverContentClassName,
    popoverZIndex,
    disabled = false,
  } = props;

  const placeholder = placeholderProp ?? 'Chọn';
  const emptyLabel = 'Chưa có dữ liệu';

  const isMultiple = props.selectionMode === 'multiple';
  const selectionMode = isMultiple ? 'multiple' : 'single';
  const hasSearchHeader = Boolean(popoverHeader);

  // THÊM — class tính 1 lần, không gọi lại cho từng option khi map.
  const itemClassName = useMemo(() => listItemClass(isMultiple), [isMultiple]);
  const listItems = useMemo(
    () =>
      options.map((option) => ({
        ...option,
        id: option.value,
      })),
    [options],
  );
  const listBoxItems = useMemo(() => {
    if (listItems.length > 0) return listItems;
    return [
      {
        id: EMPTY_LIST_ITEM_ID,
        value: EMPTY_LIST_ITEM_ID,
        label: emptyLabel,
      },
    ];
  }, [listItems, emptyLabel]);
  // THÊM — Layout instance phải được memo (yêu cầu của react-aria-components).
  const listLayout = useMemo(
    () => new ListLayout({ rowHeight: OPTION_ROW_HEIGHT, padding: 0, gap: 0 }),
    [],
  );

  // Searchable select: ListBox dùng virtual focus để không cướp DOM focus khỏi ô search khi options đổi.
  const searchableCollectionContext = useMemo(
    () => (hasSearchHeader ? { shouldUseVirtualFocus: true } : null),
    [hasSearchHeader],
  );

  const generatedId = useId();
  const instanceId = useId();
  const fieldId = idProp ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const multipleValue = props.selectionMode === 'multiple' ? props.value : undefined;
  const singleValue = props.selectionMode === 'multiple' ? undefined : props.value;

  const singleRacValue = useMemo(() => {
    const v = singleValue;
    return v && v.length > 0 ? v : null;
  }, [singleValue]);

  const handleSingleChange = (key: Key | null) => {
    if (!isMultiple && key != null && String(key) !== EMPTY_LIST_ITEM_ID) {
      props.onChange?.(String(key));
    }
  };

  const handleMultipleChange = (keys: readonly Key[]) => {
    if (isMultiple) {
      props.onChange?.(keys.map(String));
    }
  };

  const labelByValue = useMemo(() => new Map(options.map((o) => [o.value, o.label])), [options]);

  const multipleDisplayText = useMemo(() => {
    if (!multipleValue?.length) return undefined;
    return multipleValue
      .map((v) => labelByValue.get(v))
      .filter((label): label is string => Boolean(label))
      .join(', ');
  }, [multipleValue, labelByValue]);

  const selectContent = (
    <>
      {label ? (
        <Label className={cn('text-sm font-bold text-black', labelClassName)}>
          {label}
          {required ? <RequiredMark /> : null}
        </Label>
      ) : null}
      <Button
        ref={triggerRef}
        className={cn(
          'flex w-full cursor-pointer items-center gap-2 rounded-lg border border-gray/30 bg-white px-3 py-2.5 text-sm transition-colors outline-none',
          'hover:border-primary/40 data-focus-visible:border-primary data-focus-visible:ring-1 data-focus-visible:ring-primary',
          'data-pressed:border-primary font-normal',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-coral data-focus-visible:border-coral data-focus-visible:ring-coral',
          className,
        )}
      >
        {icon ? <span className="shrink-0 text-base text-gray">{icon}</span> : null}
        <SelectValue className="flex-1 truncate text-left text-black data-placeholder:text-gray">
          {({ selectedText, defaultChildren }) => {
            if (isMultiple) {
              return multipleDisplayText || defaultChildren;
            }
            return selectedText || defaultChildren;
          }}
        </SelectValue>
        <SelectTriggerChevron />
      </Button>
      {error ? <FieldError className="text-xs font-semibold text-coral">{error}</FieldError> : null}
      <Popover
        isNonModal
        data-select-instance={instanceId}
        offset={4}
        style={{ zIndex: popoverZIndex ?? DEFAULT_POPOVER_Z_INDEX }}
        className={cn(
          'w-(--trigger-width) min-w-0 max-w-(--trigger-width) max-h-60 overflow-x-hidden overscroll-x-none p-0',
          popoverClassName,
        )}
      >
        <div
          className={cn(
            'flex max-h-60 h-full flex-col overflow-hidden rounded-lg border border-gray/20 bg-white',
            popoverContentClassName,
          )}
        >
          {popoverHeader ? (
            <div className={cn('px-3 py-2 text-sm font-bold text-black', popoverHeaderClassName)}>
              {popoverHeader}
            </div>
          ) : null}
          <SelectableCollectionContext.Provider value={searchableCollectionContext}>
            <Virtualizer layout={listLayout}>
              <ListBox
                items={listBoxItems}
                selectionMode={selectionMode}
                autoFocus={hasSearchHeader ? false : undefined}
                renderEmptyState={() => (
                  <div className="px-3 py-2 text-center text-xs text-gray">{emptyLabel}</div>
                )}
                className="scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-x-none outline-hidden"
              >
                {(option) =>
                  option.value === EMPTY_LIST_ITEM_ID ? (
                    <ListBoxItem
                      id={EMPTY_LIST_ITEM_ID}
                      isDisabled
                      textValue={option.label}
                      className="px-3 py-3 text-center text-xs text-gray outline-hidden"
                    >
                      {option.label}
                    </ListBoxItem>
                  ) : (
                    <SelectOptionItem
                      option={option}
                      itemClassName={itemClassName}
                      isMultiple={isMultiple}
                    />
                  )
                }
              </ListBox>
            </Virtualizer>
          </SelectableCollectionContext.Provider>
          {popoverFooter ? (
            <div
              className={cn(
                'shrink-0 border-t border-gray/15 px-3 py-2 text-right',
                popoverFooterClassName,
              )}
            >
              {popoverFooter}
            </div>
          ) : null}
        </div>
      </Popover>
      <SelectDismissOnInteractOutside
        triggerRef={triggerRef}
        instanceId={instanceId}
      />
    </>
  );

  const racAriaLabel = label == null ? (ariaLabel ?? placeholder) : undefined;

  const racCommon = {
    id: fieldId,
    isDisabled: disabled,
    isInvalid: Boolean(error),
    placeholder,
    className: 'relative flex w-full flex-col gap-1.5',
    ...(racAriaLabel ? { 'aria-label': racAriaLabel } : {}),
  };

  return (
    <div
      ref={rootRef}
      className={cn('flex w-full flex-col gap-1.5', containerClassName)}
    >
      {isMultiple ? (
        <SelectRac
          {...racCommon}
          selectionMode="multiple"
          value={multipleValue ?? []}
          onChange={handleMultipleChange}
        >
          {selectContent}
        </SelectRac>
      ) : (
        <SelectRac
          {...racCommon}
          value={singleRacValue}
          onChange={handleSingleChange}
        >
          {selectContent}
        </SelectRac>
      )}
    </div>
  );
}

Select.displayName = 'Select';

export { Select };
