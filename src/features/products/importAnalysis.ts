import { supabase } from '../../lib/supabase/client';
import { isDemoMode } from '../../lib/appMode';
import { analyzeDemoImport } from '../demo/demoStore';
import type {
  ProductImportAnalysisResponse,
  ProductImportPreviewRow,
} from './types';

type AnalyzeProductImportRequestRow = {
  rowNumber: number;
  nome: string;
  descricao: string;
  preco: string;
};

export async function analyzeProductImportRows(rows: ProductImportPreviewRow[]) {
  if (isDemoMode) {
    return analyzeDemoImport(
      rows.map((item) => ({
        rowNumber: item.rowNumber,
        nome: item.row.nome,
        descricao: item.row.descricao,
        preco: item.row.preco,
      })),
    );
  }

  const payload = {
    rows: rows.map<AnalyzeProductImportRequestRow>((item) => ({
      rowNumber: item.rowNumber,
      nome: item.row.nome,
      descricao: item.row.descricao,
      preco: item.row.preco,
    })),
  };

  const { data, error } = await supabase.functions.invoke('analyze-product-import', {
    body: payload,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('A analise do Gemini nao retornou dados.');
  }

  return data as ProductImportAnalysisResponse;
}
