import { PageShell } from '../../components/ui/PageShell';
import { useAuth } from '../../auth/AuthContext';
import { StatsCard } from '../../components/ui/StatsCard';

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageShell
        title="Perfil"
        description="Configurações da conta, dados do usuário e preferências principais do aplicativo."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Usuário" value={user?.email ?? '-'} hint="Sessão autenticada" />
        <StatsCard label="Status" value="Ativo" hint="Conta pronta para uso" />
        <StatsCard label="Segurança" value="Supabase Auth" hint="Sessão persistida" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold text-white">Dados da conta</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">E-mail</p>
              <p className="mt-1 text-white">{user?.email ?? '-'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Acesso</p>
              <p className="mt-1 text-white">Autenticação ativa no navegador</p>
            </div>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold text-white">Preferências</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-4">
              Interface mobile-first
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-4">
              Menu inferior sempre acessível
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-4">
              Pronto para integrações futuras
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
