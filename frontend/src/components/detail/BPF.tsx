import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BPFStep {
  label: string;
  status: 'completed' | 'active' | 'pending';
}

interface BPFProps {
  steps: BPFStep[];
}

export default function BPF({ steps }: BPFProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
      <div className="flex items-center">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-initial">
            {/* Step Circle */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  step.status === 'completed' && 'bg-emerald-500 text-white',
                  step.status === 'active' && 'bg-brand text-white ring-4 ring-brand/20',
                  step.status === 'pending' && 'bg-slate-100 text-slate-400 border border-slate-200'
                )}
              >
                {step.status === 'completed' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  step.status === 'completed' && 'text-emerald-600',
                  step.status === 'active' && 'text-brand font-semibold',
                  step.status === 'pending' && 'text-slate-400'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {i < steps.length - 1 && (
              <div className="flex-1 mx-3">
                <div
                  className={cn(
                    'h-0.5 rounded-full',
                    step.status === 'completed' ? 'bg-emerald-300' : 'bg-slate-200'
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
