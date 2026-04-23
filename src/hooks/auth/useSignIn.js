import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { normalizeSupabaseError } from '../../utils/supabaseError';

export function useSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signIn = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(normalizeSupabaseError(err));
      return { ok: false, error: err };
    }
    return { ok: true, data };
  };

  return { signIn, loading, error };
}
