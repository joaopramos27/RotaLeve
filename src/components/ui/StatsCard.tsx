type StatsCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function StatsCard({ label, value, hint }: StatsCardProps) {
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-2xl font-bold leading-tight text-slate-950 [overflow-wrap:anywhere]">{value}</p>
      {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
    </article>
  );
}
