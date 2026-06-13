import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/Button';
import { Notice } from '../../components/Notice';
import { PageShell } from '../../components/ui/PageShell';
import { StatsCard } from '../../components/ui/StatsCard';
import { listProducts, createProduct, updateProduct, deleteProduct, importValidatedProducts } from '../../features/products/service';
import { analyzeProductImportRows } from '../../features/products/importAnalysis';
import type {
  Product,
  ProductFormErrors,
  ProductFormValues,
  ProductImportAnalysisRow,
  ProductImportAnalysisSummary,
  ProductImportPreviewRow,
  ProductImportSaveRow,
} from '../../features/products/types';
import {
  createEmptyProductFormValues,
  formatCurrency,
  mapProductToFormValues,
  validateProductForm,
} from '../../features/products/utils';
import { parseProductImportFile } from '../../features/products/import';
import { ProductCard } from './ProductCard';
import { ProductFormDrawer } from './ProductFormDrawer';
import { ProductImportDrawer } from './ProductImportDrawer';

type FormMode = 'create' | 'edit';

export function ProductsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [pageSuccess, setPageSuccess] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [formValues, setFormValues] = useState<ProductFormValues>(createEmptyProductFormValues());
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<ProductImportPreviewRow[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importAnalysisLoading, setImportAnalysisLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [importAnalysisError, setImportAnalysisError] = useState('');
  const [importAnalysisRows, setImportAnalysisRows] = useState<ProductImportAnalysisRow[]>([]);
  const [importAnalysisSummary, setImportAnalysisSummary] = useState<ProductImportAnalysisSummary | null>(null);

  const stats = useMemo(() => {
    const total = products.length;
    const average = total > 0 ? products.reduce((sum, product) => sum + product.preco, 0) / total : 0;

    return { total, average };
  }, [products]);

  const analysisByRowNumber = useMemo(() => {
    return new Map(importAnalysisRows.map((row) => [row.rowNumber, row]));
  }, [importAnalysisRows]);

  const readyImportRows = useMemo<ProductImportSaveRow[]>(() => {
    return importRows
      .filter((row) => row.valid)
      .map((row) => {
        const analysis = analysisByRowNumber.get(row.rowNumber);

        return {
          rowNumber: row.rowNumber,
          nome: analysis?.nomeCorrigido?.trim() || row.row.nome,
          descricao: analysis?.descricaoPadronizada?.trim() || row.row.descricao,
          preco: row.price,
        };
      });
  }, [analysisByRowNumber, importRows]);

  async function fetchProducts() {
    if (!userId) {
      return;
    }

    setLoading(true);
    setPageError('');

    try {
      const items = await listProducts(userId);
      setProducts(items);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Falha ao carregar os produtos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
    // Recarrega a lista ao trocar de usuario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  function openCreateForm() {
    setFormMode('create');
    setActiveProduct(null);
    setFormValues(createEmptyProductFormValues());
    setFormErrors({});
    setPageSuccess('');
    setPageError('');
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setFormMode('edit');
    setActiveProduct(product);
    setFormValues(mapProductToFormValues(product));
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
    setFormErrors({});
  }

  function handleFieldChange(field: keyof ProductFormValues, value: string | File | null) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPageError('');
    setPageSuccess('');

    const validationErrors = validateProductForm(formValues);
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || !userId) {
      return;
    }

    if (formMode === 'edit' && !activeProduct) {
      setPageError('Selecione um produto valido para editar.');
      return;
    }

    setFormLoading(true);

    try {
      const product =
        formMode === 'create'
          ? await createProduct(userId, formValues)
          : await updateProduct(userId, activeProduct!.id, formValues, activeProduct!.imagem_url);

      setProducts((current) => {
        if (formMode === 'create') {
          return [product, ...current];
        }

        return current.map((item) => (item.id === product.id ? product : item));
      });

      setFormOpen(false);
      setActiveProduct(null);
      setFormValues(createEmptyProductFormValues());
      setPageSuccess(formMode === 'create' ? 'Produto criado com sucesso.' : 'Produto atualizado com sucesso.');
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Nao foi possivel salvar o produto.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(`Excluir o produto "${product.nome}"?`);
    if (!confirmed || !userId) {
      return;
    }

    setDeleteTargetId(product.id);
    setPageError('');
    setPageSuccess('');

    try {
      await deleteProduct(userId, product.id, product.imagem_url);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setPageSuccess('Produto excluido com sucesso.');
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Nao foi possivel excluir o produto.');
    } finally {
      setDeleteTargetId(null);
    }
  }

  function openImportDrawer() {
    setImportOpen(true);
    setImportRows([]);
    setImportFileName('');
    setImportError('');
    setImportSuccess('');
    setImportAnalysisError('');
    setImportAnalysisRows([]);
    setImportAnalysisSummary(null);
  }

  function closeImportDrawer() {
    if (importLoading) {
      return;
    }

    setImportOpen(false);
    setImportRows([]);
    setImportFileName('');
    setImportError('');
    setImportSuccess('');
    setImportAnalysisError('');
    setImportAnalysisRows([]);
    setImportAnalysisSummary(null);
  }

  async function handleImportFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImportLoading(true);
    setImportError('');
    setImportSuccess('');
    setImportAnalysisError('');
    setImportAnalysisRows([]);
    setImportAnalysisSummary(null);

    try {
      const result = await parseProductImportFile(file);
      setImportRows(result.rows);
      setImportFileName(result.fileName);

      if (result.rows.length === 0) {
        setImportError('O arquivo nao contem linhas validas para importar.');
        return;
      }

      if (result.invalidRows.length > 0) {
        setImportError('Existem linhas com erro. Corrija o arquivo e tente novamente.');
      }

      setImportAnalysisLoading(true);
      try {
        const analysis = await analyzeProductImportRows(result.rows);
        setImportAnalysisRows(analysis.rows);
        setImportAnalysisSummary(analysis.summary);

        if (result.invalidRows.length === 0) {
          setImportSuccess(
            `Arquivo validado e analisado com Gemini. ${result.validRows.length} produtos prontos para importar.`,
          );
        }
      } catch (analysisError) {
        setImportAnalysisError(
          analysisError instanceof Error ? analysisError.message : 'Nao foi possivel analisar com Gemini.',
        );
      } finally {
        setImportAnalysisLoading(false);
      }
    } catch (error) {
      setImportRows([]);
      setImportFileName(file.name);
      setImportError(error instanceof Error ? error.message : 'Nao foi possivel ler o arquivo.');
    } finally {
      setImportLoading(false);
      event.target.value = '';
    }
  }

  async function handleImportProducts() {
    if (!userId) {
      return;
    }

    if (readyImportRows.length === 0) {
      setImportError('Nao ha produtos validos para importar.');
      return;
    }

    if (importRows.some((row) => !row.valid)) {
      setImportError('Remova as linhas com erro antes de importar.');
      return;
    }

    setImportLoading(true);
    setImportError('');
    setImportSuccess('');

    try {
      await importValidatedProducts(userId, readyImportRows);
      await fetchProducts();
      setImportSuccess(`${readyImportRows.length} produtos importados com sucesso.`);
      setTimeout(() => {
        closeImportDrawer();
      }, 900);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Nao foi possivel importar os produtos.');
    } finally {
      setImportLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageShell
        title="Produtos"
        description="Gerencie seu catalogo com cadastro, edicao, exclusao, importacao e upload de imagem no Supabase Storage."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" type="button" onClick={openImportDrawer}>
              Importar CSV/XLSX
            </Button>
            <Button type="button" onClick={openCreateForm}>
              Novo produto
            </Button>
          </div>
        }
      >
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <StatsCard label="Produtos" value={String(stats.total)} hint="Itens cadastrados no catalogo" />
          <StatsCard label="Preco medio" value={formatCurrency(stats.average)} hint="Visao rapida da precificacao" />
          <StatsCard label="Status" value={loading ? 'Carregando' : 'Ativo'} hint="CRUD integrado ao Supabase" />
        </div>
      </PageShell>

      {pageError ? <Notice tone="danger">{pageError}</Notice> : null}
      {pageSuccess ? <Notice tone="success">{pageSuccess}</Notice> : null}

      <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Lista de produtos</p>
            <p className="mt-1 text-sm text-slate-400">Toque em editar para atualizar ou excluir para remover.</p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
              Carregando produtos...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
              Nenhum produto cadastrado ainda. Crie o primeiro item para comecar.
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                deleting={deleteTargetId === product.id}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </section>

      <ProductFormDrawer
        mode={formMode}
        open={formOpen}
        values={formValues}
        errors={formErrors}
        loading={formLoading}
        submitError={pageError}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onChange={handleFieldChange}
        product={activeProduct}
      />

      <ProductImportDrawer
        open={importOpen}
        fileName={importFileName}
        rows={importRows}
        loading={importLoading}
        analysisLoading={importAnalysisLoading}
        error={importError}
        success={importSuccess}
        analysisError={importAnalysisError}
        analysisSummary={importAnalysisSummary}
        analysisRows={importAnalysisRows}
        onClose={closeImportDrawer}
        onFileChange={handleImportFileChange}
        onImport={handleImportProducts}
      />
    </div>
  );
}
