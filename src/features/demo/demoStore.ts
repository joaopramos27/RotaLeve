import type { Client, ClientProduct, ClientRegion, ClientWithRelations } from '../clients/types';
import type { Product } from '../products/types';
import type { Sale, SaleClient, SaleWithClient } from '../sales/types';
import type { RouteClient, OptimizedRouteResult } from '../routes/types';

type DemoState = {
  user: {
    id: string;
    email: string;
    name: string;
  };
  regions: ClientRegion[];
  products: Product[];
  clients: ClientWithRelations[];
  sales: SaleWithClient[];
};

const STORAGE_KEY = 'rotaleve-demo-state';

const demoUser = {
  id: 'demo-user',
  email: 'demo@rotaleve.local',
  name: 'Usuario Demo',
};

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function makeProduct(name: string, description: string, price: number, imageUrl: string | null = null): Product {
  return {
    id: id('prod'),
    usuario_id: demoUser.id,
    nome: name,
    descricao: description,
    preco: price,
    imagem_url: imageUrl,
    data_criacao: nowIso(),
  };
}

function makeClient(
  name: string,
  city: string,
  address: string,
  regionId: string | null,
  observacoes: string,
  produtos: ClientProduct[],
): ClientWithRelations {
  return {
    id: id('cli'),
    usuario_id: demoUser.id,
    nome: name,
    telefone: '(11) 99999-0000',
    cidade: city,
    endereco: address,
    regiao_id: regionId,
    observacoes,
    data_criacao: nowIso(),
    regiao_nome: null,
    produtos,
  };
}

function makeSale(client: Client, valor: number, dataVenda: string, proximaVisita: string | null): SaleWithClient {
  return {
    id: id('sale'),
    cliente_id: client.id,
    valor,
    data_venda: dataVenda,
    proxima_visita: proximaVisita,
    data_criacao: nowIso(),
    cliente_nome: client.nome,
    cliente_cidade: client.cidade,
  };
}

function createSeedState(): DemoState {
  const regions: ClientRegion[] = [
    { id: id('reg'), nome: 'Centro' },
    { id: id('reg'), nome: 'Zona Sul' },
    { id: id('reg'), nome: 'Interior' },
  ];

  const products: Product[] = [
    makeProduct('Cafe Premium 500g', 'Cafe torrado e moido para revenda.', 32.9),
    makeProduct('Bolacha Integral', 'Pacote com 12 unidades.', 18.5),
    makeProduct('Suco Natural', 'Caixa com 6 unidades.', 27.0),
  ];

  const clientProducts: ClientProduct[] = products.map((product) => ({
    id: product.id,
    nome: product.nome,
    preco: product.preco,
  }));

  const clientsBase = [
    makeClient('Mercado Central', 'Sao Paulo', 'Rua das Flores, 120', regions[0].id, 'Cliente com alto volume.', [clientProducts[0]]),
    makeClient('Padaria Alfa', 'Sao Bernardo do Campo', 'Av. Industrial, 900', regions[1].id, 'Visita quinzenal.', [clientProducts[1]]),
    makeClient('Loja Verde', 'Campinas', 'Rua do Cafe, 45', regions[2].id, 'Prioridade alta.', [clientProducts[2]]),
    makeClient('Distribuidora Norte', 'Sorocaba', 'Av. Brasil, 300', regions[1].id, 'Negociar reposicao.', [clientProducts[0], clientProducts[2]]),
  ];

  const clients = clientsBase.map((client, index) => ({
    ...client,
    regiao_nome: regions[index % regions.length].nome,
  }));

  const sales = [
    makeSale(clients[0], 1240.5, '2026-06-10', '2026-06-17'),
    makeSale(clients[1], 860, '2026-06-11', null),
  ];

  return {
    user: demoUser,
    regions,
    products,
    clients,
    sales,
  };
}

