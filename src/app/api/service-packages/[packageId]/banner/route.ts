import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { uploadServicePackageBannerToR2 } from '@/lib/r2';

const MAX_BANNER_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(
  request: Request,
  context: { params: Promise<{ packageId: string }> },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { packageId } = await context.params;
  const normalizedPackageId = packageId?.trim();

  if (!normalizedPackageId) {
    return NextResponse.json({ message: 'packageId không hợp lệ.' }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'Thiếu file ảnh.' }, { status: 400 });
  }

  const contentType = file.type || 'image/jpeg';

  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    return NextResponse.json({ message: 'Định dạng ảnh không được hỗ trợ.' }, { status: 400 });
  }

  if (file.size > MAX_BANNER_SIZE_BYTES) {
    return NextResponse.json(
      { message: 'Ảnh vượt quá dung lượng cho phép (2MB).' },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadServicePackageBannerToR2(normalizedPackageId, buffer, contentType);

    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tải ảnh banner thất bại.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
