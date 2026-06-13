import type { ReactNode } from 'react';

type NoticeProps = {
  title?: string;
  children: ReactNode;
  tone?: 'info' | 'success' | 'danger';
};

const tones = {
  info: 'border-brand-400/30 bg-brand-500/10 text-brand-50',
  success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-50',
  danger: 'border-red-400/30 bg-red-500/10 text-red-50',
};

export function Notice({ title, children, tone = 'info' }: NoticeProps) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${tones[tone]}`}>
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      <div className="text-sm leading-6">{children}</div>
    </div>
  );
}
