import { Button } from '../../components/Button';
import { formatCurrency } from '../../features/products/utils';
import type { ClientWithRelations } from '../../features/clients/types';

type ClientCardProps = {
  client: ClientWithRelations;
  onEdit: (client: ClientWithRelations) => void;
  onDelete: (client: ClientWithRelations) => void;
  deleting: boolean;
};

export function ClientCard({ client, onEdit, onDelete, deleting }: ClientCardProps) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-soft backdrop-blur">
      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-300">Cliente</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{client.nome}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {client.telefone || 'Sem telefone'} {client.cidade ? ` - ${client.cidade}` : ''}
            </p>
            <p className="mt-1 text-sm text-slate-400">{client.endereco || 'Sem endereco informado.'}</p>
            <p className="mt-1 text-xs text-slate-500">
              {client.regiao_nome ? `Regiao: ${client.regiao_nome}` : 'Sem regiao definida'}
            </p>
          </div>

          <div className="rounded-2xl bg-brand-500/15 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-200">Produtos</p>
            <p className="mt-1 text-sm font-bold text-white">{client.produtos.length}</p>
          </div>
        </div>

        {client.produtos.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Produtos associados</p>
            <div className="flex flex-wrap gap-2">
              {client.produtos.map((product) => (
                <span
                  key={product.id}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                >
                  {product.nome} {product.preco ? ` - ${formatCurrency(product.preco)}` : ''}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {client.observacoes ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Observacoes</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{client.observacoes}</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" type="button" className="w-full sm:w-auto" onClick={() => onEdit(client)}>
            Editar
          </Button>
          <Button
            variant="ghost"
            type="button"
            className="w-full text-red-200 hover:bg-red-500/10 hover:text-red-100 sm:w-auto"
            onClick={() => onDelete(client)}
            disabled={deleting}
          >
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </div>
    </article>
  );
}
