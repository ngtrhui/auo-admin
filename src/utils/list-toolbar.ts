import { Children, Fragment, isValidElement, type ReactNode } from 'react';

const MAX_INLINE_TOOLBAR_ACTIONS = 4;

function flattenToolbarNodes(node: ReactNode): unknown[] {
  return Children.toArray(node).flatMap((child) => {
    if (isValidElement(child) && child.type === Fragment) {
      return flattenToolbarNodes((child.props as { children?: ReactNode }).children);
    }

    return [child];
  });
}

/** Split when filters sit with extra trailing actions, or there are more than four buttons. */
export function shouldSplitListToolbarActions({
  children,
  onCreate,
  onRefresh,
  trailing,
}: {
  children?: ReactNode;
  onCreate?: unknown;
  onRefresh?: unknown;
  trailing?: ReactNode;
}): boolean {
  if (children && trailing) return true;

  const actionCount =
    Number(Boolean(onCreate)) + Number(Boolean(onRefresh)) + flattenToolbarNodes(trailing).length;

  return actionCount > MAX_INLINE_TOOLBAR_ACTIONS;
}
