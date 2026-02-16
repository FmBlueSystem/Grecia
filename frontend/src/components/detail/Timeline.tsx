import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  title?: string;
}

export default function Timeline({ events, title = 'Historial' }: TimelineProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-0">
        {events.map((event, i) => (
          <div key={event.id} className="flex gap-3">
            {/* Line + Dot */}
            <div className="flex flex-col items-center">
              {event.icon ? (
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                  event.iconBg || 'bg-blue-50'
                )}>
                  <event.icon className={cn('w-3.5 h-3.5', event.iconColor || 'text-brand')} />
                </div>
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-brand mt-1.5 shrink-0" />
              )}
              {i < events.length - 1 && (
                <div className="w-px flex-1 bg-slate-200 my-1" />
              )}
            </div>

            {/* Content */}
            <div className="pb-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">{event.title}</p>
              {event.description && (
                <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
              )}
              <p className="text-[11px] text-slate-400 mt-1">{event.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
