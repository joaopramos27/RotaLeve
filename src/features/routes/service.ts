import { supabase } from '../../lib/supabase/client';
import { isDemoMode } from '../../lib/appMode';
import { buildDemoRoute, listDemoRouteClients } from '../demo/demoStore';
import { listRegions } from '../regions/service';
import type { RouteClient, RouteGenerationResponse } from './types';

type RouteClientRow = {
  id: string;
  usuario_id: string;
  nome: string;
  telefone: string | null;
  cidade: string | null;
  endereco: string | null;
  regiao_id: string | null;
};

function cleanOptionalText(value: string | null | undefined) {
  const text = value?.trim().replace(/\s+/g, ' ') ?? '';
  return text.length > 0 ? text : null;
}

function cleanRequiredText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export async function listRouteClients(userId: string): Promise<RouteClient[]> {
  if (isDemoMode) {
    return listDemoRouteClients();
  }

  const [clientsResponse, regions] = await Promise.all([
    supabase
      .from('clientes')
      .select('id, usuario_id, nome, telefone, cidade, endereco, regiao_id')
      .eq('usuario_id', userId)
      .order('nome', { ascending: true }),
    listRegions(userId),
  ]);

  const { data: clients, error: clientsError } = clientsResponse;
  if (clientsError) {
    throw clientsError;
  }

  const regionMap = new Map(regions.map((region) => [region.id, region.nome]));

  return ((clients ?? []) as RouteClientRow[]).map((row) => {
    return {
      id: row.id,
      nome: cleanRequiredText(row.nome),
      telefone: cleanOptionalText(row.telefone),
      cidade: cleanOptionalText(row.cidade),
      endereco: cleanOptionalText(row.endereco),
      regiao_nome: row.regiao_id ? regionMap.get(row.regiao_id) ?? null : null,
    };
  });
}

export async function generateOptimizedRoute(selectedClientIds: string[]) {
  if (isDemoMode) {
    return buildDemoRoute(selectedClientIds);
  }

  const uniqueSelectedIds = [...new Set(selectedClientIds.map((id) => id.trim()).filter((id) => id.length > 0))];

  const { data, error } = await supabase.functions.invoke('optimize-route', {
    body: {
      selectedClientIds: uniqueSelectedIds,
    },
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('A geracao da rota nao retornou dados.');
  }

  return data as RouteGenerationResponse;
}
