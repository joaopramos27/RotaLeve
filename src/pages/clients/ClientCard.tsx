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
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-brand-700">Cliente</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">{client.nome}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {client.telefone || 'Sem telefone'} {client.cidade ? ` - ${client.cidade}` : ''}
            </p>
            <p className="mt-1 text-sm text-slate-500">{client.endereco || 'Sem endereco informado.'}</p>
            <p className="mt-1 text-xs text-slate-500">
              {client.regiao_nome ? `Regiao: ${client.regiao_nome}` : 'Sem regiao definida'}
            </p>
          </div>

          <div className="rounded-xl bg-brand-50 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.16em] text-brand-700">Produtos</p>
            <p className="mt-1 text-sm font-bold text-slate-950">{client.produtos.length}</p>
          </div>
        </div>

        {client.produtos.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Produtos associados</p>
            <div className="flex flex-wrap gap-2">
              {client.produtos.map((product) => (
                <span
                  key={product.id}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                >
                  {product.nome} {product.preco ? ` - ${formatCurrency(product.preco)}` : ''}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {client.observacoes ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Observacoes</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{client.observacoes}</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" type="button" className="w-full sm:w-auto" onClick={() => onEdit(client)}>
            Editar
          </Button>
          <Button
            variant="ghost"
            type="button"
            className="w-full text-red-700 hover:bg-red-50 hover:text-red-800 sm:w-auto"
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
