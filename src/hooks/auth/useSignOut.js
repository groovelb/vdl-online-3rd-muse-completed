import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export function useSignOut() {
  const [loading, setLoading] = useState(false);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  return { signOut, loading };
}
