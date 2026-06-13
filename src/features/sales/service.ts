import { supabase } from '../../lib/supabase/client';
import { isDemoMode } from '../../lib/appMode';
import { createDemoSale, listDemoClients, listDemoSales } from '../demo/demoStore';
import type { Sale, SaleClient, SaleFormValues, SalesPageData, SalesSummary, SaleWithClient } from './types';
import { parseSaleValue } from './utils';

type SaleClientRow = SaleClient;

function normalizeOptionalDate(value: string) {
  return value.trim() ? value : null;
}

export async function listSalesPageData(userId: string): Promise<SalesPageData> {
  if (isDemoMode) {
    const clients = listDemoClients().map((client) => ({
      id: client.id,
      nome: client.nome,
      cidade: client.cidade,
    }));

    return {
      clients,
      sales: listDemoSales(),
    };
  }

  const [clientsResponse, salesResponse] = await Promise.all([
    supabase.from('clientes').select('id, nome, cidade').eq('usuario_id', userId).order('nome', { ascending: true }),
    supabase
      .from('vendas')
      .select('id, cliente_id, valor, data_venda, proxima_visita, data_criacao')
      .order('data_criacao', { ascending: false }),
  ]);

  const { data: clients, error: clientsError } = clientsResponse;
  if (clientsError) {
    throw clientsError;
  }

  const { data: sales, error: salesError } = salesResponse;
  if (salesError) {
    throw salesError;
  }

  const clientRows = (clients ?? []) as SaleClientRow[];
  const saleRows = (sales ?? []) as Sale[];
  const clientMap = new Map(clientRows.map((client) => [client.id, client]));

  const salesWithClient: SaleWithClient[] = saleRows.map((row) => {
    const client = clientMap.get(row.cliente_id) as SaleClientRow | undefined;

    return {
      ...row,
      cliente_nome: client?.nome ?? 'Cliente removido',
      cliente_cidade: client?.cidade ?? null,
    };
  });

  return {
    clients: clientRows,
    sales: salesWithClient,
  };
}

export async function createSale(values: SaleFormValues) {
  if (isDemoMode) {
    return createDemoSale({
      clienteId: values.clienteId,
      valor: parseSaleValue(values.valor),
      dataVenda: values.dataVenda,
      proximaVisita: normalizeOptionalDate(values.proximaVisita),
    });
  }

  const { data, error } = await supabase
    .from('vendas')
    .insert({
      cliente_id: values.clienteId,
      valor: parseSaleValue(values.valor),
      data_venda: values.dataVenda,
      proxima_visita: normalizeOptionalDate(values.proximaVisita),
    })
    .select('id, cliente_id, valor, data_venda, proxima_visita, data_criacao')
    .single();

  if (error) {
    throw error;
  }

  return data as Sale;
}

export function buildSalesSummary(sales: SaleWithClient[]): SalesSummary {
  const totalSold = sales.reduce((sum, sale) => sum + sale.valor, 0);
  const clientsServed = new Set(sales.map((sale) => sale.cliente_id)).size;
  const nextVisits = sales.filter((sale) => Boolean(sale.proxima_visita)).length;

  return {
    totalSold,
    salesCount: sales.length,
    clientsServed,
    nextVisits,
  };
}
