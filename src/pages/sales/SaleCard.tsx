import { Button } from '../../components/Button';
import { formatCurrency } from '../../features/products/utils';
import { formatSaleDate } from '../../features/sales/utils';
import type { SaleWithClient } from '../../features/sales/types';

type SaleCardProps = {
  sale: SaleWithClient;
  onReopen: (sale: SaleWithClient) => void;
};

export function SaleCard({ sale, onReopen }: SaleCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.16em] text-brand-700">Venda</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">{sale.cliente_nome}</h3>
          <p className="mt-2 text-sm text-slate-600">
            {sale.cliente_cidade ? `${sale.cliente_cidade} - ` : ''}
            {formatSaleDate(sale.data_venda)}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Próxima visita: {sale.proxima_visita ? formatSaleDate(sale.proxima_visita) : 'Não informada'}
          </p>
        </div>

        <div className="rounded-xl bg-brand-50 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.16em] text-brand-700">Valor vendido</p>
          <p className="mt-1 text-sm font-bold text-slate-950">{formatCurrency(sale.valor)}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="secondary" type="button" onClick={() => onReopen(sale)}>
          Reutilizar
        </Button>
      </div>
    </article>
  );
}
