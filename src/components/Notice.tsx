import type { ReactNode } from 'react';

type NoticeProps = {
  title?: string;
  children: ReactNode;
  tone?: 'info' | 'success' | 'danger';
};

const tones = {
  info: 'border-brand-200 bg-brand-50 text-brand-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  danger: 'border-red-200 bg-red-50 text-red-800',
};

export function Notice({ title, children, tone = 'info' }: NoticeProps) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      <div className="text-sm leading-6">{children}</div>
    </div>
  );
}
