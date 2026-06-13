import type { ReactNode } from 'react';
import { LogoMark } from './LogoMark';

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl sm:p-8">
      <div className="mb-6">
        <LogoMark size="md" className="mb-4" />
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
      </div>

      <div className="space-y-5">{children}</div>

      {footer ? <div className="mt-6 text-sm text-slate-300">{footer}</div> : null}
    </div>
  );
}
