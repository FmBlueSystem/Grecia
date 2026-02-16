import type { ReactNode } from 'react';

interface InfoField {
  label: string;
  value: ReactNode;
}

interface InfoCardProps {
  title: string;
  fields: InfoField[];
  action?: ReactNode;
}

export default function InfoCard({ title, fields, action }: InfoCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {action}
      </div>
      <div className="space-y-3">
        {fields.map((field, i) => (
          <div key={i}>
            <p className="text-xs text-slate-400 font-medium mb-0.5">{field.label}</p>
            <div className="text-sm text-slate-900">{field.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
