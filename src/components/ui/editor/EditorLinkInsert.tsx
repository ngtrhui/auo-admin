'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { FiLink } from 'react-icons/fi';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { DEFAULT_LIST_PAGE, DEFAULT_LIST_PER_PAGE } from '@/constants/list-search-params';
import { useDebounce } from '@/hooks/useDebounce';
import {
  createEditorLinkSchema,
  EDITOR_LINK_DEFAULT_VALUES,
  type EditorLinkFormValues,
} from '@/schemas/editor-link.schema';
import { blogPostsService } from '@/services/blog-posts.service';
import { BLOG_PUBLIC_BASE_URL } from '@/utils/blog';
import { BLOG_POST_LIST_QUERY_KEY } from '@/utils/blog-query';
import { cn } from '@/utils/classNames';
import {
  applyEditorLink,
  readLinkFormFromEditor,
  removeEditorLink,
  stripTiptapAutolinkNofollowFromActiveLink,
} from '@/utils/editor/editorLink';
import { bindEditorLinkModalOpener } from '@/utils/editor/editorLinkExtension';

interface EditorLinkInsertProps {
  editor: TiptapEditor;
  disabled?: boolean;
}

export default function EditorLinkInsert({ editor, disabled }: EditorLinkInsertProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [savedLinkRange, setSavedLinkRange] = useState<{ from: number; to: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchDropdownStyle, setSearchDropdownStyle] = useState<React.CSSProperties>({});
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const requireLinkTextRef = useRef(true);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm<EditorLinkFormValues>({
    resolver: async (values, context, options) =>
      zodResolver(createEditorLinkSchema(requireLinkTextRef.current))(values, context, options),
    defaultValues: EDITOR_LINK_DEFAULT_VALUES,
  });

  const linkState = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      const attrs = ed.getAttributes('link');
      const href = typeof attrs.href === 'string' ? attrs.href : '';

      return {
        isLinkActive: ed.isActive('link'),
        linkHref: href,
      };
    },
  });

  const { isLinkActive, linkHref } = linkState;

  const linkTooltip = isLinkActive
    ? linkHref
      ? `Liên kết: ${linkHref} — Bấm để chỉnh sửa (Ctrl+K)`
      : 'Bấm để chỉnh sửa liên kết (Ctrl+K)'
    : 'Chèn liên kết (Ctrl+K)';

  const { data: blogPostsResponse, isLoading: isBlogPostsLoading } = useQuery({
    queryKey: [...BLOG_POST_LIST_QUERY_KEY, 'editor-link', debouncedSearch.trim()],
    queryFn: () =>
      blogPostsService.getListBlogPosts({
        page: DEFAULT_LIST_PAGE,
        perPage: DEFAULT_LIST_PER_PAGE,
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      }),
    enabled: isOpen && isSearchOpen,
  });

  const blogPosts = blogPostsResponse?.result ?? [];

  useEffect(() => {
    if (!isSearchOpen) return;

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const inTrigger = searchContainerRef.current?.contains(target) ?? false;
      const inMenu = searchDropdownRef.current?.contains(target) ?? false;
      if (!inTrigger && !inMenu) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
    };
  }, [isSearchOpen]);

  useLayoutEffect(() => {
    if (!isSearchOpen || !searchContainerRef.current) return;

    const updatePosition = () => {
      const rect = searchContainerRef.current?.getBoundingClientRect();
      if (!rect) return;

      setSearchDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 110,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isSearchOpen, searchQuery, blogPosts.length, isBlogPostsLoading]);

  const openModal = useCallback(() => {
    const editing = editor.isActive('link');

    if (editing) {
      editor.chain().focus().extendMarkRange('link').run();
    }

    const { from, to } = editor.state.selection;
    setSavedLinkRange(from !== to ? { from, to } : null);
    requireLinkTextRef.current = from === to;
    setIsEditingLink(editing);

    if (editing) {
      stripTiptapAutolinkNofollowFromActiveLink(editor);
      reset(readLinkFormFromEditor(editor));
    } else {
      const fromEditor = readLinkFormFromEditor(editor);
      reset({
        ...EDITOR_LINK_DEFAULT_VALUES,
        url: fromEditor.url,
        linkText: fromEditor.linkText,
        linkTitle: fromEditor.linkTitle,
      });
    }

    setSearchQuery('');
    setIsSearchOpen(false);
    setIsOpen(true);
  }, [editor, reset]);

  useEffect(() => {
    bindEditorLinkModalOpener(editor, openModal);
    return () => bindEditorLinkModalOpener(editor, undefined);
  }, [editor, openModal]);

  const clearSeoRelFlags = () => {
    setValue('nofollow', false);
    setValue('sponsored', false);
  };

  const handleUrlPaste = () => {
    requestAnimationFrame(() => clearSeoRelFlags());
  };

  const closeModal = () => {
    setIsOpen(false);
    setIsEditingLink(false);
    setIsSearchOpen(false);
    setSavedLinkRange(null);
    reset(EDITOR_LINK_DEFAULT_VALUES);
  };

  const submitLinkForm = handleSubmit((data) => {
    applyEditorLink(editor, data, savedLinkRange);
    closeModal();
  });

  const handleApply = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    void submitLinkForm();
  };

  const handleFieldKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    e.stopPropagation();
    void submitLinkForm();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveLink = () => {
    if (savedLinkRange) {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: savedLinkRange.from, to: savedLinkRange.to })
        .extendMarkRange('link')
        .unsetLink()
        .run();
    } else {
      removeEditorLink(editor);
    }

    closeModal();
  };

  const handleSelectPost = (slug: string, title: string) => {
    setValue('url', `${BLOG_PUBLIC_BASE_URL}/${slug}`, { shouldValidate: true });
    clearErrors('url');

    if (!getValues('linkText').trim()) {
      setValue('linkText', title, { shouldValidate: true });
      clearErrors('linkText');
    }

    setIsSearchOpen(false);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <Button
              type="button"
              variant="transparent"
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={openModal}
              title={linkTooltip}
              aria-label={linkTooltip}
              className={cn(
                'h-auto rounded p-2 text-black enabled:hover:bg-gray/20',
                isLinkActive && 'bg-primary-light text-primary',
                disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <FiLink className="size-5" />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">{linkTooltip}</TooltipContent>
      </Tooltip>

      <Modal
        open={isOpen}
        onClose={closeModal}
        title={isEditingLink ? 'Cập nhật liên kết' : 'Thêm đường dẫn'}
        className="w-2xl"
        contentClassName="p-0"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            {isEditingLink ? (
              <Button
                type="button"
                variant="danger"
                onClick={handleRemoveLink}
              >
                Gỡ liên kết
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleApply}
              >
                Áp dụng
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6 p-4 lg:p-6">
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-black">Nhập địa chỉ đích</h3>

            <div className="flex flex-col gap-3">
              <Input
                label="URL"
                variant="outlined"
                placeholder="https://"
                fullWidth
                className="h-10 text-sm"
                error={errors.url?.message}
                {...register('url')}
                onPaste={handleUrlPaste}
                onKeyDown={handleFieldKeyDown}
              />

              <Input
                label="Tên đường dẫn"
                variant="outlined"
                fullWidth
                className="h-10 text-sm"
                error={errors.linkText?.message}
                {...register('linkText')}
                onKeyDown={handleFieldKeyDown}
              />

              <Input
                label="Tiêu đề liên kết"
                variant="outlined"
                placeholder="Tooltip khi hover — tùy chọn"
                fullWidth
                className="h-10 text-sm"
                error={errors.linkTitle?.message}
                {...register('linkTitle')}
                onKeyDown={handleFieldKeyDown}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Checkbox
                label="Mở liên kết trong 1 thẻ mới"
                className="select-none"
                {...register('openInNewTab')}
              />
              <Checkbox
                label={'Thêm rel="nofollow"'}
                className="select-none"
                {...register('nofollow')}
              />
              <Checkbox
                label={'Thêm rel="sponsored"'}
                className="select-none"
                {...register('sponsored')}
              />
            </div>
          </section>

          <section className="space-y-3 border-t border-gray/20 pt-4">
            <h3 className="text-sm font-bold text-black">Hoặc liên kết đến nội dung đã tồn tại</h3>

            <div
              ref={searchContainerRef}
              className="relative"
            >
              <Input
                label="Tìm kiếm"
                variant="outlined"
                value={searchQuery}
                className="h-10 text-sm"
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setIsSearchOpen(true)}
                onClick={() => setIsSearchOpen(true)}
                fullWidth
              />

              {isSearchOpen && typeof document !== 'undefined'
                ? createPortal(
                    <div
                      ref={searchDropdownRef}
                      style={searchDropdownStyle}
                      className="overflow-hidden rounded-lg border border-gray/20 bg-white shadow-[0px_4px_4px_0px_#0063FF1A]"
                    >
                      <div className="max-h-40 overflow-y-auto scrollbar">
                        {isBlogPostsLoading ? (
                          <div className="flex items-center justify-center gap-2 px-3 py-3">
                            <div
                              className="size-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent"
                              aria-hidden
                            />
                            <p className="text-sm font-medium text-gray">Đang tải...</p>
                          </div>
                        ) : blogPosts.length === 0 ? (
                          <p className="px-3 py-3 text-center text-sm font-medium text-gray">
                            Không tìm thấy bài viết.
                          </p>
                        ) : (
                          <ul>
                            {blogPosts.map((post) => (
                              <li key={post.id}>
                                <Button
                                  type="button"
                                  variant="transparent"
                                  role="menuitem"
                                  onClick={() => handleSelectPost(post.slug, post.title)}
                                  className="h-auto w-full justify-start rounded-none px-3 py-2 text-left text-sm font-normal text-black hover:bg-gray/10"
                                >
                                  {post.title}
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>,
                    document.body,
                  )
                : null}
            </div>
          </section>
        </div>
      </Modal>
    </>
  );
}
