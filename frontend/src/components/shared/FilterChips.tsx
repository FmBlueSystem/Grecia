import { cn } from '../../lib/utils';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  options: FilterOption[];
  selected: string;
  onChange: (id: string) => void;
}

export default function FilterChips({ options, selected, onChange }: FilterChipsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
            selected === opt.id
              ? 'bg-[#0067B2] text-white border-[#0067B2]'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          )}
        >
          {opt.label}
          {opt.count !== undefined && (
            <span className={cn(
              'ml-1.5 text-xs',
              selected === opt.id ? 'text-white/70' : 'text-slate-400'
            )}>
              {opt.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
