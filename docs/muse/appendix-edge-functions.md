# appendix. Edge Functions (MUSE)

> 외부 API 서버 이전 부록. 디자이너 미열람 전제.

## 개요

외부 API (Anthropic) 호출은 **모두 Edge Function 경유**. 비밀 키는 Supabase secrets 에만 존재. 프론트 번들에 노출되지 않음.

관련 가이드: `.claude/skills/supabase-integration/resources/edge-functions.md`

## 함수 목록

| 함수명 | 목적 | 호출 권한 | 외부 의존 | 필요 secret | Rate Limit |
|-------|-----|---------|---------|-----------|-----------|
| `anthropic-messages` | T1 (vision) / T2 (recommend) / T3 (analyze) 통합 프록시 | 로그인 사용자 | api.anthropic.com | `ANTHROPIC_API_KEY` | 100회/일/user (free), 무제한 (paid) |

## `anthropic-messages` 함수 계약

**Method**: POST
**경로**: `/functions/v1/anthropic-messages`
**Auth**: Supabase JWT 필수

**입력**:
```json
{
  "task": "t1-auto-tag" | "t2-recommend" | "t3-analyze-tokens",
  "messages": [{ "role": "user", "content": [...] }],
  "model": "claude-haiku-4-5-20251001",
  "max_tokens": 8192,
  "tools": [...],
  "tool_choice": { "type": "tool", "name": "..." }
}
```

**출력 (성공)**:
```json
{
  "data": { "content": [...], "stop_reason": "tool_use" }
}
```

**에러 코드**: `unauthorized` (401) / `invalid_input` (400) / `quota_exceeded` (429) / `upstream_error` (502)

## 프론트 호출 패턴

```jsx
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.functions.invoke('anthropic-messages', {
  body: { task: 't3-analyze-tokens', messages, model, max_tokens: 8192, tools, tool_choice }
});
```

## 로컬 개발

```bash
# 1. secret 로컬 env 파일 (.gitignore)
echo "ANTHROPIC_API_KEY=sk-ant-..." > supabase/functions/.env.local

# 2. 로컬 실행
pnpm functions:serve

# 3. 테스트
curl -X POST http://localhost:54321/functions/v1/anthropic-messages \
  -H "Authorization: Bearer $(supabase status -o json | jq -r .anon_key)" \
  -H "Content-Type: application/json" \
  -d '{"task":"t1-auto-tag","messages":[...]}'
```

## 배포

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
pnpm functions:deploy anthropic-messages
```

## Stage A → C 이전 기록 (감사)

| 날짜 | 함수 | Stage A 키 revoke | 번들 검증 |
|------|------|---------------------|----------|
| 2026-04-23 | anthropic-messages | ✅ revoked (구 VITE_ANTHROPIC_KEY 제거됨) | ✅ `pnpm build && grep -r "sk-ant" dist/` → 0건 |

## 운영 체크리스트

- [x] 함수 최상단 JWT 검증 (비로그인 호출 401)
- [x] Secret 이 `.env*` 파일에 없음 (서버 secrets 만 존재)
- [x] `pnpm build && grep -rE "sk-ant|sk-[A-Za-z0-9]{20,}" dist/` → 0건
- [x] 함수 로그에 PII 평문 미노출
- [x] Rate limit 정책 문서화 (free 100회/일, paid 무제한)
- [x] CORS Origin 좁힘 (프로덕션 도메인 + localhost:5173 만 허용)
- [x] Storybook 스토리가 `functions.invoke` mock 으로 동작
