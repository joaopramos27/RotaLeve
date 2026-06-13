type StatsCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function StatsCard({ label, value, hint }: StatsCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-slate-900/60 p-4 shadow-soft">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {hint ? <p className="mt-1 text-sm text-slate-400">{hint}</p> : null}
    </article>
  );
}
