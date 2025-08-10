import { useState, useEffect } from 'react';
import { supabase } from './supabase';

/**
 * Lightweight hook to expose Supabase auth state and common actions.
 * Usage:
 *   const { user, loading, signIn, signUp, signOut } = useSupabaseAuth();
 */
export function useSupabaseAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get current user on mount
    (async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(currentUser ?? null);
      setLoading(false);
    })();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
    return { error };
  };

  return { user, loading, signUp, signIn, signOut };
}
