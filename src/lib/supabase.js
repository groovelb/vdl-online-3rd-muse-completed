/**
 * Supabase client singleton
 *
 * anon key 는 브라우저 노출 전제. RLS 가 서버사이드 보안 레이어.
 * service_role key 는 프론트에서 절대 금지 (Edge Function 전용).
 */

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.error('[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 .env.local 에 없습니다.');
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
