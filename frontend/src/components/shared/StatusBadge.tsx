import { cn } from '../../lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-slate-50 text-slate-600 border-slate-200',
  primary: 'bg-[#0067B2]/10 text-[#0067B2] border-[#0067B2]/20',
};

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

export default function StatusBadge({ label, variant = 'neutral', dot = false, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'success' && 'bg-emerald-500',
          variant === 'warning' && 'bg-amber-500',
          variant === 'error' && 'bg-red-500',
          variant === 'info' && 'bg-blue-500',
          variant === 'neutral' && 'bg-slate-400',
          variant === 'primary' && 'bg-[#0067B2]',
        )} />
      )}
      {label}
    </span>
  );
}
