import { cn } from '../../lib/utils';

interface SLAIndicatorProps {
  label: string;
  elapsed: string;
  total: string;
  percentage: number;
  status: 'ok' | 'warning' | 'critical';
}

export default function SLAIndicator({ label, elapsed, total, percentage, status }: SLAIndicatorProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase">{label}</span>
        <span className={cn(
          'text-xs font-bold',
          status === 'ok' && 'text-emerald-600',
          status === 'warning' && 'text-amber-600',
          status === 'critical' && 'text-red-600',
        )}>
          {elapsed} / {total}
        </span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            status === 'ok' && 'bg-emerald-500',
            status === 'warning' && 'bg-amber-500',
            status === 'critical' && 'bg-red-500',
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
