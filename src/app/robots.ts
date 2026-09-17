import type { MetadataRoute } from 'next';
import { resolveSiteUrl } from '@/utils/metadata';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolveSiteUrl();

  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
