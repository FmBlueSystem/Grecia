import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NotificationItemProps {
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  title: string;
  description: string;
  time: string;
  read?: boolean;
  onClick?: () => void;
}

export default function NotificationItem({
  icon: Icon,
  iconBg = 'bg-blue-50',
  iconColor = 'text-brand',
  title,
  description,
  time,
  read = false,
  onClick,
}: NotificationItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl transition-colors cursor-pointer',
        read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'
      )}
    >
      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', iconBg)}>
        <Icon className={cn('w-4 h-4', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm', read ? 'text-slate-700' : 'text-slate-900 font-semibold')}>
            {title}
          </p>
          {!read && <span className="w-2 h-2 rounded-full bg-brand mt-1.5 shrink-0" />}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{description}</p>
        <p className="text-[11px] text-slate-400 mt-1">{time}</p>
      </div>
    </div>
  );
}
