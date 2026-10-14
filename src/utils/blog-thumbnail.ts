export const getBlogThumbnailKey = (blogId: string): string => `thumbnail/${blogId}`;

export const getBlogThumbnailPublicUrl = (blogId: string, publicBaseUrl: string): string => {
  const base = publicBaseUrl.replace(/\/$/, '');
  return `${base}/${getBlogThumbnailKey(blogId)}`;
};
