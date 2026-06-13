import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
};

const base =
  'inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-brand-500 text-white shadow-soft hover:bg-brand-400',
  secondary: 'bg-white/10 text-white hover:bg-white/15 border border-white/10',
  ghost: 'bg-transparent text-slate-300 hover:bg-white/5',
};

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
