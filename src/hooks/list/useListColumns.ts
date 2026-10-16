'use client';

import { useMemo, type DependencyList } from 'react';

import type { ColumnDef } from '@/components/ui/table.types';

/**
 * Memoizes a column factory so domain `use*Columns` hooks stay concise.
 * Callers own the dependency list (same contract as `useMemo`).
 */
export function useListColumns<TData>(
  factory: () => ColumnDef<TData>[],
  deps: DependencyList,
): ColumnDef<TData>[] {
  // React Compiler requires a literal deps array; this helper intentionally
  // forwards the caller's DependencyList (same pattern as useMemo itself).
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo -- caller owns deps
  return useMemo(factory, deps);
}
