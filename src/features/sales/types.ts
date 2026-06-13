export type Sale = {
  id: string;
  cliente_id: string;
  valor: number;
  data_venda: string;
  proxima_visita: string | null;
  data_criacao: string;
};

export type SaleClient = {
  id: string;
  nome: string;
  cidade: string | null;
};

export type SaleWithClient = Sale & {
  cliente_nome: string;
  cliente_cidade: string | null;
};

export type SalesSummary = {
  totalSold: number;
  salesCount: number;
  clientsServed: number;
  nextVisits: number;
};

export type SalesPageData = {
  clients: SaleClient[];
  sales: SaleWithClient[];
};

export type SaleFormValues = {
  clienteId: string;
  valor: string;
  dataVenda: string;
  proximaVisita: string;
};

export type SaleFormErrors = Partial<Record<'clienteId' | 'valor' | 'dataVenda' | 'proximaVisita', string>>;
