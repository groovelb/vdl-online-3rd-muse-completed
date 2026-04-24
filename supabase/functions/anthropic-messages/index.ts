/**
 * anthropic-messages — Anthropic Messages API 릴레이 Edge Function
 *
 * Flow:
 *   1. 호출자 JWT 검증 (로그인 사용자만)
 *   2. Rate limit — 사용자당 분당 RATE_LIMIT_PER_MINUTE 회
 *   3. 입력 검증 { model, messages[] }
 *   4. Anthropic 호출 (키는 ANTHROPIC_API_KEY secret)
 *   5. 호출 로그 기록 후 Anthropic 응답 그대로 반환
 *
 * Secrets:
 *   ANTHROPIC_API_KEY              — Anthropic console 발급 키
 *   SUPABASE_URL                   — 플랫폼 자동 주입
 *   SUPABASE_ANON_KEY              — 플랫폼 자동 주입 (JWT 검증용)
 *   SUPABASE_SERVICE_ROLE_KEY      — 플랫폼 자동 주입 (rate limit 테이블 접근용)
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MAX_TOKENS = 4096;
const RATE_LIMIT_PER_MINUTE = 20;

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'unauthorized' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: 'server_misconfigured', detail: 'supabase env missing' }, 500);
    }
    if (!anthropicKey) {
      return json({ error: 'server_misconfigured', detail: 'ANTHROPIC_API_KEY missing' }, 500);
    }

    // 1. JWT 검증
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return json({ error: 'unauthorized' }, 401);
    }

    // 2. Rate limit (service role 로 ai_call_log 조회)
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();

    const { count, error: countError } = await adminClient
      .from('ai_call_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneMinuteAgo);

    if (countError) {
      console.error('rate_limit_check_failed', countError);
      return json({ error: 'rate_limit_check_failed' }, 500);
    }
    if ((count ?? 0) >= RATE_LIMIT_PER_MINUTE) {
      return json(
        {
          error: 'rate_limited',
          message: `분당 ${RATE_LIMIT_PER_MINUTE}회 호출 제한 초과`,
          retry_after_seconds: 60,
        },
        429,
      );
    }

    // 3. 입력 검증
    const body = await req.json().catch(() => null);
    if (!body || typeof body.model !== 'string' || !Array.isArray(body.messages)) {
      return json(
        {
          error: 'invalid_input',
          hint: 'body must include { model: string, messages: array }',
        },
        400,
      );
    }

    // 4. Anthropic 호출
    const upstream = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        max_tokens: DEFAULT_MAX_TOKENS,
        ...body,
      }),
    });

    const text = await upstream.text();

    // 5. 호출 카운트 기록 (에러 응답도 기록 — 리소스 소비/노이즈 방지)
    const { error: logError } = await adminClient
      .from('ai_call_log')
      .insert({ user_id: user.id });
    if (logError) {
      console.error('ai_call_log_insert_failed', logError);
    }

    return new Response(text, {
      status: upstream.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('edge_function_error', e);
    return json(
      {
        error: 'internal_error',
        detail: e instanceof Error ? e.message : String(e),
      },
      500,
    );
  }
});
