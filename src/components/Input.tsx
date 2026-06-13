import type { InputHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="flex flex-col gap-2 text-sm text-slate-700" htmlFor={inputId}>
      <span className="font-medium">{label}</span>
      <input
        id={inputId}
        className={cn(
          'rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          error && 'border-red-400/70 focus:border-red-400 focus:ring-red-400/20',
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
