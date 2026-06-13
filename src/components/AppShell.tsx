import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from './Button';
import { MainNav } from './navigation/MainNav';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/auth/login', { replace: true });
  }

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.24),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500 text-base font-bold text-white shadow-soft">
              RL
            </div>
            <div>
              <p className="text-sm font-semibold text-white">RotaLeve</p>
              <p className="text-xs text-slate-400">Gestão comercial mobile-first</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">{user?.email}</p>
              <p className="text-xs text-slate-400">Sessão autenticada</p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <MainNav />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-28 sm:pb-6">{children}</main>
    </div>
  );
}
