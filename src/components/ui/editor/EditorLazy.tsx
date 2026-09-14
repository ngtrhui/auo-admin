'use client';

import dynamic from 'next/dynamic';
import { EditorProps } from './Editor';

/**
 * Lazy-loaded ArticleEditor (Tiptap) - bundle-dynamic-imports
 * Giảm initial bundle, chỉ load khi cần (modal Add/Edit product)
 */
export const EditorLazy = dynamic<EditorProps>(
  () => import('./Editor').then((mod) => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[300px] animate-pulse rounded-lg border border-gray-200 bg-gray-50 sm:min-h-[400px] lg:min-h-[600px]"
        aria-hidden
      />
    ),
  },
);
