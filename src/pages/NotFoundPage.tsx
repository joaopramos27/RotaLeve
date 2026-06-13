import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <p className="text-sm font-semibold text-brand-700">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Pagina nao encontrada</h1>
        <p className="mt-2 text-sm text-slate-600">A rota solicitada nao existe no RotaLeve.</p>
        <Link to="/dashboard" className="mt-6 inline-flex text-sm font-semibold text-brand-700">
          Ir para o dashboard
        </Link>
      </div>
    </main>
  );
}
