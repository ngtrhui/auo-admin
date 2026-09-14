/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/utils/classNames";

interface MarkdownContentProps {
  /** Chuỗi markdown từ backend. Có thể là `null/undefined` → render fallback. */
  content?: string | null;
  className?: string;
  /** Hiển thị khi không có nội dung. Default: dấu "-" */
  emptyFallback?: React.ReactNode;
}

/**
 * Render nội dung markdown với style đã thiết kế sẵn cho project.
 * - Hỗ trợ GFM (GitHub Flavored Markdown): table, task list, strikethrough, autolink.
 * - Link mở tab mới + `rel="noopener"` cho an toàn.
 */
const COMPONENTS: Components = {
  p: ({ node, ...props }) => (
    <p className="text-sm text-black leading-relaxed" {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-bold text-black" {...props} />
  ),
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  a: ({ node, ...props }) => (
    <a
      className="text-primary underline hover:no-underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  ul: ({ node, ...props }) => (
    <ul
      className="list-disc pl-5 text-sm text-black space-y-1"
      {...props}
    />
  ),
  ol: ({ node, ...props }) => (
    <ol
      className="list-decimal pl-5 text-sm text-black space-y-1"
      {...props}
    />
  ),
  li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
  h1: ({ node, ...props }) => (
    <h1 className="text-xl font-bold text-black mt-4 mb-2" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="text-lg font-bold text-black mt-4 mb-2" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="text-base font-bold text-black mt-3 mb-1" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="border-l-4 border-primary/40 pl-4 italic text-gray"
      {...props}
    />
  ),
  code: ({ node, className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="rounded bg-gray/10 px-1 py-0.5 text-xs font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <pre className="rounded-lg bg-gray/10 p-3 overflow-x-auto text-xs font-mono">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    );
  },
  hr: () => <hr className="my-4 border-gray/30" />,
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: ({ node, ...props }) => (
    <th
      className="border border-gray/30 bg-gray/10 px-3 py-1.5 text-left font-semibold"
      {...props}
    />
  ),
  td: ({ node, ...props }) => (
    <td className="border border-gray/30 px-3 py-1.5" {...props} />
  ),
};

export function MarkdownContent({
  content,
  className,
  emptyFallback = "-",
}: MarkdownContentProps) {
  if (!content?.trim()) {
    return <p className="text-sm text-gray">{emptyFallback}</p>;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownContent;
