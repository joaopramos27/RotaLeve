import type { ReactNode } from 'react';

type QuickActionProps = {
  title: string;
  description: string;
  icon: ReactNode;
};

export function QuickAction({ title, description, icon }: QuickActionProps) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-soft backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-200">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
        </div>
      </div>
    </article>
  );
}
