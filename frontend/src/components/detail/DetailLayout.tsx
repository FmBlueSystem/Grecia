import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BPF from './BPF';

interface BPFStep {
  label: string;
  status: 'completed' | 'active' | 'pending';
}

interface DetailLayoutProps {
  title: string;
  subtitle?: string;
  backPath: string;
  badges?: ReactNode;
  actions?: ReactNode;
  bpfSteps?: BPFStep[];
  left: ReactNode;
  right: ReactNode;
}

export default function DetailLayout({
  title,
  subtitle,
  backPath,
  badges,
  actions,
  bpfSteps,
  left,
  right,
}: DetailLayoutProps) {
  const navigate = useNavigate();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-[#0067B2] transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {badges}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {subtitle && (
          <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
        )}
      </div>

      {/* BPF */}
      {bpfSteps && <BPF steps={bpfSteps} />}

      {/* Two Column Layout */}
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-6">{left}</div>
        <div className="w-[280px] shrink-0 space-y-6">{right}</div>
      </div>
    </div>
  );
}
