import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export function FormInput({ label, error, required, className, ...props }: InputProps) {
  return (
    <FormField label={label} error={error} required={required}>
      <input
        className={cn(
          'w-full px-3 py-2 bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all',
          error ? 'border-red-300' : 'border-slate-200',
          className
        )}
        {...props}
      />
    </FormField>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
}

export function FormSelect({ label, error, required, options, className, ...props }: SelectProps) {
  return (
    <FormField label={label} error={error} required={required}>
      <select
        className={cn(
          'w-full px-3 py-2 bg-white border rounded-lg text-sm text-slate-900',
          'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all',
          error ? 'border-red-300' : 'border-slate-200',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </FormField>
  );
}
