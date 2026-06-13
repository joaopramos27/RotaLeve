type FullScreenLoaderProps = {
  label: string;
};

export function FullScreenLoader({ label }: FullScreenLoaderProps) {
  return (
    <div className="flex min-h-full items-center justify-center bg-slate-950 px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-8 text-center shadow-soft backdrop-blur">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-300 border-t-transparent" />
        <p className="text-sm text-slate-200">{label}</p>
      </div>
    </div>
  );
}
