import { supabase } from '../../lib/supabase/client';
import { isDemoMode } from '../../lib/appMode';
import { createOrUpdateDemoClient, deleteDemoClient, listDemoClientProducts, listDemoClients, listDemoProducts } from '../demo/demoStore';
import { listProducts } from '../products/service';
import type {
  Client,
  ClientFormValues,
  ClientPageData,
  ClientProduct,
  ClientRegion,
  ClientWithRelations,
} from './types';
import { listRegions } from '../regions/service';

type ClientProductLinkRow = {
  cliente_id: string;
  produto_id: string;
};

function cleanOptionalText(value: string) {
  const text = value.trim();
  return text.length > 0 ? text : null;
}

export async function listClientsPageData(userId: string): Promise<ClientPageData> {
  if (isDemoMode) {
    const clients = listDemoClients();
    const regions = listRegions(userId);
    const products = listDemoProducts().map((product) => ({
      id: product.id,
      nome: product.nome,
      preco: product.preco,
    }));

    return {
      clients,
      regions: await regions,
      products,
    };
  }

  const [clientsResponse, regions, productsResponse, linksResponse] = await Promise.all([
    supabase
      .from('clientes')
      .select('id, usuario_id, nome, telefone, cidade, endereco, regiao_id, observacoes, data_criacao')
      .eq('usuario_id', userId)
      .order('data_criacao', { ascending: false }),
    listRegions(userId),
    listProducts(userId),
    supabase.from('cliente_produtos').select('cliente_id, produto_id'),
  ]);

  const { data: clients, error: clientsError } = clientsResponse;
  if (clientsError) {
    throw clientsError;
  }

  const products = productsResponse.map((product) => ({
    id: product.id,
    nome: product.nome,
    preco: product.preco,
  }));
  const productMap = new Map(products.map((product) => [product.id, product]));
  const regionMap = new Map(regions.map((region) => [region.id, region.nome]));

  const { data: links, error: linksError } = linksResponse;
  if (linksError) {
    throw linksError;
  }

  const groupedLinks = new Map<string, string[]>();
  for (const link of links ?? []) {
    const row = link as ClientProductLinkRow;
    const current = groupedLinks.get(row.cliente_id) ?? [];
    current.push(row.produto_id);
    groupedLinks.set(row.cliente_id, current);
  }

  const clientsWithRelations: ClientWithRelations[] = ((clients ?? []) as Client[]).map((clientRecord) => {
    const productIds = groupedLinks.get(clientRecord.id) ?? [];

    return {
      ...clientRecord,
      regiao_nome: clientRecord.regiao_id ? regionMap.get(clientRecord.regiao_id) ?? null : null,
      produtos: productIds
        .map((productId) => productMap.get(productId))
        .filter((product: ClientProduct | undefined): product is ClientProduct => Boolean(product))
        .map((product) => ({
          id: product.id,
          nome: product.nome,
          preco: product.preco,
        })),
    };
  });

  return {
    clients: clientsWithRelations,
    regions,
    products,
  };
}

export async function createClient(userId: string, values: ClientFormValues) {
  if (isDemoMode) {
    return createOrUpdateDemoClient(userId, {
      nome: values.nome.trim(),
      telefone: cleanOptionalText(values.telefone),
      cidade: cleanOptionalText(values.cidade),
      endereco: cleanOptionalText(values.endereco),
      regiaoId: values.regiaoId || null,
      observacoes: cleanOptionalText(values.observacoes) ?? '',
      productIds: values.productIds,
    });
  }

  const { data, error } = await supabase.rpc('save_client_with_products', {
    p_usuario_id: userId,
    p_cliente_id: null,
    p_nome: values.nome.trim(),
    p_telefone: cleanOptionalText(values.telefone),
    p_cidade: cleanOptionalText(values.cidade),
    p_endereco: cleanOptionalText(values.endereco),
    p_regiao_id: values.regiaoId || null,
    p_observacoes: cleanOptionalText(values.observacoes) ?? '',
    p_product_ids: values.productIds,
  });

  if (error) {
    throw error;
  }

  return data as Client;
}

export async function updateClient(userId: string, clientId: string, values: ClientFormValues) {
  if (isDemoMode) {
    return createOrUpdateDemoClient(userId, {
      clientId,
      nome: values.nome.trim(),
      telefone: cleanOptionalText(values.telefone),
      cidade: cleanOptionalText(values.cidade),
      endereco: cleanOptionalText(values.endereco),
      regiaoId: values.regiaoId || null,
      observacoes: cleanOptionalText(values.observacoes) ?? '',
      productIds: values.productIds,
    });
  }

  const { data, error } = await supabase.rpc('save_client_with_products', {
    p_usuario_id: userId,
    p_cliente_id: clientId,
    p_nome: values.nome.trim(),
    p_telefone: cleanOptionalText(values.telefone),
    p_cidade: cleanOptionalText(values.cidade),
    p_endereco: cleanOptionalText(values.endereco),
    p_regiao_id: values.regiaoId || null,
    p_observacoes: cleanOptionalText(values.observacoes) ?? '',
    p_product_ids: values.productIds,
  });

  if (error) {
    throw error;
  }

  return data as Client;
}

export async function deleteClient(userId: string, clientId: string) {
  if (isDemoMode) {
    deleteDemoClient(clientId);
    return;
  }

  const { error } = await supabase.from('clientes').delete().eq('id', clientId).eq('usuario_id', userId);

  if (error) {
    throw error;
  }
}
