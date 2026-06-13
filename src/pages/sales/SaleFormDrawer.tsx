import { FormEvent } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Notice } from '../../components/Notice';
import type { SaleClient } from '../../features/sales/types';
import type { SaleFormErrors, SaleFormValues } from '../../features/sales/types';
import { formatCurrency } from '../../features/products/utils';

type SaleFormDrawerProps = {
  open: boolean;
  values: SaleFormValues;
  errors: SaleFormErrors;
  loading: boolean;
  submitError: string;
  clients: SaleClient[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (field: keyof SaleFormValues, value: string) => void;
};

export function SaleFormDrawer({
  open,
  values,
  errors,
  loading,
  submitError,
  clients,
  onClose,
  onSubmit,
  onChange,
}: SaleFormDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm">
      <div className="absolute inset-x-0 bottom-0 top-0 mx-auto flex w-full max-w-3xl items-end sm:items-center sm:px-4">
        <section className="max-h-[92vh] w-full overflow-auto rounded-t-[2rem] border border-white/10 bg-slate-950 p-5 shadow-soft sm:rounded-[2rem] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Vendas</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Registrar venda</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Lance o valor vendido, a data da venda e a próxima visita planejada.
              </p>
            </div>

            <Button variant="ghost" type="button" onClick={onClose}>
              Fechar
            </Button>
          </div>

          <div className="mt-5 space-y-4">
            {submitError ? <Notice tone="danger">{submitError}</Notice> : null}

            <form className="space-y-4" onSubmit={onSubmit}>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                <span className="font-medium">Cliente</span>
                <select
                  value={values.clienteId}
                  onChange={(event) => onChange('clienteId', event.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nome}
                    </option>
                  ))}
                </select>
                {errors.clienteId ? <span className="text-xs text-red-300">{errors.clienteId}</span> : null}
              </label>

              <Input
                label="Valor vendido"
                name="valor"
                inputMode="decimal"
                value={values.valor}
                onChange={(event) => onChange('valor', event.target.value)}
                placeholder="0,00"
                error={errors.valor}
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Data da venda"
                  name="dataVenda"
                  type="date"
                  value={values.dataVenda}
                  onChange={(event) => onChange('dataVenda', event.target.value)}
                  error={errors.dataVenda}
                  required
                />
                <Input
                  label="Próxima visita"
                  name="proximaVisita"
                  type="date"
                  value={values.proximaVisita}
                  onChange={(event) => onChange('proximaVisita', event.target.value)}
                  error={errors.proximaVisita}
                />
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Resumo rapido</p>
                <p className="mt-2 font-semibold text-white">
                  {values.valor ? formatCurrency(Number(values.valor.replace(/\./g, '').replace(',', '.'))) : 'R$ 0,00'}
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Salvando...' : 'Registrar venda'}
                </Button>
                <Button variant="secondary" type="button" className="w-full sm:w-auto" onClick={onClose}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
