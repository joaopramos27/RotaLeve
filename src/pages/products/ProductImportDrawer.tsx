import { ChangeEvent } from 'react';
import { Button } from '../../components/Button';
import { Notice } from '../../components/Notice';
import type {
  ProductImportAnalysisRow,
  ProductImportAnalysisSummary,
  ProductImportPreviewRow,
} from '../../features/products/types';
import { formatCurrency } from '../../features/products/utils';

type ProductImportDrawerProps = {
  open: boolean;
  fileName: string;
  rows: ProductImportPreviewRow[];
  loading: boolean;
  analysisLoading: boolean;
  error: string;
  success: string;
  analysisError: string;
  analysisSummary: ProductImportAnalysisSummary | null;
  analysisRows: ProductImportAnalysisRow[];
  onClose: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onImport: () => void;
};

export function ProductImportDrawer({
  open,
  fileName,
  rows,
  loading,
  analysisLoading,
  error,
  success,
  analysisError,
  analysisSummary,
  analysisRows,
  onClose,
  onFileChange,
  onImport,
}: ProductImportDrawerProps) {
  if (!open) {
    return null;
  }

  const validCount = rows.filter((row) => row.valid).length;
  const invalidCount = rows.length - validCount;
  const canImport = rows.length > 0 && invalidCount === 0 && !loading && !analysisLoading;
  const analysisByRowNumber = new Map(analysisRows.map((row) => [row.rowNumber, row]));

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm">
      <div className="absolute inset-x-0 bottom-0 top-0 mx-auto flex w-full max-w-4xl items-end sm:items-center sm:px-4">
        <section className="max-h-[92vh] w-full overflow-auto rounded-t-[2rem] border border-white/10 bg-slate-950 p-5 shadow-soft sm:rounded-[2rem] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Importacao</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Importar produtos</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Envie um arquivo CSV ou XLSX com as colunas <span className="font-semibold">nome</span>,
                <span className="font-semibold"> descricao</span> e <span className="font-semibold">preco</span>.
              </p>
            </div>

            <Button variant="ghost" type="button" onClick={onClose}>
              Fechar
            </Button>
          </div>

          <div className="mt-5 space-y-4">
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              <span className="font-medium">Arquivo CSV ou XLSX</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={onFileChange}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Arquivo</p>
                <p className="mt-1 text-sm font-semibold text-white">{fileName || 'Nenhum arquivo selecionado'}</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Validos</p>
                <p className="mt-1 text-sm font-semibold text-emerald-300">{validCount}</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Invalidos</p>
                <p className="mt-1 text-sm font-semibold text-red-300">{invalidCount}</p>
              </article>
            </div>

            {error ? <Notice tone="danger">{error}</Notice> : null}
            {success ? <Notice tone="success">{success}</Notice> : null}
            {analysisError ? <Notice tone="danger">{analysisError}</Notice> : null}

            <section className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Preview</p>
                  <p className="mt-1 text-xs text-slate-400">Apenas linhas sem erro podem ser importadas.</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {rows.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                    O preview aparecera apos a leitura do arquivo.
                  </div>
                ) : (
                  rows.map((item) => (
                    <article
                      key={item.rowNumber}
                      className={[
                        'rounded-2xl border px-4 py-4',
                        item.valid ? 'border-emerald-400/20 bg-emerald-500/5' : 'border-red-400/20 bg-red-500/5',
                      ].join(' ')}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Linha {item.rowNumber}</p>
                          <p className="mt-1 text-sm font-semibold text-white">{item.row.nome || 'Sem nome'}</p>
                          <p className="mt-1 text-sm text-slate-300">
                            {item.row.descricao || 'Sem descricao informada.'}
                          </p>
                          <p className="mt-1 text-sm text-slate-300">{formatCurrency(item.price || 0)}</p>
                        </div>
                        <div className="text-sm">
                          <p className={item.valid ? 'font-semibold text-emerald-300' : 'font-semibold text-red-300'}>
                            {item.valid ? 'Valido' : 'Com erros'}
                          </p>
                          {!item.valid ? (
                            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-red-200">
                              {item.errors.map((errorMessage) => (
                                <li key={errorMessage}>{errorMessage}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-brand-400/20 bg-brand-500/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Gemini 2.5 Flash</p>
                  <p className="mt-1 text-xs text-slate-400">
                    O backend analisa, corrige nomes, padroniza descricoes e sugere categorias sem expor a API key.
                  </p>
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-200">
                  {analysisLoading ? 'Analisando...' : analysisSummary ? 'Analise pronta' : 'Aguardando analise'}
                </p>
              </div>

              {analysisLoading ? (
                <div className="mt-4 rounded-2xl border border-dashed border-brand-400/30 px-4 py-8 text-center text-sm text-brand-100">
                  Gemini esta analisando a planilha.
                </div>
              ) : analysisRows.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-brand-400/30 px-4 py-8 text-center text-sm text-brand-100">
                  A analise aparecera logo apos a leitura do arquivo.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <article className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Analisadas</p>
                      <p className="mt-1 text-sm font-semibold text-white">{analysisSummary?.totalRows ?? analysisRows.length}</p>
                    </article>
                    <article className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Com alertas</p>
                      <p className="mt-1 text-sm font-semibold text-amber-300">
                        {analysisSummary?.rowsWithWarnings ?? analysisRows.filter((row) => row.possiveisErros.length > 0).length}
                      </p>
                    </article>
                    <article className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Categorias</p>
                      <p className="mt-1 text-sm font-semibold text-brand-200">
                        {analysisSummary?.categories.length ?? 0}
                      </p>
                    </article>
                  </div>

                  {analysisSummary?.notes?.length ? (
                    <Notice tone="success">
                      <ul className="list-disc space-y-1 pl-4">
                        {analysisSummary.notes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </Notice>
                  ) : null}

                  <div className="space-y-3">
                    {rows.map((item) => {
                      const analysis = analysisByRowNumber.get(item.rowNumber);

                      return (
                        <article
                          key={`analysis-${item.rowNumber}`}
                          className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Linha {item.rowNumber}</p>

                              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Original</p>
                                  <p className="mt-2 text-sm font-semibold text-white">{item.row.nome || 'Sem nome'}</p>
                                  <p className="mt-1 text-sm text-slate-300">
                                    {item.row.descricao || 'Sem descricao informada.'}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-300">{formatCurrency(item.price || 0)}</p>
                                </div>

                                <div className="rounded-2xl border border-brand-400/20 bg-brand-500/10 p-3">
                                  <p className="text-xs uppercase tracking-[0.2em] text-brand-100">Gemini</p>
                                  <p className="mt-2 text-sm font-semibold text-white">
                                    {analysis?.nomeCorrigido || item.row.nome || 'Sem nome'}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-200">
                                    {analysis?.descricaoPadronizada || item.row.descricao || 'Sem descricao padronizada.'}
                                  </p>
                                  <p className="mt-1 text-sm text-brand-100">
                                    Categoria sugerida: {analysis?.categoriaSugerida || 'Nao informada'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="min-w-[220px] text-sm">
                              <p className={item.valid ? 'font-semibold text-emerald-300' : 'font-semibold text-red-300'}>
                                {item.valid ? 'Valido localmente' : 'Com erros locais'}
                              </p>

                              {item.errors.length > 0 ? (
                                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-red-200">
                                  {item.errors.map((errorMessage) => (
                                    <li key={errorMessage}>{errorMessage}</li>
                                  ))}
                                </ul>
                              ) : null}

                              {analysis?.possiveisErros?.length ? (
                                <>
                                  <p className="mt-4 font-semibold text-amber-300">Possiveis erros</p>
                                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-amber-100">
                                    {analysis.possiveisErros.map((warning) => (
                                      <li key={warning}>{warning}</li>
                                    ))}
                                  </ul>
                                </>
                              ) : null}

                              {analysis?.observacoes?.length ? (
                                <>
                                  <p className="mt-4 font-semibold text-brand-100">Observacoes</p>
                                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-brand-50/90">
                                    {analysis.observacoes.map((note) => (
                                      <li key={note}>{note}</li>
                                    ))}
                                  </ul>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button type="button" className="w-full" onClick={onImport} disabled={!canImport}>
                {loading ? 'Importando...' : 'Salvar produtos no banco'}
              </Button>
              <Button variant="secondary" type="button" className="w-full sm:w-auto" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
