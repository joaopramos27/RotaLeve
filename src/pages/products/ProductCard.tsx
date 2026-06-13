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
    <article className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-soft backdrop-blur">
      <div className="grid gap-0 sm:grid-cols-[140px_1fr]">
        <div className="relative min-h-40 bg-slate-900/80">
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
                <h3 className="text-lg font-semibold text-white">{product.nome}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  {product.descricao || 'Sem descrição informada.'}
                </p>
              </div>
              <div className="rounded-2xl bg-brand-500/15 px-3 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-200">Preço</p>
                <p className="mt-1 text-sm font-bold text-white">{formatCurrency(product.preco)}</p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">Criado em {formatProductDate(product.data_criacao)}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" type="button" className="w-full sm:w-auto" onClick={() => onEdit(product)}>
              Editar
            </Button>
            <Button
              variant="ghost"
              type="button"
              className="w-full text-red-200 hover:bg-red-500/10 hover:text-red-100 sm:w-auto"
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
