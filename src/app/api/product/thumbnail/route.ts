import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  uploadProductImageToR2,
  type ProductImageContentType,
} from "@/lib/r2";

const MAX_PRODUCT_IMAGE_BYTES = 10 * 1024 * 1024;
const PRODUCT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const runtime = "nodejs";
const ALLOWED_MIME_TYPES = new Set<string>(PRODUCT_IMAGE_TYPES);

function isProductImageContentType(
  contentType: string,
): contentType is ProductImageContentType {
  return ALLOWED_MIME_TYPES.has(contentType);
}

function isValidImageContent(file: File, body: Buffer): boolean {
  if (file.type === "image/jpeg") {
    return (
      body.length >= 3 &&
      body[0] === 0xff &&
      body[1] === 0xd8 &&
      body[2] === 0xff
    );
  }

  if (file.type === "image/png") {
    return (
      body.length >= 8 &&
      body
        .subarray(0, 8)
        .equals(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        )
    );
  }

  return (
    file.type === "image/webp" &&
    body.length >= 12 &&
    body.toString("ascii", 0, 4) === "RIFF" &&
    body.toString("ascii", 8, 12) === "WEBP"
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  let originUrl: URL;
  try {
    if (!origin) throw new Error("Missing Origin header.");
    originUrl = new URL(origin);
  } catch {
    return NextResponse.json(
      { message: "Yêu cầu không hợp lệ." },
      { status: 403 },
    );
  }
  if (originUrl.origin !== new URL(request.url).origin) {
    return NextResponse.json(
      { message: "Yêu cầu không hợp lệ." },
      { status: 403 },
    );
  }

  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    session.user.role !== "ADMIN" ||
    !session.token?.accessToken ||
    session.error === "RefreshAccessTokenError"
  ) {
    return NextResponse.json(
      { message: "Vui lòng đăng nhập để tải ảnh." },
      { status: 401 },
    );
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_PRODUCT_IMAGE_BYTES + 64 * 1024
  ) {
    return NextResponse.json(
      { message: "Ảnh sản phẩm không được lớn hơn 10 MB." },
      { status: 413 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Dữ liệu ảnh không hợp lệ." },
      { status: 400 },
    );
  }

  const image = formData.get("file");
  if (!(image instanceof File)) {
    return NextResponse.json(
      { message: "Thiếu file ảnh sản phẩm." },
      { status: 400 },
    );
  }
  if (!isProductImageContentType(image.type)) {
    return NextResponse.json(
      { message: "Ảnh sản phẩm chỉ nhận định dạng JPG, PNG hoặc WebP." },
      { status: 415 },
    );
  }
  if (image.size === 0) {
    return NextResponse.json(
      { message: "Ảnh sản phẩm không được rỗng." },
      { status: 400 },
    );
  }
  if (image.size > MAX_PRODUCT_IMAGE_BYTES) {
    return NextResponse.json(
      { message: "Ảnh sản phẩm không được lớn hơn 10 MB." },
      { status: 413 },
    );
  }

  const body = Buffer.from(await image.arrayBuffer());
  if (!isValidImageContent(image, body)) {
    return NextResponse.json(
      { message: "Nội dung ảnh không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    const url = await uploadProductImageToR2(body, image.type);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Không thể tải ảnh sản phẩm lên R2.", error);
    return NextResponse.json(
      { message: "Không thể tải ảnh lên. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
