import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { normalizeSupabaseError } from '../../utils/supabaseError';

export function useSignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signUp = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (err) {
      setError(normalizeSupabaseError(err));
      return { ok: false, error: err };
    }
    return { ok: true, data };
  };

  return { signUp, loading, error };
}
