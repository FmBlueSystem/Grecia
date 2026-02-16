import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  iconBg?: string;
  iconColor?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  change,
  changeLabel = 'vs mes anterior',
  iconBg = 'bg-blue-50',
  iconColor = 'text-[#0067B2]',
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            )}
            <span className={`text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-slate-400">{changeLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
