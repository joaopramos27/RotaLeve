type FullScreenLoaderProps = {
  label: string;
};

export function FullScreenLoader({ label }: FullScreenLoaderProps) {
  return (
    <div className="flex min-h-full items-center justify-center bg-slate-50 px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-soft">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        <p className="text-sm text-slate-600">{label}</p>
      </div>
    </div>
  );
}
