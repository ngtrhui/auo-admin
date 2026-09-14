import { cn } from '@/utils/classNames';

type ScoreTone = 'danger' | 'warning' | 'success';

const SCORE_TONE_STYLES: Record<
  ScoreTone,
  {
    stroke: string;
    track: string;
    text: string;
  }
> = {
  danger: {
    stroke: 'var(--color-coral)',
    track: 'color-mix(in srgb, var(--color-coral) 18%, transparent)',
    text: 'text-coral',
  },
  warning: {
    stroke: 'var(--color-orange-dark)',
    track: 'color-mix(in srgb, var(--color-orange-dark) 18%, transparent)',
    text: 'text-orange-dark',
  },
  success: {
    stroke: 'var(--color-green)',
    track: 'color-mix(in srgb, var(--color-green) 18%, transparent)',
    text: 'text-green',
  },
};

export function getScoreTone(score: number): ScoreTone {
  if (score < 40) return 'danger';
  if (score < 70) return 'warning';
  return 'success';
}

interface CircularScoreProps {
  value?: number | null;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function CircularScore({
  value,
  size = 40,
  strokeWidth = 4,
  className,
}: CircularScoreProps) {
  if (value == null) {
    return <span className={cn('text-sm font-medium text-gray', className)}>N/A</span>;
  }

  const normalizedScore = Math.max(0, Math.min(100, Math.round(value)));
  const tone = getScoreTone(normalizedScore);
  const styles = SCORE_TONE_STYLES[tone];
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
      aria-label={`SEO score ${normalizedScore} out of 100`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={styles.track}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={styles.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span className={cn('absolute text-sm font-semibold', styles.text)}>{normalizedScore}</span>
    </div>
  );
}
