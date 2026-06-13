import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Notice } from '../../components/Notice';
import { PageShell } from '../../components/ui/PageShell';
import { StatsCard } from '../../components/ui/StatsCard';
import { generateOptimizedRoute, listRouteClients } from '../../features/routes/service';
import { buildRouteExportLinks } from '../../features/routes/exports';
import type { OptimizedRouteResult, RouteClient } from '../../features/routes/types';
import { formatDistanceMeters, formatDurationSeconds } from '../../features/routes/utils';

function hasAddress(client: RouteClient) {
  return Boolean(client.endereco && client.endereco.trim().length > 0);
}

function formatClientSearchText(client: RouteClient) {
  return [client.nome, client.cidade, client.regiao_nome, client.endereco, client.telefone]
    .filter((value): value is string => Boolean(value && value.trim().length > 0))
    .join(' ')
    .toLowerCase();
}

function stopBadgeLabel(stop: OptimizedRouteResult['stops'][number]) {
  if (stop.isOrigin) {
    return 'Origem';
  }

  if (stop.isDestination) {
    return 'Destino';
  }

  return 'Parada';
}

export function RoutesPage() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const [clients, setClients] = useState<RouteClient[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pageError, setPageError] = useState('');
  const [pageSuccess, setPageSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [routeResult, setRouteResult] = useState<OptimizedRouteResult | null>(null);

  const clientMap = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients]);

  const filteredClients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const baseClients = [...clients].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR', { sensitivity: 'base' }));

    if (!normalizedSearch) {
      return baseClients;
    }

    return baseClients.filter((client) => formatClientSearchText(client).includes(normalizedSearch));
  }, [clients, search]);

  const selectedClients = useMemo(
    () => selectedClientIds.map((clientId) => clientMap.get(clientId)).filter((client): client is RouteClient => Boolean(client)),
    [clientMap, selectedClientIds],
  );

  const stats = useMemo(() => {
    const withAddress = clients.filter(hasAddress).length;
    const withoutAddress = clients.length - withAddress;

    return {
      total: clients.length,
      selected: selectedClients.length,
      withAddress,
      withoutAddress,
    };
  }, [clients, selectedClients.length]);

  const routeExportLinks = useMemo(() => {
    if (!routeResult) {
      return null;
    }

    return buildRouteExportLinks(routeResult);
  }, [routeResult]);

  async function fetchClients() {
    if (!userId) {
      return;
    }

    setLoading(true);
    setPageError('');

    try {
      const data = await listRouteClients(userId);
      setClients(data);
      setSelectedClientIds((current) => current.filter((clientId) => data.some((client) => client.id === clientId)));
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Falha ao carregar clientes para a rota.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();
    // Recarrega quando o usuario muda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  function toggleClientSelection(clientId: string) {
    const client = clientMap.get(clientId);
    if (!client || !hasAddress(client)) {
      return;
    }

    setSelectedClientIds((current) =>
      current.includes(clientId) ? current.filter((id) => id !== clientId) : [...current, clientId],
    );
    setPageError('');
    setPageSuccess('');
  }

  function selectFilteredClients() {
    const selectableIds = filteredClients.filter(hasAddress).map((client) => client.id);
    setSelectedClientIds((current) => [...new Set([...current, ...selectableIds])]);
    setPageError('');
    setPageSuccess('');
  }

  function clearSelection() {
    setSelectedClientIds([]);
    setRouteResult(null);
    setPageError('');
    setPageSuccess('');
  }

  async function handleGenerateRoute() {
    if (selectedClients.length < 2) {
      setPageError('Selecione pelo menos dois clientes com endereco para gerar a rota.');
      return;
    }

    setGenerating(true);
    setPageError('');
    setPageSuccess('');

    try {
      const result = await generateOptimizedRoute(selectedClientIds);
      setRouteResult(result);
      setPageSuccess(result.summary.cached ? 'Rota carregada do cache com sucesso.' : 'Rota gerada com sucesso.');
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Nao foi possivel gerar a rota.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageShell
        title="Rotas"
        description="Selecione clientes e gere a ordem otimizada das visitas com OpenStreetMap/OSRM, sem uso de IA."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={handleGenerateRoute} disabled={generating || selectedClients.length < 2}>
              {generating ? 'Gerando...' : 'Gerar rota'}
            </Button>
          </div>
        }
      >
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard label="Clientes" value={String(stats.total)} hint="Base disponivel" />
          <StatsCard label="Selecionados" value={String(stats.selected)} hint="Entram na rota" />
          <StatsCard label="Com endereco" value={String(stats.withAddress)} hint="Disponiveis para calculo" />
          <StatsCard label="Sem endereco" value={String(stats.withoutAddress)} hint="Bloqueados para gerar rota" />
        </div>
      </PageShell>

      {pageError ? <Notice tone="danger">{pageError}</Notice> : null}
      {pageSuccess ? <Notice tone="success">{pageSuccess}</Notice> : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Selecao de clientes</p>
              <p className="mt-1 text-sm text-slate-400">
                Filtre por nome, cidade, regiao ou endereco e escolha os pontos de parada da rota.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="secondary" onClick={selectFilteredClients}>
                Selecionar filtrados
              </Button>
              <Button type="button" variant="ghost" onClick={clearSelection}>
                Limpar selecao
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <Input
              label="Buscar clientes"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Digite nome, cidade, regiao ou endereco"
            />
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
            {selectedClients.length === 0
              ? 'Nenhum cliente selecionado.'
              : `${selectedClients.length} cliente(s) selecionado(s). A rota sera calculada a partir da ordem otimizada dos pontos escolhidos.`}
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                Carregando clientes...
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                Nenhum cliente encontrado com o filtro informado.
              </div>
            ) : (
              filteredClients.map((client) => {
                const selected = selectedClientIds.includes(client.id);
                const selectable = hasAddress(client);
                const disableToggle = !selectable && !selected;

                return (
                  <label
                    key={client.id}
                    className={[
                      'flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition',
                      selected ? 'border-brand-400/50 bg-brand-500/10' : 'border-white/10 bg-slate-950/30 hover:border-white/20',
                      !selectable && !selected ? 'cursor-not-allowed opacity-60' : '',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={disableToggle}
                      onChange={() => toggleClientSelection(client.id)}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-brand-500 focus:ring-brand-400"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-base font-semibold text-white">{client.nome}</p>
                          <p className="text-sm text-slate-400">
                            {[client.cidade, client.regiao_nome].filter(Boolean).join(' - ') || 'Sem cidade ou regiao informada'}
                          </p>
                        </div>

                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                          {selected ? 'Selecionado' : 'Disponivel'}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                        <div>
                          <span className="text-slate-500">Endereco:</span> {client.endereco ?? 'Nao informado'}
                        </div>
                        <div>
                          <span className="text-slate-500">Telefone:</span> {client.telefone ?? 'Nao informado'}
                        </div>
                      </div>

                      {!selectable ? (
                        <p className="mt-3 text-xs font-medium text-amber-300">
                          Este cliente nao pode entrar na rota porque o endereco esta vazio.
                        </p>
                      ) : null}
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Resumo da rota</p>
                <p className="mt-1 text-sm text-slate-400">
                  Quando a rota for gerada, voce vera a distancia total, o tempo estimado e a ordem exata das visitas.
                </p>
              </div>
            </div>

            {routeResult ? (
              <div className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <StatsCard
                    label="Distancia total"
                    value={formatDistanceMeters(routeResult.summary.totalDistanceMeters)}
                    hint={routeResult.summary.cached ? 'Resultado vindo do cache' : 'Resultado calculado agora'}
                  />
                  <StatsCard
                    label="Tempo estimado"
                    value={formatDurationSeconds(routeResult.summary.totalDurationSeconds)}
                    hint="Estimativa da viagem completa"
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                  <p>
                    <span className="text-slate-500">Origem:</span> {routeResult.originLabel}
                  </p>
                  <p className="mt-1">
                    <span className="text-slate-500">Destino:</span> {routeResult.destinationLabel}
                  </p>
                </div>

                {routeResult.warnings.length > 0 ? (
                  <Notice tone="info" title="Avisos do calculo da rota">
                    <ul className="list-disc space-y-1 pl-5">
                      {routeResult.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </Notice>
                ) : null}

                <div className="space-y-3">
                  {routeResult.stops.map((stop) => (
                    <article key={stop.clientId} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
                            Parada {stop.order + 1}
                          </p>
                          <h3 className="mt-1 text-lg font-semibold text-white">{stop.nome}</h3>
                          <p className="mt-1 text-sm text-slate-400">
                            {stop.endereco}
                            {stop.cidade ? ` - ${stop.cidade}` : ''}
                            {stop.regiaoNome ? ` - ${stop.regiaoNome}` : ''}
                          </p>
                        </div>

                        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                          {stopBadgeLabel(stop)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                        <div>
                          <span className="text-slate-500">Trecho:</span>{' '}
                          {stop.legDistanceMeters === null ? 'Inicio da rota' : formatDistanceMeters(stop.legDistanceMeters)}
                        </div>
                        <div>
                          <span className="text-slate-500">Tempo do trecho:</span>{' '}
                          {stop.legDurationSeconds === null ? 'Inicio da rota' : formatDurationSeconds(stop.legDurationSeconds)}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {routeExportLinks ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">Exportacao da rota</p>
                        <p className="mt-1 text-sm text-slate-400">
                          Abra a rota completa no Google Maps ou use os links de cada parada no Google Maps e no Waze.
                        </p>
                      </div>

                      <a
                        href={routeExportLinks.googleMapsRoute.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-400"
                      >
                        {routeExportLinks.googleMapsRoute.label}
                      </a>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">{routeExportLinks.googleMapsRoute.helper}</p>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold text-white">Google Maps por parada</p>
                        <div className="mt-3 space-y-2">
                          {routeExportLinks.googleMapsStops.map((link) => (
                            <a
                              key={link.label}
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200 transition hover:border-white/20 hover:bg-slate-950/60"
                            >
                              <span className="flex flex-col">
                                <span>{link.label}</span>
                                <span className="mt-1 text-xs text-slate-400">{link.helper}</span>
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold text-white">Waze por parada</p>
                        <div className="mt-3 space-y-2">
                          {routeExportLinks.wazeStops.map((link) => (
                            <a
                              key={link.label}
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200 transition hover:border-white/20 hover:bg-slate-950/60"
                            >
                              <span className="flex flex-col">
                                <span>{link.label}</span>
                                <span className="mt-1 text-xs text-slate-400">{link.helper}</span>
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">
                Selecione ao menos dois clientes com endereco e clique em "Gerar rota".
              </div>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur">
            <p className="text-sm font-semibold text-white">Como a ordem e calculada</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
              <li>1. O sistema carrega os clientes selecionados e valida os enderecos.</li>
              <li>2. A Edge Function geocodifica os enderecos com Nominatim.</li>
              <li>3. O OSRM calcula a ordem otimizada dos pontos intermediarios.</li>
              <li>4. O resultado fica em cache por um periodo curto para evitar chamadas repetidas.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
