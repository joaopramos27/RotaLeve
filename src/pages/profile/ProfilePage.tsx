import { PageShell } from '../../components/ui/PageShell';
import { useAuth } from '../../auth/AuthContext';
import { StatsCard } from '../../components/ui/StatsCard';

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageShell
        title="Perfil"
        description="Configuracoes da conta, dados do usuario e preferencias principais do aplicativo."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Usuario" value={user?.email ?? '-'} hint="Sessao autenticada" />
        <StatsCard label="Status" value="Ativo" hint="Conta pronta para uso" />
        <StatsCard label="Seguranca" value="Supabase Auth" hint="Sessao persistida" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-slate-950">Dados da conta</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">E-mail</p>
              <p className="mt-1 break-words text-slate-950 [overflow-wrap:anywhere]">{user?.email ?? '-'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Acesso</p>
              <p className="mt-1 text-slate-950">Autenticacao ativa no navegador</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-slate-950">Preferencias</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              Interface mobile-first
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              Menu inferior sempre acessivel
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              Pronto para integracoes futuras
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
