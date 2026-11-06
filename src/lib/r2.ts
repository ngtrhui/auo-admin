import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

const PRODUCT_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type ProductImageContentType = keyof typeof PRODUCT_IMAGE_TYPES;

let r2Client: S3Client | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Thiếu cấu hình môi trường: ${name}`);
  }

  return value;
}

function getR2Client(): S3Client {
  if (r2Client) return r2Client;

  const accountId = getRequiredEnv("CLOUDFLARE_ACCOUNT_ID");

  r2Client = new S3Client({
    region: getRequiredEnv("CLOUDFLARE_R2_REGION"),
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: getRequiredEnv("CLOUDFLARE_ACCESS_KEY_ID"),
      secretAccessKey: getRequiredEnv("CLOUDFLARE_SECRET_ACCESS_KEY"),
    },
  });

  return r2Client;
}

export async function uploadProductImageToR2(
  body: Buffer,
  contentType: ProductImageContentType,
): Promise<string> {
  const extension = PRODUCT_IMAGE_TYPES[contentType];
  const key = `products/${randomUUID()}.${extension}`;

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getRequiredEnv("CLOUDFLARE_R2_BUCKET_NAME"),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  const publicBaseUrl = getRequiredEnv("CLOUDFLARE_R2_PUBLIC_URL").replace(
    /\/+$/,
    "",
  );
  return `${publicBaseUrl}/${key}`;
}
