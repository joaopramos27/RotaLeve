import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from './Button';
import { LogoMark } from './LogoMark';
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
    <div className="theme-light min-h-full bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_42%,#f8fafc_100%)]">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <LogoMark size="sm" />
            <div>
              <p className="text-sm font-semibold text-slate-950">RotaLeve</p>
              <p className="text-xs text-slate-500">Gestão comercial mobile-first</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden max-w-[230px] text-right leading-tight sm:block">
              <p className="break-all text-sm font-medium text-slate-950">{user?.email}</p>
              <p className="mt-0.5 text-xs text-slate-500">Sessão autenticada</p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <MainNav />

      <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-[calc(8rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
    </div>
  );
}
