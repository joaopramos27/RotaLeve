import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
};

const base =
  'inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-brand-600 text-white shadow-soft hover:bg-brand-500',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950',
};

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
