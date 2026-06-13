import { useAuth } from '../../auth/AuthContext';
import { PageShell } from '../../components/ui/PageShell';
import { StatsCard } from '../../components/ui/StatsCard';
import { QuickAction } from '../../components/ui/QuickAction';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageShell
        title="Bem-vindo ao RotaLeve"
        description="Sua sessao esta ativa. A interface esta pronta para operar clientes, produtos, rotas, vendas e perfil."
      >
        <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-3">
          <StatsCard label="Usuario autenticado" value={user?.email ?? '-'} hint="Acesso seguro com Supabase" />
          <StatsCard label="Status" value="Operando" hint="Base pronta para novos modulos" />
          <StatsCard label="Sessao" value="Persistida" hint="Refresh e login automatico" />
        </div>
      </PageShell>

      <section className="grid gap-4 lg:grid-cols-3">
        <QuickAction
          title="Clientes"
          description="Controle de carteira e relacionamento comercial."
          icon={<span className="text-lg font-bold">C</span>}
        />
        <QuickAction
          title="Produtos"
          description="Catalogo visual com imagem e preco."
          icon={<span className="text-lg font-bold">P</span>}
        />
        <QuickAction
          title="Rotas"
          description="Planejamento de visitas com foco em produtividade."
          icon={<span className="text-lg font-bold">R</span>}
        />
      </section>
    </div>
  );
}
