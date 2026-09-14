/** Làm tròn bước chia trục theo scale "đẹp" (1 / 2 / 5 × 10^n). */
function niceStep(rawStep: number): number {
  if (!Number.isFinite(rawStep) || rawStep <= 0) return 1;

  const exp = Math.floor(Math.log10(rawStep));
  const fraction = rawStep / 10 ** exp;

  let niceFraction: number;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;

  return niceFraction * 10 ** exp;
}

export type NiceYAxisOptions = {
  /** Khi true: step/max/ticks luôn số nguyên (≥ 1), có headroom phía trên data max. */
  integerOnly?: boolean;
};

/**
 * Domain + ticks trục Y dựa trên dữ liệu.
 * Luôn bắt đầu từ 0, khoảng 5 mốc.
 */
export function getNiceYAxis(
  values: number[],
  tickCount = 5,
  options?: NiceYAxisOptions,
): {
  domain: [number, number];
  ticks: number[];
} {
  const integerOnly = options?.integerOnly ?? false;
  const maxValue = Math.max(0, ...values.map((v) => (Number.isFinite(v) ? v : 0)));

  if (maxValue === 0) {
    if (integerOnly) {
      return {
        domain: [0, 4],
        ticks: [0, 1, 2, 3, 4],
      };
    }
    return {
      domain: [0, 1],
      ticks: [0, 0.25, 0.5, 0.75, 1],
    };
  }

  let step = niceStep(maxValue / Math.max(tickCount - 1, 1));
  if (integerOnly) {
    step = Math.max(1, step);
  }

  let niceMax = Math.ceil(maxValue / step) * step;
  if (integerOnly && niceMax <= maxValue) {
    niceMax += step;
  }

  const ticks: number[] = [];
  for (let value = 0; value <= niceMax + step / 2; value += step) {
    ticks.push(integerOnly ? Math.round(value) : Number(value.toFixed(10)));
  }

  if (integerOnly) {
    return {
      domain: [0, niceMax],
      ticks,
    };
  }

  const pad = step * 0.05;

  return {
    domain: [-pad, niceMax + pad],
    ticks,
  };
}
