import type { MetadataRoute } from 'next';
import { resolveSiteUrl } from '@/utils/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${resolveSiteUrl()}/login`,
      lastModified: new Date(),
    },
  ];
}
