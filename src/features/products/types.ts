export type Product = {
  id: string;
  usuario_id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  imagem_url: string | null;
  data_criacao: string;
};

export type ProductFormValues = {
  nome: string;
  descricao: string;
  preco: string;
  imagemFile: File | null;
  imagemUrl: string;
};

export type ProductFormErrors = Partial<Record<'nome' | 'descricao' | 'preco' | 'imagemFile', string>>;

export type ProductImportRow = {
  nome: string;
  descricao: string;
  preco: string;
};

export type ProductImportPreviewRow = {
  rowNumber: number;
  row: ProductImportRow;
  price: number;
  valid: boolean;
  errors: string[];
};

export type ProductImportAnalysisRow = {
  rowNumber: number;
  nomeCorrigido: string;
  descricaoPadronizada: string;
  categoriaSugerida: string;
  possiveisErros: string[];
  observacoes: string[];
};

export type ProductImportAnalysisSummary = {
  totalRows: number;
  rowsWithWarnings: number;
  categories: string[];
  notes: string[];
};

export type ProductImportAnalysisResponse = {
  summary: ProductImportAnalysisSummary;
  rows: ProductImportAnalysisRow[];
};

export type ProductImportSaveRow = {
  rowNumber: number;
  nome: string;
  descricao: string;
  preco: number;
};
