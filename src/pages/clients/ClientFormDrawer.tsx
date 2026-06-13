import { FormEvent } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Notice } from '../../components/Notice';
import type { ClientFormErrors, ClientFormValues, ClientProduct, ClientRegion } from '../../features/clients/types';
import { formatCurrency } from '../../features/products/utils';

type ClientFormDrawerProps = {
  mode: 'create' | 'edit';
  open: boolean;
  values: ClientFormValues;
  errors: ClientFormErrors;
  loading: boolean;
  submitError: string;
  products: ClientProduct[];
  regions: ClientRegion[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (field: keyof ClientFormValues, value: string) => void;
  onToggleProduct: (productId: string) => void;
};

export function ClientFormDrawer({
  mode,
  open,
  values,
  errors,
  loading,
  submitError,
  products,
  regions,
  onClose,
  onSubmit,
  onChange,
  onToggleProduct,
}: ClientFormDrawerProps) {
  if (!open) {
    return null;
  }

  const title = mode === 'create' ? 'Novo cliente' : 'Editar cliente';

  return (
    <div className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm">
      <div className="absolute inset-x-0 bottom-0 top-0 mx-auto flex w-full max-w-3xl items-end sm:items-center sm:px-4">
        <section className="max-h-[92vh] w-full overflow-auto rounded-t-[2rem] border border-white/10 bg-slate-950 p-5 shadow-soft sm:rounded-[2rem] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Clientes</p>
              <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {mode === 'create'
                  ? 'Cadastre um cliente com contatos, regiao, produtos vinculados e observacoes.'
                  : 'Atualize os dados e a carteira de produtos do cliente selecionado.'}
              </p>
            </div>

            <Button variant="ghost" type="button" onClick={onClose}>
              Fechar
            </Button>
          </div>

          <div className="mt-5 space-y-4">
            {submitError ? <Notice tone="danger">{submitError}</Notice> : null}

            <form className="space-y-4" onSubmit={onSubmit}>
              <Input
                label="Nome"
                name="nome"
                value={values.nome}
                onChange={(event) => onChange('nome', event.target.value)}
                placeholder="Ex.: Maria Silva"
                error={errors.nome}
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Telefone"
                  name="telefone"
                  value={values.telefone}
                  onChange={(event) => onChange('telefone', event.target.value)}
                  placeholder="(00) 00000-0000"
                  error={errors.telefone}
                />
                <Input
                  label="Cidade"
                  name="cidade"
                  value={values.cidade}
                  onChange={(event) => onChange('cidade', event.target.value)}
                  placeholder="Ex.: Campinas"
                  error={errors.cidade}
                />
              </div>

              <Input
                label="Endereco"
                name="endereco"
                value={values.endereco}
                onChange={(event) => onChange('endereco', event.target.value)}
                placeholder="Rua, numero, bairro"
                error={errors.endereco}
              />

              <label className="flex flex-col gap-2 text-sm text-slate-200">
                <span className="font-medium">Regiao</span>
                <select
                  value={values.regiaoId}
                  onChange={(event) => onChange('regiaoId', event.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30"
                >
                  <option value="">Sem regiao</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.nome}
                    </option>
                  ))}
                </select>
                {errors.regiaoId ? <span className="text-xs text-red-300">{errors.regiaoId}</span> : null}
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-200">
                <span className="font-medium">Observacoes</span>
                <textarea
                  className="min-h-32 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30"
                  value={values.observacoes}
                  onChange={(event) => onChange('observacoes', event.target.value)}
                  placeholder="Anotacoes relevantes, historico comercial, preferencias..."
                  maxLength={2000}
                />
                {errors.observacoes ? <span className="text-xs text-red-300">{errors.observacoes}</span> : null}
              </label>

              <section className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Produtos associados</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Selecione os produtos que este cliente costuma comprar.
                    </p>
                  </div>
                  <span className="rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1 text-xs text-brand-100">
                    {values.productIds.length} selecionados
                  </span>
                </div>

                {errors.productIds ? <p className="mt-3 text-xs text-red-300">{errors.productIds}</p> : null}

                <div className="mt-4">
                  {products.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-400">
                      Nenhum produto cadastrado ainda.
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {products.map((product) => {
                        const checked = values.productIds.includes(product.id);

                        return (
                          <label
                            key={product.id}
                            className={[
                              'flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition',
                              checked
                                ? 'border-brand-400/30 bg-brand-500/10'
                                : 'border-white/10 bg-slate-950/40 hover:bg-white/5',
                            ].join(' ')}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => onToggleProduct(product.id)}
                              className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-brand-400 focus:ring-brand-400/30"
                            />
                            <div>
                              <p className="text-sm font-semibold text-white">{product.nome}</p>
                              <p className="mt-1 text-xs text-slate-400">
                                {formatCurrency(product.preco)}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Salvando...' : mode === 'create' ? 'Criar cliente' : 'Salvar alteracoes'}
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
