export type ImageCropPreset = {
  id: 'avatar' | 'editor';
  aspect: { w: number; h: number };
  output: { w: number; h: number };
  displayTargetW: number;
  stageClassName: string;
  previewVariant: 'circle' | 'rect';
  exportFileName: string;
  minMarqueeW: number;
  minMarqueeH: number;
};

export const AVATAR_CROP_PRESET: ImageCropPreset = {
  id: 'avatar',
  aspect: { w: 1, h: 1 },
  output: { w: 512, h: 512 },
  displayTargetW: 172,
  stageClassName:
    'relative aspect-video min-h-[240px] w-full flex-1 touch-none overflow-hidden rounded-2xl bg-neutral-200',
  previewVariant: 'circle',
  exportFileName: 'avatar.webp',
  minMarqueeW: 72,
  minMarqueeH: 72,
};

export const EDITOR_CROP_PRESET: ImageCropPreset = {
  id: 'editor',
  aspect: { w: 1, h: 1 },
  output: { w: 2048, h: 2048 },
  displayTargetW: 280,
  stageClassName:
    'relative min-h-[min(60vh,480px)] w-full touch-none overflow-hidden rounded-lg bg-neutral-200',
  previewVariant: 'rect',
  exportFileName: 'editor-crop.webp',
  minMarqueeW: 48,
  minMarqueeH: 48,
};

export type ImageCropAspectOption = {
  id: string;
  label: string;
  aspect: { w: number; h: number } | null;
};

export const EDITOR_CROP_ASPECT_OPTIONS: ImageCropAspectOption[] = [
  { id: 'free', label: 'Tự do', aspect: null },
  { id: '1:1', label: '1:1', aspect: { w: 1, h: 1 } },
  { id: '4:3', label: '4:3', aspect: { w: 4, h: 3 } },
  { id: '16:9', label: '16:9', aspect: { w: 16, h: 9 } },
  { id: '3:4', label: '3:4', aspect: { w: 3, h: 4 } },
];
