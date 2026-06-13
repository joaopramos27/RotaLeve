import { supabase } from '../../lib/supabase/client';
import { isDemoMode } from '../../lib/appMode';
import { listDemoRegions, updateDemoState } from '../demo/demoStore';
import type { ClientRegion } from '../clients/types';

function cleanRegionName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export async function listRegions(userId: string): Promise<ClientRegion[]> {
  if (isDemoMode) {
    return listDemoRegions();
  }

  const { data, error } = await supabase
    .from('regioes')
    .select('id, nome')
    .eq('usuario_id', userId)
    .order('nome', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as ClientRegion[];
}

export async function findOrCreateRegion(userId: string, name: string): Promise<ClientRegion> {
  const regionName = cleanRegionName(name);

  if (!regionName) {
    throw new Error('Informe o nome da nova regiao.');
  }

  if (isDemoMode) {
    const existing = listDemoRegions().find((region) => region.nome.localeCompare(regionName, 'pt-BR', { sensitivity: 'base' }) === 0);

    if (existing) {
      return existing;
    }

    const createdRegion = {
      id: `reg_${crypto.randomUUID()}`,
      nome: regionName,
    };

    updateDemoState((state) => ({
      ...state,
      regions: [...state.regions, createdRegion].sort((left, right) =>
        left.nome.localeCompare(right.nome, 'pt-BR', { sensitivity: 'base' }),
      ),
    }));

    return createdRegion;
  }

  const { data: existingRegion, error: existingError } = await supabase
    .from('regioes')
    .select('id, nome')
    .eq('usuario_id', userId)
    .eq('nome', regionName)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingRegion) {
    return existingRegion as ClientRegion;
  }

  const { data: createdRegion, error: createError } = await supabase
    .from('regioes')
    .insert({
      usuario_id: userId,
      nome: regionName,
    })
    .select('id, nome')
    .single();

  if (createError) {
    if (createError.code === '23505') {
      const { data: duplicateRegion, error: duplicateError } = await supabase
        .from('regioes')
        .select('id, nome')
        .eq('usuario_id', userId)
        .eq('nome', regionName)
        .single();

      if (duplicateError) {
        throw duplicateError;
      }

      return duplicateRegion as ClientRegion;
    }

    throw createError;
  }

  return createdRegion as ClientRegion;
}
