import { isAxiosError } from 'axios';

import axiosInstance from '@/lib/axiosInstance';
import { parseFilenameFromContentDisposition } from '@/utils/downloadBlob';

async function messageFromBlobError(data: Blob, fallback: string): Promise<string> {
  try {
    const text = await data.text();
    const parsed = JSON.parse(text) as { message?: string };
    if (parsed.message?.trim()) return parsed.message.trim();
  } catch {
    // ignore parse errors
  }
  return fallback;
}

export async function downloadExcelExport(
  endpoint: string,
  fallbackFilename: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): Promise<{ blob: Blob; filename: string }> {
  try {
    const response = await axiosInstance.get<Blob>(endpoint, {
      responseType: 'blob',
      params,
    });

    const blob = response.data;
    const contentType = String(response.headers['content-type'] ?? '');

    if (contentType.includes('application/json')) {
      throw new Error(await messageFromBlobError(blob, 'Không thể tải xuống file Excel'));
    }

    const filename = parseFilenameFromContentDisposition(
      response.headers['content-disposition'],
      fallbackFilename,
    );

    return { blob, filename };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data instanceof Blob) {
      throw new Error(
        await messageFromBlobError(error.response.data, 'Không thể tải xuống file Excel'),
      );
    }
    throw error;
  }
}
