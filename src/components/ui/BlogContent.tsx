import { cn } from '@/utils/classNames';
import { prepareBlogContentHtml } from '@/utils/blog-content/prepareBlogContentHtml';
import { BLOG_CONTENT_CLASS } from '@/utils/blog-content/blogContentStyles';

type BlogContentProps = {
  content: string;
  className?: string;
  as?: 'article' | 'div';
};

export function BlogContent({ content, className, as: Tag = 'article' }: BlogContentProps) {
  const html = prepareBlogContentHtml(content);
  if (!html) return null;

  return (
    <Tag
      className={cn(BLOG_CONTENT_CLASS, className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
