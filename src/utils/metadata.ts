import type { Metadata } from 'next';

export const SITE_NAME = 'Ầu Ơ Admin' as const;

export const THEME_COLOR = '#0063ff' as const;

export const NOINDEX_ROBOTS: NonNullable<Metadata['robots']> = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

export type CreatePageMetadataParams = {
  title: string;
  description: string;
};

/**
 * Base URL cho robots/sitemap.
 * Production: set `NEXT_PUBLIC_APP_URL`. Fallback Vercel host hoặc localhost cho dev.
 */
export function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) {
    return raw.endsWith('/') ? raw.slice(0, -1) : raw;
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, '')}`;
  }
  return 'http://localhost:3000';
}

export function createPageMetadata({ title, description }: CreatePageMetadataParams): Metadata {
  return {
    metadataBase: new URL(resolveSiteUrl()),
    title,
    description,
    applicationName: SITE_NAME,
    robots: NOINDEX_ROBOTS,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: SITE_NAME,
    },
    other: {
      'apple-mobile-web-app-capable': 'yes',
    },
    icons: {
      icon: [
        { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
  };
}
