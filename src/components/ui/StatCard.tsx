import { cn } from '@/utils/classNames';
import React from 'react';
import Icon from './Icon';
import { IconType } from 'react-icons';
import { formatNumber, formatPercent } from '@/utils/format';
import { IoIosArrowRoundUp } from 'react-icons/io';

const statCardVariants = {
  variant: {
    primary: 'bg-primary text-white',
    'primary-light': 'bg-primary-light text-primary',
    'green-light': 'bg-green/10 text-green',
    green: 'bg-green text-white',
    magenta: 'bg-magenta text-white',
    orange: 'bg-orange text-white',
    'orange-light': 'bg-orange/10 text-orange',
    coral: 'bg-coral text-white',
    'coral-light': 'bg-coral/20 text-coral',
    violet: 'bg-violet text-white',
    'violet-light': 'bg-violet/10 text-violet',
    'teal-light': 'bg-[#E9F9F8] text-[#16c0a5]',
  },
};

export type StatCardVariant = keyof typeof statCardVariants.variant;

export interface StatCardProps {
  variant: StatCardVariant;
  title: string;
  value: number;
  icon: IconType | string;
  unit?: string;
  className?: string;
  growth?: number;
  showGrowth?: boolean;
}

const StatCard = ({
  variant = 'primary',
  title,
  value = 0,
  icon = '',
  unit = '',
  className = '',
  growth = 0,
  showGrowth = true,
}: StatCardProps) => {
  const ReactIcon = typeof icon === 'string' ? null : icon;

  return (
    <div
      className={cn('bg-white shadow-primary rounded-lg p-4', 'flex gap-3 items-center', className)}
    >
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
          statCardVariants.variant[variant],
        )}
      >
        {typeof icon === 'string' ? (
          <Icon
            icon={icon}
            className="size-7 bg-current"
          />
        ) : ReactIcon ? (
          <ReactIcon
            className="size-6"
            aria-hidden
          />
        ) : null}
      </div>
      <div className="flex flex-col min-w-0 flex-1 gap-1">
        <p className="text-xs font-medium text-gray">{title}</p>
        <div className="flex justify-between">
          <p className="text-2xl font-bold text-black truncate">
            {unit === '%'
              ? formatPercent(value)
              : `${formatNumber(value)}${unit ? ` ${unit}` : ''}`}
          </p>
          {showGrowth && (
            <div
              className={cn(
                'self-end shrink-0 py-0.5 px-1 rounded-md text-xs font-semibold flex items-center',
                growth < 0 ? 'bg-coral/10 text-coral' : 'bg-green/10 text-green',
              )}
            >
              <IoIosArrowRoundUp className={cn('size-5 shrink-0', growth < 0 && 'rotate-180')} />
              {`${growth}%`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
