import type { ReactNode } from 'react';

type PageShellProps = {
  title: string;
  description: string;
  children?: ReactNode;
  action?: ReactNode;
};

export function PageShell({ title, description, children, action }: PageShellProps) {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                RotaLeve
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
          {children ? <div>{children}</div> : null}
        </div>
      </section>
    </div>
  );
}
