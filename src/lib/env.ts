import { isDemoMode } from './appMode';

function readEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];

  if (!value && !isDemoMode) {
    throw new Error(`Missing required environment variable: ${String(key)}`);
  }

  return value ?? '';
}

export const env = {
  supabaseUrl: readEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: readEnv('VITE_SUPABASE_ANON_KEY'),
};
