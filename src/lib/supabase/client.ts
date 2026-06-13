import { createClient } from '@supabase/supabase-js';
import { isDemoMode } from '../appMode';
import { env } from '../env';
import { getDemoSession } from '../../features/demo/demoStore';

function createDemoSupabaseClient() {
  const session = getDemoSession();

  return {
    auth: {
      async getSession() {
        return { data: { session }, error: null };
      },
      onAuthStateChange(callback: (_event: string, nextSession: typeof session | null) => void) {
        callback('SIGNED_IN', session);
        return { data: { subscription: { unsubscribe() {} } } };
      },
      async signInWithPassword() {
        return { data: { session, user: session.user }, error: null };
      },
      async signOut() {
        return { error: null };
      },
      async refreshSession() {
        return { data: { session }, error: null };
      },
      async getUser() {
        return { data: { user: session.user }, error: null };
      },
    },
    from() {
      throw new Error('Supabase data access is disabled in demo mode.');
    },
    rpc() {
      throw new Error('Supabase RPC is disabled in demo mode.');
    },
    functions: {
      invoke() {
        throw new Error('Supabase Edge Functions are disabled in demo mode.');
      },
    },
    storage: {
      from() {
        throw new Error('Supabase Storage is disabled in demo mode.');
      },
    },
  };
}

export const supabase = isDemoMode
  ? (createDemoSupabaseClient() as any)
  : createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        // The SDK keeps the session in browser storage and refreshes it automatically.
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });

