import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/Button';
import { Notice } from '../../components/Notice';
import { PageShell } from '../../components/ui/PageShell';
import { StatsCard } from '../../components/ui/StatsCard';
import { deleteClient, listClientsPageData, createClient, updateClient } from '../../features/clients/service';
import type {
  Client,
  ClientFormErrors,
  ClientFormValues,
  ClientProduct,
  ClientRegion,
  ClientWithRelations,
} from '../../features/clients/types';
import { createEmptyClientFormValues, formatBrazilianPhone, mapClientToFormValues, validateClientForm } from '../../features/clients/utils';
import { findOrCreateRegion } from '../../features/regions/service';
import { ClientCard } from './ClientCard';
import { ClientFormDrawer } from './ClientFormDrawer';

type FormMode = 'create' | 'edit';

export function ClientsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const [clients, setClients] = useState<ClientWithRelations[]>([]);
  const [regions, setRegions] = useState<ClientRegion[]>([]);
  const [products, setProducts] = useState<ClientProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [pageSuccess, setPageSuccess] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [formValues, setFormValues] = useState<ClientFormValues>(createEmptyClientFormValues());
  const [formErrors, setFormErrors] = useState<ClientFormErrors>({});
  const [formLoading, setFormLoading] = useState(false);

  async function fetchClients() {
    if (!userId) {
      return;
    }

    setLoading(true);
    setPageError('');

    try {
      const data = await listClientsPageData(userId);
      setClients(data.clients);
      setRegions(data.regions);
      setProducts(data.products);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Falha ao carregar os clientes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();
    // Recarrega ao trocar de usuario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const clientsWithNotes = clients.filter((client) => Boolean(client.observacoes)).length;
    const linkedProducts = new Set(clients.flatMap((client) => client.produtos.map((product) => product.id))).size;

    return {
      totalClients,
      regions: regions.length,
      linkedProducts,
      clientsWithNotes,
    };
  }, [clients, regions]);

  function openCreateForm() {
    setFormMode('create');
    setActiveClient(null);
    setFormValues(createEmptyClientFormValues());
    setFormErrors({});
    setPageSuccess('');
    setPageError('');
    setFormOpen(true);
  }

  function openEditForm(client: ClientWithRelations) {
    setFormMode('edit');
    setActiveClient(client);
    setFormValues(mapClientToFormValues(client, client.produtos.map((product) => product.id)));
    setFormErrors({});
    setPageSuccess('');
    setPageError('');
    setFormOpen(true);
  }

  function closeForm() {
    if (formLoading) {
      return;
    }

    setFormOpen(false);
    setActiveClient(null);
    setFormErrors({});
  }

  function handleFieldChange(field: keyof ClientFormValues, value: string) {
    const nextValue = field === 'telefone' ? formatBrazilianPhone(value) : value;

    setFormValues((current) => ({
      ...current,
      [field]: nextValue,
      ...(field === 'novaRegiaoNome' && nextValue.trim().length > 0 ? { regiaoId: '' } : {}),
      ...(field === 'regiaoId' && nextValue ? { novaRegiaoNome: '' } : {}),
    }));
  }

  function handleToggleProduct(productId: string) {
    setFormValues((current) => {
      const hasProduct = current.productIds.includes(productId);
      return {
        ...current,
        productIds: hasProduct ? current.productIds.filter((item) => item !== productId) : [...current.productIds, productId],
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPageError('');
    setPageSuccess('');

    const normalizedValues = {
      ...formValues,
      telefone: formatBrazilianPhone(formValues.telefone),
      novaRegiaoNome: formValues.novaRegiaoNome.trim().replace(/\s+/g, ' '),
    };

    setFormValues(normalizedValues);

    const validationErrors = validateClientForm(normalizedValues);
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || !userId) {
      return;
    }

    if (formMode === 'edit' && !activeClient) {
      setPageError('Selecione um cliente valido para editar.');
      return;
    }

    setFormLoading(true);

    try {
      let submitValues = normalizedValues;
      let savedRegion: ClientRegion | null = null;

      if (normalizedValues.novaRegiaoNome) {
        savedRegion = await findOrCreateRegion(userId, normalizedValues.novaRegiaoNome);
        submitValues = {
          ...normalizedValues,
          regiaoId: savedRegion.id,
          novaRegiaoNome: '',
        };

        setRegions((current) => {
          const alreadyExists = current.some((region) => region.id === savedRegion?.id);
          if (alreadyExists || !savedRegion) {
            return current;
          }

          return [...current, savedRegion].sort((left, right) =>
            left.nome.localeCompare(right.nome, 'pt-BR', { sensitivity: 'base' }),
          );
        });
      }

      const savedClient =
        formMode === 'create'
          ? await createClient(userId, submitValues)
          : await updateClient(userId, activeClient!.id, submitValues);

      const savedProducts = products.filter((product) => submitValues.productIds.includes(product.id));
      const regionName =
        savedRegion?.id === savedClient.regiao_id
          ? savedRegion.nome
          : regions.find((region) => region.id === savedClient.regiao_id)?.nome ?? null;

      setClients((current) => {
        const nextClient = {
          ...savedClient,
          regiao_nome: regionName,
          produtos: savedProducts,
        };

        if (formMode === 'create') {
          return [nextClient, ...current];
        }

        return current.map((item) => (item.id === savedClient.id ? nextClient : item));
      });

      setFormOpen(false);
      setActiveClient(null);
      setFormValues(createEmptyClientFormValues());
      setPageSuccess(formMode === 'create' ? 'Cliente criado com sucesso.' : 'Cliente atualizado com sucesso.');
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Nao foi possivel salvar o cliente.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(client: ClientWithRelations) {
    const confirmed = window.confirm(`Excluir o cliente "${client.nome}"?`);
    if (!confirmed || !userId) {
      return;
    }

    setDeleteTargetId(client.id);
    setPageError('');
    setPageSuccess('');

    try {
      await deleteClient(userId, client.id);
      setClients((current) => current.filter((item) => item.id !== client.id));
      setPageSuccess('Cliente excluido com sucesso.');
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Nao foi possivel excluir o cliente.');
    } finally {
      setDeleteTargetId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageShell
        title="Clientes"
        description="Gerencie clientes, relacione produtos, registre observacoes e organize os dados por regiao."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={openCreateForm}>
              Novo cliente
            </Button>
          </div>
        }
      >
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard label="Clientes" value={String(stats.totalClients)} hint="Cadastros ativos" />
          <StatsCard label="Regioes" value={String(stats.regions)} hint="Organizacao territorial" />
          <StatsCard label="Produtos vinculados" value={String(stats.linkedProducts)} hint="Carteira associada" />
          <StatsCard label="Com observacoes" value={String(stats.clientsWithNotes)} hint="Registros com notas" />
        </div>
      </PageShell>

      {pageError ? <Notice tone="danger">{pageError}</Notice> : null}
      {pageSuccess ? <Notice tone="success">{pageSuccess}</Notice> : null}

      <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Lista de clientes</p>
            <p className="mt-1 text-sm text-slate-400">Edite, exclua ou revise a carteira e as observacoes de cada cliente.</p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
              Carregando clientes...
            </div>
          ) : clients.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
              Nenhum cliente cadastrado ainda. Crie o primeiro cliente para comecar.
            </div>
          ) : (
            clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                deleting={deleteTargetId === client.id}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </section>

      <ClientFormDrawer
        mode={formMode}
        open={formOpen}
        values={formValues}
        errors={formErrors}
        loading={formLoading}
        submitError={pageError}
        products={products}
        regions={regions}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onChange={handleFieldChange}
        onToggleProduct={handleToggleProduct}
      />
    </div>
  );
}
