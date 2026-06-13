import type { ReactNode } from 'react';

type QuickActionProps = {
  title: string;
  description: string;
  icon: ReactNode;
};

export function QuickAction({ title, description, icon }: QuickActionProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
    </article>
  );
}
