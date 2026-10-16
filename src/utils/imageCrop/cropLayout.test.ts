import {
  computeNormalizedCropRect,
  isFullCropRect,
  normalizedCropToStageRect,
  type CoverLayout,
} from './cropLayout';

const layout: CoverLayout = {
  W: 1000,
  H: 500,
  offsetX: 0,
  offsetY: 0,
  drawW: 1000,
  drawH: 500,
};

const naturalSize = { w: 2000, h: 1000 };

describe('computeNormalizedCropRect', () => {
  it('chuyển offset/rect trên stage sang tỉ lệ chuẩn hoá của ảnh gốc', () => {
    const crop = computeNormalizedCropRect(
      layout,
      { x: 200, y: 100 },
      { w: 400, h: 200 },
      naturalSize,
    );

    expect(crop.x).toBeCloseTo(0.2, 5);
    expect(crop.y).toBeCloseTo(0.2, 5);
    expect(crop.w).toBeCloseTo(0.4, 5);
    expect(crop.h).toBeCloseTo(0.4, 5);
  });

  it('clamp khi vùng crop vượt biên phải/dưới', () => {
    const crop = computeNormalizedCropRect(
      layout,
      { x: 800, y: 400 },
      { w: 400, h: 200 },
      naturalSize,
    );
    expect(crop.x + crop.w).toBeLessThanOrEqual(1);
    expect(crop.y + crop.h).toBeLessThanOrEqual(1);
  });
});

describe('round-trip normalized <-> stage', () => {
  it('computeNormalizedCropRect rồi normalizedCropToStageRect giữ nguyên giá trị', () => {
    const offset = { x: 200, y: 100 };
    const rect = { w: 400, h: 200 };

    const crop = computeNormalizedCropRect(layout, offset, rect, naturalSize);
    const back = normalizedCropToStageRect(crop, layout, naturalSize);

    expect(back.offset.x).toBeCloseTo(offset.x, 3);
    expect(back.offset.y).toBeCloseTo(offset.y, 3);
    expect(back.rect.w).toBeCloseTo(rect.w, 3);
    expect(back.rect.h).toBeCloseTo(rect.h, 3);
  });
});

describe('isFullCropRect', () => {
  it('coi null hoặc phủ toàn bộ ảnh là full', () => {
    expect(isFullCropRect(null)).toBe(true);
    expect(isFullCropRect({ x: 0, y: 0, w: 1, h: 1 })).toBe(true);
  });

  it('vùng crop nhỏ hơn là không full', () => {
    expect(isFullCropRect({ x: 0.1, y: 0, w: 0.8, h: 1 })).toBe(false);
    expect(isFullCropRect({ x: 0, y: 0, w: 0.5, h: 0.5 })).toBe(false);
  });
});
