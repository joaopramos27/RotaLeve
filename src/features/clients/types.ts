export type Client = {
  id: string;
  usuario_id: string;
  nome: string;
  telefone: string | null;
  cidade: string | null;
  endereco: string | null;
  regiao_id: string | null;
  observacoes: string | null;
  data_criacao: string;
};

export type ClientRegion = {
  id: string;
  nome: string;
};

export type ClientProduct = {
  id: string;
  nome: string;
  preco: number;
};

export type ClientWithRelations = Client & {
  regiao_nome: string | null;
  produtos: ClientProduct[];
};

export type ClientFormValues = {
  nome: string;
  telefone: string;
  cidade: string;
  endereco: string;
  regiaoId: string;
  novaRegiaoNome: string;
  observacoes: string;
  productIds: string[];
};

export type ClientFormErrors = Partial<
  Record<'nome' | 'telefone' | 'cidade' | 'endereco' | 'regiaoId' | 'novaRegiaoNome' | 'observacoes' | 'productIds', string>
>;

export type ClientPageData = {
  clients: ClientWithRelations[];
  regions: ClientRegion[];
  products: ClientProduct[];
};
