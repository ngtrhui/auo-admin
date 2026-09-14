import { createPageMetadata } from '@/utils/metadata';

export const metadata = createPageMetadata({
  title: 'Đăng nhập',
  description: 'Đăng nhập vào trang quản trị Ầu Ơ Bedding',
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
