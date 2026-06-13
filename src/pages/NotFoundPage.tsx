import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-soft backdrop-blur">
        <p className="text-sm font-semibold text-brand-300">404</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Página não encontrada</h1>
        <p className="mt-2 text-sm text-slate-300">A rota solicitada não existe no RotaLeve.</p>
        <Link to="/dashboard" className="mt-6 inline-flex text-sm font-semibold text-brand-300">
          Ir para o dashboard
        </Link>
      </div>
    </main>
  );
}
