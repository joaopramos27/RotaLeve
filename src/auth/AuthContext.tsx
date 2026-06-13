import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import { isDemoMode } from '../lib/appMode';
import { getDemoSession } from '../features/demo/demoStore';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode) {
      setSession(getDemoSession() as Session);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function loadSession() {
      // Load any existing session on startup so refreshes keep the user logged in.
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error('Failed to load Supabase session:', error);
      }

      setSession(data.session ?? null);
      setLoading(false);
    }

    loadSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, nextSession: Session | null) => {
      // Keep the in-memory auth state aligned with Supabase auth events.
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signOut: async () => {
        if (isDemoMode) {
          setSession(null);
          return;
        }

        await supabase.auth.signOut();
      },
      refreshSession: async () => {
        if (isDemoMode) {
          setSession(getDemoSession() as Session);
          return;
        }

        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          throw error;
        }
        setSession(data.session ?? null);
      },
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
