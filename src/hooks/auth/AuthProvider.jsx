/**
 * AuthProvider — supabase 세션을 Context 에 단일 소스로 보관
 *
 * 여러 useAuth() 인스턴스가 각자 getSession() 을 돌려 타이밍 불일치가 나는 문제 방지.
 * App 루트에서 한 번 구독, 나머지는 useContext 로 동일 state 참조.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const AuthContext = createContext({
  session: null,
  user: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (canceled) return;
      setSession(data.session || null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next || null);
      setLoading(false);
    });

    return () => {
      canceled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const role = session?.user?.app_metadata?.role || null;
  const value = {
    session,
    user: session?.user || null,
    loading,
    isAuthenticated: !!session?.user,
    isAdmin: role === 'admin',
  };

  return <AuthContext.Provider value={ value }>{ children }</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
