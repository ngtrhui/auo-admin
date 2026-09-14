import {
  computeImageFrameLayout,
  computeResizeWidthPercent,
  hasCrossedDragThreshold,
  snapWidth,
} from './editorImageLayout';

describe('computeImageFrameLayout', () => {
  it('ảnh full không xoay → flowMode, không aspectRatio khung', () => {
    const layout = computeImageFrameLayout({}, 2);
    expect(layout.flowMode).toBe(true);
    expect(layout.vertical).toBe(false);
    expect(layout.frameWidth).toBe('100%');
    expect(layout.frameAspectRatio).toBeUndefined();
    expect(layout.effectiveAspect).toBe(2);
    expect(layout.widthPercent).toBe(100);
  });

  it('xoay 90 → hoán đổi khung: chia aspect và aspectRatio nghịch đảo', () => {
    const layout = computeImageFrameLayout({ rotation: 90 }, 2);
    expect(layout.vertical).toBe(true);
    expect(layout.flowMode).toBe(false);
    expect(layout.frameWidth).toBe('calc(100% / 2)');
    expect(layout.frameAspectRatio).toBe(String(1 / 2));
  });

  it('cropped luôn có aspect (kể cả ảnh chưa load)', () => {
    const layout = computeImageFrameLayout(
      { cropX: 0.1, cropY: 0.1, cropW: 0.5, cropH: 0.25, cropAspect: 2 },
      null,
    );
    expect(layout.cropped).toBe(true);
    expect(layout.flowMode).toBe(false);
    expect(layout.contentAspect).toBe(2);
    expect(layout.frameAspectRatio).toBe('2');
    expect(layout.frameWidth).toBe('100%');
  });

  it('đọc width attr thành base và widthPercent', () => {
    const layout = computeImageFrameLayout({ width: '60%' }, 1);
    expect(layout.base).toBe('60%');
    expect(layout.widthPercent).toBe(60);
    expect(layout.frameWidth).toBe('60%');
  });
});

describe('snapWidth', () => {
  it('clamp [20,100] và snap bội 10', () => {
    expect(snapWidth(63)).toBe(60);
    expect(snapWidth(66)).toBe(70);
    expect(snapWidth(5)).toBe(20);
    expect(snapWidth(200)).toBe(100);
  });
});

describe('hasCrossedDragThreshold', () => {
  it('true khi vượt 3px', () => {
    expect(hasCrossedDragThreshold(0, 0)).toBe(false);
    expect(hasCrossedDragThreshold(2, 2)).toBe(false);
    expect(hasCrossedDragThreshold(5, 0)).toBe(true);
    expect(hasCrossedDragThreshold(3, 3)).toBe(true);
  });
});

describe('computeResizeWidthPercent', () => {
  const base = { startWidthPx: 500, parentWidthPx: 1000, deltaY: 0, aspect: 1 } as const;

  it('kéo handle đông tăng, tây giảm', () => {
    expect(computeResizeWidthPercent({ ...base, deltaX: 100, handle: 'e' })).toBeCloseTo(60, 5);
    expect(computeResizeWidthPercent({ ...base, deltaX: 100, handle: 'w' })).toBeCloseTo(40, 5);
  });

  it('clamp trên 100 và dưới 20', () => {
    expect(
      computeResizeWidthPercent({
        startWidthPx: 1000,
        parentWidthPx: 1000,
        deltaX: 500,
        deltaY: 0,
        handle: 'e',
        aspect: 1,
      }),
    ).toBe(100);
    expect(
      computeResizeWidthPercent({
        startWidthPx: 300,
        parentWidthPx: 1000,
        deltaX: -290,
        deltaY: 0,
        handle: 'e',
        aspect: 1,
      }),
    ).toBe(20);
  });
});
