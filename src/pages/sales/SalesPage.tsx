import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/Button';
import { Notice } from '../../components/Notice';
import { PageShell } from '../../components/ui/PageShell';
import { StatsCard } from '../../components/ui/StatsCard';
import { createSale, buildSalesSummary, listSalesPageData } from '../../features/sales/service';
import type { SaleClient, SaleFormErrors, SaleFormValues, SaleWithClient } from '../../features/sales/types';
import { createEmptySaleFormValues, validateSaleForm } from '../../features/sales/utils';
import { formatCurrency } from '../../features/products/utils';
import { SaleCard } from './SaleCard';
import { SaleFormDrawer } from './SaleFormDrawer';

export function SalesPage() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const [clients, setClients] = useState<SaleClient[]>([]);
  const [sales, setSales] = useState<SaleWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [pageSuccess, setPageSuccess] = useState('');
  const [saleOpen, setSaleOpen] = useState(false);
  const [saleValues, setSaleValues] = useState<SaleFormValues>(createEmptySaleFormValues());
  const [saleErrors, setSaleErrors] = useState<SaleFormErrors>({});
  const [saleLoading, setSaleLoading] = useState(false);
  async function fetchData() {
    if (!userId) {
      return;
    }

    setLoading(true);
    setPageError('');

    try {
      const salesData = await listSalesPageData(userId);
      setSales(salesData.sales);
      setClients(salesData.clients);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Falha ao carregar as vendas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // Recarrega ao trocar de usuario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const summary = useMemo(() => buildSalesSummary(sales), [sales]);

  const nextVisits = useMemo(() => {
    return sales
      .filter((sale) => Boolean(sale.proxima_visita))
      .slice()
      .sort((a, b) => String(a.proxima_visita).localeCompare(String(b.proxima_visita)))
      .slice(0, 5);
  }, [sales]);

  function openSaleDrawer(sale?: SaleWithClient) {
    setSaleOpen(true);
    setPageError('');
    setPageSuccess('');
    setSaleErrors({});

    if (sale) {
      setSaleValues({
        clienteId: sale.cliente_id,
        valor: String(sale.valor),
        dataVenda: sale.data_venda,
        proximaVisita: sale.proxima_visita ?? '',
      });
      return;
    }

    setSaleValues(createEmptySaleFormValues());
  }

  function closeSaleDrawer() {
    if (saleLoading) {
      return;
    }

    setSaleOpen(false);
    setSaleErrors({});
  }

  function handleFieldChange(field: keyof SaleFormValues, value: string) {
    setSaleValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPageError('');
    setPageSuccess('');

    const validationErrors = validateSaleForm(saleValues);
    setSaleErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || !userId) {
      return;
    }

    setSaleLoading(true);

    try {
      const savedSale = await createSale(saleValues);
      const client = clients.find((item) => item.id === savedSale.cliente_id);

      setSales((current) => [
        {
          ...savedSale,
          cliente_nome: client?.nome ?? 'Cliente removido',
          cliente_cidade: client?.cidade ?? null,
        },
        ...current,
      ]);

      setSaleOpen(false);
      setSaleValues(createEmptySaleFormValues());
      setPageSuccess('Venda registrada com sucesso.');
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Nao foi possivel registrar a venda.');
    } finally {
      setSaleLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageShell
        title="Vendas"
        description="Registre vendas, acompanhe o historico e monitore os principais numeros do atendimento comercial."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={() => openSaleDrawer()}>
              Registrar venda
            </Button>
          </div>
        }
      >
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard label="Total vendido" value={formatCurrency(summary.totalSold)} hint="Acumulado no historico" />
          <StatsCard label="Vendas" value={String(summary.salesCount)} hint="Lancamentos realizados" />
          <StatsCard label="Clientes atendidos" value={String(summary.clientsServed)} hint="Base distinta atendida" />
          <StatsCard label="Proximas visitas" value={String(summary.nextVisits)} hint="Visitas agendadas" />
        </div>
      </PageShell>

      {pageError ? <Notice tone="danger">{pageError}</Notice> : null}
      {pageSuccess ? <Notice tone="success">{pageSuccess}</Notice> : null}

      <section className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Historico de vendas</p>
                <p className="mt-1 text-sm text-slate-400">Veja o valor vendido, a data da venda e a proxima visita.</p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {loading ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                  Carregando vendas...
                </div>
              ) : sales.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                  Nenhuma venda registrada ainda. Cadastre a primeira para começar.
                </div>
              ) : (
                sales.map((sale) => (
                  <SaleCard key={sale.id} sale={sale} onReopen={openSaleDrawer} />
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur">
            <p className="text-sm font-semibold text-white">Dashboard rapido</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Media por venda</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {summary.salesCount > 0 ? formatCurrency(summary.totalSold / summary.salesCount) : formatCurrency(0)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Clientes cadastrados</p>
                <p className="mt-2 text-lg font-semibold text-white">{clients.length}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur">
            <p className="text-sm font-semibold text-white">Proximas visitas</p>
            <div className="mt-4 space-y-3">
              {nextVisits.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                  Nenhuma proxima visita definida.
                </div>
              ) : (
                nextVisits.map((sale) => (
                  <article key={sale.id} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4">
                    <p className="text-sm font-semibold text-white">{sale.cliente_nome}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {sale.proxima_visita ?? 'Sem data'} - {formatCurrency(sale.valor)}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>
        </aside>
      </section>

      <SaleFormDrawer
        open={saleOpen}
        values={saleValues}
        errors={saleErrors}
        loading={saleLoading}
        submitError={pageError}
        clients={clients}
        onClose={closeSaleDrawer}
        onSubmit={handleSubmit}
        onChange={handleFieldChange}
      />
    </div>
  );
}
