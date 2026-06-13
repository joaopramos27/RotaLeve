import { FormEvent } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Notice } from '../../components/Notice';
import type { Product, ProductFormErrors, ProductFormValues } from '../../features/products/types';

type ProductFormDrawerProps = {
  mode: 'create' | 'edit';
  open: boolean;
  values: ProductFormValues;
  errors: ProductFormErrors;
  loading: boolean;
  submitError: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (field: keyof ProductFormValues, value: string | File | null) => void;
  product?: Product | null;
};

export function ProductFormDrawer({
  mode,
  open,
  values,
  errors,
  loading,
  submitError,
  onClose,
  onSubmit,
  onChange,
  product,
}: ProductFormDrawerProps) {
  if (!open) {
    return null;
  }

  const title = mode === 'create' ? 'Novo produto' : 'Editar produto';

  return (
    <div className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm">
      <div className="absolute inset-x-0 bottom-0 top-0 mx-auto flex w-full max-w-2xl items-end sm:items-center sm:px-4">
        <section className="max-h-[92vh] w-full overflow-auto rounded-t-[2rem] border border-white/10 bg-slate-950 p-5 shadow-soft sm:rounded-[2rem] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Produtos</p>
              <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {mode === 'create'
                  ? 'Cadastre um novo item do catalogo.'
                  : 'Atualize os dados do produto selecionado.'}
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
                placeholder="Ex.: Cafe Premium"
                error={errors.nome}
                required
              />

              <label className="flex flex-col gap-2 text-sm text-slate-200">
                <span className="font-medium">Descricao</span>
                <textarea
                  className={[
                    'min-h-28 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30',
                    errors.descricao ? 'border-red-400/70 focus:border-red-400 focus:ring-red-400/20' : '',
                  ].join(' ')}
                  value={values.descricao}
                  onChange={(event) => onChange('descricao', event.target.value)}
                  placeholder="Breve descricao do produto"
                  maxLength={1000}
                />
                {errors.descricao ? <span className="text-xs text-red-300">{errors.descricao}</span> : null}
              </label>

              <Input
                label="Preco"
                name="preco"
                inputMode="decimal"
                value={values.preco}
                onChange={(event) => onChange('preco', event.target.value)}
                placeholder="0,00"
                error={errors.preco}
                required
              />

              <label className="flex flex-col gap-2 text-sm text-slate-200">
                <span className="font-medium">Imagem</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => onChange('imagemFile', event.target.files?.[0] ?? null)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
                {errors.imagemFile ? <span className="text-xs text-red-300">{errors.imagemFile}</span> : null}
                {values.imagemUrl ? (
                  <p className="text-xs text-slate-400">
                    Imagem atual disponivel. {product ? 'Um novo arquivo substitui a anterior no registro.' : ''}
                  </p>
                ) : null}
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Salvando...' : mode === 'create' ? 'Criar produto' : 'Salvar alteracoes'}
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
