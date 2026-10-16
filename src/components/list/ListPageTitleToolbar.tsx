'use client';

import ListSearchToolbar, {
  type ListSearchToolbarProps,
} from '@/components/list/ListSearchToolbar';
import { cn } from '@/utils/classNames';

export interface ListPageTitleToolbarProps extends ListSearchToolbarProps {
  title?: string;
  description?: string;
  /** Extra classes for the title + toolbar wrapper (ignored when title is omitted). */
  containerClassName?: string;
}

export default function ListPageTitleToolbar({
  title,
  description,
  className,
  containerClassName,
  ...toolbarProps
}: ListPageTitleToolbarProps) {
  const toolbar = (
    <ListSearchToolbar
      createLabel="Thêm mới"
      refreshLabel="Làm mới"
      {...toolbarProps}
      className={cn(title ? 'w-full border-none px-0 py-0 sm:px-0 sm:py-0' : undefined, className)}
    />
  );

  if (!title) {
    return toolbar;
  }

  return (
    <div
      className={cn(
        'flex flex-col items-stretch gap-3 px-4 py-3 sm:px-6 sm:py-4',
        containerClassName,
      )}
    >
      <div className="flex min-w-0 flex-col">
        <h1 className="shrink-0 text-lg font-bold text-black sm:text-xl lg:text-2xl">{title}</h1>
        {description ? <p className="text-sm text-gray">{description}</p> : null}
      </div>
      {toolbar}
    </div>
  );
}
