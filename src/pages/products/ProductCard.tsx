import { Button } from '../../components/Button';
import { formatCurrency, formatProductDate } from '../../features/products/utils';
import type { Product } from '../../features/products/types';

type ProductCardProps = {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  deleting: boolean;
};

export function ProductCard({ product, onEdit, onDelete, deleting }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="grid gap-0 sm:grid-cols-[140px_1fr]">
        <div className="relative min-h-40 bg-slate-100">
          {product.imagem_url ? (
            <img
              src={product.imagem_url}
              alt={product.nome}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full min-h-40 items-center justify-center text-slate-500">
              Sem imagem
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-4 p-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">{product.nome}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {product.descricao || 'Sem descrição informada.'}
                </p>
              </div>
              <div className="rounded-xl bg-brand-50 px-3 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-200">Preço</p>
                <p className="mt-1 text-sm font-bold text-slate-950">{formatCurrency(product.preco)}</p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">Criado em {formatProductDate(product.data_criacao)}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" type="button" className="w-full sm:w-auto" onClick={() => onEdit(product)}>
              Editar
            </Button>
            <Button
              variant="ghost"
              type="button"
              className="w-full text-red-700 hover:bg-red-50 hover:text-red-800 sm:w-auto"
              onClick={() => onDelete(product)}
              disabled={deleting}
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
