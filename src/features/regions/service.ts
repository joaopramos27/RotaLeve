import { supabase } from '../../lib/supabase/client';
import { isDemoMode } from '../../lib/appMode';
import { listDemoRegions } from '../demo/demoStore';
import type { ClientRegion } from '../clients/types';

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
