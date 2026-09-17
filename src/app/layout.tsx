import type { Viewport } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { SessionShell } from '@/components/providers/SessionShell';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { MotionProvider } from '@/components/providers/MotionProvider';
import { createPageMetadata, SITE_NAME, THEME_COLOR } from '@/utils/metadata';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata = createPageMetadata({
  title: SITE_NAME,
  description: 'Trang quản trị Ầu Ơ',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: THEME_COLOR,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} h-dvh antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden">
        <NuqsAdapter>
          <SessionShell>
            <QueryProvider>
              <MotionProvider>{children}</MotionProvider>
            </QueryProvider>
          </SessionShell>
        </NuqsAdapter>
      </body>
    </html>
  );
}
