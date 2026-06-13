import type { InputHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="flex flex-col gap-2 text-sm text-slate-200" htmlFor={inputId}>
      <span className="font-medium">{label}</span>
      <input
        id={inputId}
        className={cn(
          'rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30',
          error && 'border-red-400/70 focus:border-red-400 focus:ring-red-400/20',
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-red-300">{error}</span> : null}
    </label>
  );
}
