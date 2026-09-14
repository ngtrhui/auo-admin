import type { SidebarIcon } from '@/config/sidebar-nav';
import { cn } from '@/utils/classNames';
import MaskIcon from '@/components/ui/Icon';

export function NavIcon({ icon, active }: { icon: SidebarIcon; active: boolean }) {
  if (icon.type === 'react') {
    const ReactIcon = icon.icon;
    return (
      <ReactIcon
        className={cn('size-6 shrink-0 stroke-[1.5]', active ? 'text-primary' : 'text-current')}
        aria-hidden
      />
    );
  }

  return (
    <MaskIcon
      icon={icon.src}
      className={cn('size-6', active ? 'bg-primary' : 'bg-black')}
    />
  );
}
