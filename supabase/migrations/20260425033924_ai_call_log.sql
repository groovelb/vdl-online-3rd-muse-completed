-- Edge Function rate-limit 용 호출 로그 테이블
-- anthropic-messages Edge Function이 service_role 로 insert/count.
-- anon / authenticated 정책을 만들지 않으므로 프론트에서는 접근 불가.

create table if not exists public.ai_call_log (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists ai_call_log_user_time_idx
  on public.ai_call_log (user_id, created_at desc);

alter table public.ai_call_log enable row level security;
-- 정책 없음 = service_role 키(Edge Function)로만 접근 허용