function readState(): DemoState {
  if (typeof window === 'undefined') {
    return createSeedState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = createSeedState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    return JSON.parse(raw) as DemoState;
  } catch {
    const seed = createSeedState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

function saveState(state: DemoState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getDemoUser() {
  return demoUser;
}

export function getDemoSession() {
  return {
    access_token: 'demo-access-token',
    refresh_token: 'demo-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: demoUser.id,
      email: demoUser.email,
      user_metadata: { name: demoUser.name },
      app_metadata: {},
      aud: 'authenticated',
      created_at: nowIso(),
    },
  };
}

export function resetDemoState() {
  const seed = createSeedState();
  saveState(seed);
  return seed;
}

export function getDemoState() {
  return readState();
}

export function updateDemoState(updater: (state: DemoState) => DemoState) {
  const nextState = updater(readState());
  saveState(nextState);
  return nextState;
}

export function listDemoRegions() {
  return readState().regions;
}

export function listDemoProducts() {
  return readState().products;
}

export function listDemoClients() {
  return readState().clients;
}

export function listDemoSales() {
  return readState().sales;
}

export function listDemoRouteClients(): RouteClient[] {
  const state = readState();

  return state.clients.map((client) => ({
    id: client.id,
    nome: client.nome,
    telefone: client.telefone,
    cidade: client.cidade,
    endereco: client.endereco,
    regiao_nome: client.regiao_nome,
  }));
}

export function listDemoClientProducts(clientId: string) {
  const client = readState().clients.find((item) => item.id === clientId);
  return client?.produtos ?? [];
}

export function createOrUpdateDemoClient(
  userId: string,
  values: {
    clientId?: string | null;
    nome: string;
    telefone: string | null;
    cidade: string | null;
    endereco: string | null;
    regiaoId: string | null;
    observacoes: string;
    productIds: string[];
  },
) {
  const state = readState();
  const regionName = values.regiaoId ? state.regions.find((region) => region.id === values.regiaoId)?.nome ?? null : null;
  const products = state.products.filter((product) => values.productIds.includes(product.id));

  const nextClient: ClientWithRelations = {
    id: values.clientId ?? id('cli'),
    usuario_id: userId,
    nome: values.nome,
    telefone: values.telefone,
    cidade: values.cidade,
    endereco: values.endereco,
    regiao_id: values.regiaoId,
    observacoes: values.observacoes,
    data_criacao: values.clientId ? state.clients.find((item) => item.id === values.clientId)?.data_criacao ?? nowIso() : nowIso(),
    regiao_nome: regionName,
    produtos: products.map((product) => ({
      id: product.id,
      nome: product.nome,
      preco: product.preco,
    })),
  };

  const clients = values.clientId
    ? state.clients.map((client) => (client.id === values.clientId ? nextClient : client))
    : [nextClient, ...state.clients];

  const nextState = { ...state, clients };
  saveState(nextState);
  return nextClient;
}

export function deleteDemoClient(clientId: string) {
  const state = readState();
  const nextState = {
    ...state,
    clients: state.clients.filter((client) => client.id !== clientId),
    sales: state.sales.filter((sale) => sale.cliente_id !== clientId),
  };
  saveState(nextState);
}

export function createOrUpdateDemoProduct(
  userId: string,
  values: {
    productId?: string | null;
    nome: string;
    descricao: string | null;
    preco: number;
    imagemUrl: string | null;
  },
) {
  const state = readState();
  const nextProduct: Product = {
    id: values.productId ?? id('prod'),
    usuario_id: userId,
    nome: values.nome,
    descricao: values.descricao,
    preco: values.preco,
    imagem_url: values.imagemUrl,
    data_criacao: values.productId ? state.products.find((item) => item.id === values.productId)?.data_criacao ?? nowIso() : nowIso(),
  };

  const products = values.productId
    ? state.products.map((product) => (product.id === values.productId ? nextProduct : product))
    : [nextProduct, ...state.products];

  const nextState = { ...state, products };
  saveState(nextState);
  return nextProduct;
}

export function deleteDemoProduct(productId: string) {
  const state = readState();
  const nextState = {
    ...state,
    products: state.products.filter((product) => product.id !== productId),
    clients: state.clients.map((client) => ({
      ...client,
      produtos: client.produtos.filter((product) => product.id !== productId),
    })),
  };
  saveState(nextState);
}

export function addDemoProducts(rows: Array<{ nome: string; descricao: string; preco: number }>) {
  const state = readState();
  const nextProducts = rows.map((row) => ({
    id: id('prod'),
    usuario_id: demoUser.id,
    nome: row.nome,
    descricao: row.descricao || null,
    preco: row.preco,
    imagem_url: null,
    data_criacao: nowIso(),
  }));

  saveState({ ...state, products: [...nextProducts, ...state.products] });
}

export function createDemoSale(values: { clienteId: string; valor: number; dataVenda: string; proximaVisita: string | null }) {
  const state = readState();
  const client = state.clients.find((item) => item.id === values.clienteId);

  if (!client) {
    throw new Error('Cliente demo nao encontrado.');
  }

  const sale: Sale = {
    id: id('sale'),
    cliente_id: values.clienteId,
    valor: values.valor,
    data_venda: values.dataVenda,
    proxima_visita: values.proximaVisita,
    data_criacao: nowIso(),
  };

  const saleWithClient: SaleWithClient = {
    ...sale,
    cliente_nome: client.nome,
    cliente_cidade: client.cidade,
  };

  saveState({ ...state, sales: [saleWithClient, ...state.sales] });
  return sale;
}

export function buildDemoRoute(selectedClientIds: string[]): OptimizedRouteResult {
  const clients = listDemoRouteClients().filter((client) => selectedClientIds.includes(client.id));
  const ordered = [...clients].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
  const stops = ordered.map((client, index) => ({
    clientId: client.id,
    nome: client.nome,
    endereco: client.endereco ?? '',
    cidade: client.cidade,
    regiaoNome: client.regiao_nome,
    order: index,
    legDistanceMeters: index === 0 ? null : 2500 + index * 900,
    legDurationSeconds: index === 0 ? null : 900 + index * 240,
    isOrigin: index === 0,
    isDestination: index === ordered.length - 1,
  }));

  const totalDistanceMeters = stops.reduce((sum, stop) => sum + (stop.legDistanceMeters ?? 0), 0);
  const totalDurationSeconds = stops.reduce((sum, stop) => sum + (stop.legDurationSeconds ?? 0), 0);

  return {
    summary: {
      totalDistanceMeters,
      totalDurationSeconds,
      selectedCount: ordered.length,
      waypointOrder: ordered.map((_stop, index) => index).filter((index) => index > 0 && index < ordered.length - 1),
      cached: true,
    },
    stops,
    warnings: ['Modo demo ativo. Rotas simuladas sem consultar APIs externas.'],
    originLabel: ordered[0]?.nome ?? 'Origem demo',
    destinationLabel: ordered[ordered.length - 1]?.nome ?? 'Destino demo',
    cacheKey: 'demo-cache',
  };
}

export function analyzeDemoImport(rows: Array<{ rowNumber: number; nome: string; descricao: string; preco: string }>) {
  return {
    summary: {
      totalRows: rows.length,
      rowsWithWarnings: rows.filter((row) => row.nome.trim().length === 0 || row.preco.trim().length === 0).length,
      categories: ['Demo'],
      notes: ['Modo demo ativo. A IA foi desativada.'],
    },
    rows: rows.map((row) => ({
      rowNumber: row.rowNumber,
      nomeCorrigido: row.nome.trim() || 'Produto demo',
      descricaoPadronizada: row.descricao.trim() || 'Descricao demo',
      categoriaSugerida: 'Demo',
      possiveisErros: row.nome.trim().length === 0 ? ['Nome ausente'] : [],
      observacoes: ['Analisado localmente em modo demo'],
    })),
  };
}
