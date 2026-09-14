import Image from "next/image";
import Link from "next/link"
import { cn } from "@/utils/classNames";

export type ArticleAuthorFooterProps = {
  authorName: string;
  authorAvatar: string;
  /** Đoạn mở đầu bio (màu primary), ví dụ tên + chức danh. */
  bioHighlight: string;
  bioText: string;
  /** Link trang tác giả / hồ sơ (tùy chọn). */
  authorHref?: string;
  className?: string;
};

/** Khối giới thiệu tác giả cuối bài — dùng chung blog, trang tác giả. */
export function ArticleAuthorFooter({
  authorName,
  authorAvatar,
  bioHighlight,
  bioText,
  authorHref,
  className,
}: ArticleAuthorFooterProps) {
  const bioContent = (
    <p className="text-sm font-medium leading-relaxed text-black">
      <span className="font-semibold text-primary">{bioHighlight}</span> {bioText}
    </p>
  );

  return (
    <section className={cn(className)}>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-full sm:size-28">
          <Image
            src={authorAvatar}
            alt={authorName}
            width={336}
            height={336}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full min-w-0 flex-1 rounded-lg border border-primary p-4 sm:p-6">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-black sm:text-base">
            {authorName}
          </h3>
          {authorHref ? (
            <Link
              href={authorHref}
              className="block transition-opacity hover:opacity-90"
            >
              {bioContent}
            </Link>
          ) : (
            bioContent
          )}
        </div>
      </div>
    </section>
  );
}
