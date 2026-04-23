# MUSE — Supabase Integration 튜토리얼 (Step-by-step)

> 교육생/본인이 `backend-integration-plan.md` 를 따라 MUSE 백엔드를 처음부터 끝까지 붙일 수 있도록 한 **실행 매뉴얼**. 명령어 위주 + 각 스텝의 "왜/확인방법" 명시.
>
> 관련 스킬: `/supabase-integration` (각 Step 실행 전에 해당 Phase 호출)

---

## 사전 준비 (Step 0)

### 0-1. Supabase 계정 & 프로젝트 생성

1. https://supabase.com → 로그인 → **New Project**
2. 프로젝트 이름: `muse-dev` (임의). Region 가까운 곳 (`Northeast Asia (Seoul)`)
3. DB 비밀번호 설정 후 저장 (1Password 등)
4. 프로젝트 생성 후 **Settings → API** 에서:
   - `Project URL` 복사
   - `anon (public) API key` 복사

### 0-2. `.env.local` 에 키 등록

```bash
# .env.local (수정, 기존 ANTHROPIC_API_KEY 는 유지)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> ⚠️ `service_role key` 는 프론트에 **절대 금지**. anon key만 사용.

### 0-3. Supabase CLI 준비

이미 설치됨 (v2.84.2 확인). 프로젝트 init:

```bash
# 프로젝트 루트에서
supabase init
```

생성된 `supabase/` 디렉터리를 git에 커밋.

### 0-4. 원격 프로젝트 링크

```bash
supabase login            # 브라우저로 토큰 승인
supabase link --project-ref xxxx    # Project URL의 xxxx 부분
```

### 0-5. 체크포인트

```bash
supabase status           # 로컬 스택 상태
supabase projects list    # 원격 프로젝트 목록에 muse-dev 보여야 함
```

---

## Phase 1 — DB 스키마 (Step 1)

### 1-1. `/supabase-integration` 스킬 호출

> "Phase 1 진행. backend-integration-plan.md 2장 매핑대로 스키마 마이그레이션 작성해줘"

결과물:
- `docs/muse/04-db-schema.md` (ERD + 테이블 상세)
- `supabase/migrations/{ts}_init_schema.sql`

### 1-2. 마이그레이션 내용 리뷰 핵심

확인 체크리스트:
- [ ] 모든 테이블에 `id uuid default gen_random_uuid()`, `created_at`, `updated_at`
- [ ] `references.tags` 는 `jsonb not null default '{}'::jsonb`
- [ ] `references.tags` 에 `gin` 인덱스
- [ ] `analysis_results.project_id` `UNIQUE` 제약 (1:1)
- [ ] `project_references.(project_id, reference_id)` 복합 PK
- [ ] 모든 FK에 `on delete cascade` (레퍼런스 삭제 시 project_references 자동 정리)
- [ ] `set_updated_at` 트리거가 모든 `updated_at` 보유 테이블에 부착

### 1-3. 적용

```bash
# 로컬 검증
supabase start            # 로컬 Postgres + Studio 기동 (Docker 필요)
supabase db reset         # 마이그레이션 전체 재적용

# Studio 에서 확인: http://localhost:54323
# Table Editor → public 스키마에 6개 테이블 보이면 OK

# 원격 적용
supabase db push
```

### 1-4. 승인 → Step 2

---

## Phase 2 — 인증 (Step 2)

### 2-1. 스킬 호출

> "Phase 2 진행"

결과물:
- `docs/muse/05-auth-design.md`
- `supabase/migrations/{ts}_auth_profiles.sql` (profiles + handle_new_user 트리거 + user_settings 동시 생성)

### 2-2. Supabase Dashboard 설정 (수동)

1. **Auth → Providers → Email** Enabled
2. **Auth → Settings → Confirm email** ON
3. **Auth → URL Configuration**:
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173/*`

### 2-3. 적용 & 검증

```bash
supabase db push
```

Studio → Authentication → Users 탭에서 **+ Add user** 로 테스트 계정 추가 → Table Editor → `profiles` 에 자동으로 row 생성됐는지 확인 (handle_new_user 트리거 동작).

### 2-4. 승인 → Step 3

---

## Phase 3 — RLS (Step 3)

### 3-1. 스킬 호출

> "Phase 3 진행"

결과물:
- `docs/muse/06-rls-policies.md` (정책 매트릭스)
- `supabase/migrations/{ts}_rls_policies.sql`
- `is_project_owner()` helper 함수 포함

### 3-2. 검증 쿼리 (Studio SQL Editor)

```sql
-- RLS 미활성 테이블 (0건이어야 함)
select tablename from pg_tables
where schemaname = 'public' and rowsecurity = false;

-- 서로 다른 사용자 격리 테스트
-- 1. 사용자 A로 로그인해서 레퍼런스 생성
-- 2. 사용자 B로 전환 → A의 레퍼런스가 보이지 않아야 함
```

### 3-3. 적용

```bash
supabase db push
```

### 3-4. 승인 → Step 4

---

## Phase 4 — 클라이언트 코드 (Step 4)

### 4-1. 패키지 설치

```bash
pnpm add @supabase/supabase-js
```

### 4-2. 스킬 호출

> "Phase 4 진행. 기존 useReferencesSlice / useProjectsSlice / useAnalysesSlice / useSettingsSlice 시그니처 유지해줘 (컴포넌트 수정 0 목표)"

결과물:
- `src/lib/supabase.js` (client singleton + session listener)
- `src/utils/supabaseError.js`
- `src/types/database.js` (JSDoc typedef, `supabase gen types` 결과 변환)
- `src/hooks/auth/{useAuth,useSignUp,useSignIn,useSignOut}.js`
- `src/hooks/data/{useReferences,useProjects,useAnalyses,useSettings}.js`
- `src/store/museStore.jsx` **shim 전환** (기존 슬라이스 훅을 위임)

### 4-3. 이미지 업로드 경로 교체

`ArchivePage` 의 업로드 플로우:

1. File → `supabase.storage.from('references').upload({user_id}/{refId}.ext, file)`
2. 성공 → `references` insert (`storage_path`)
3. 조회 훅 `useReferences` 가 signed URL 생성해서 `thumbnailUrl` 로 노출

### 4-4. Storybook 회귀 확인

```bash
pnpm storybook
```

- `MUSE/Page/ArchivePage` 등 기존 스토리가 27장 fixtures 그대로 보여야 함 (mock client 주입 경로)
- `seed='fixtures'` 경로는 유지

### 4-5. 로그인 UI 생성 (별도 스킬 위임)

```
/component-work LoginForm, SignUpForm, AuthGuard 3개 생성.
useSignIn/useSignUp/useAuth 훅 소비. input/ 카테고리 + layout/AuthGuard.
```

`App.jsx` 에 `<AuthGuard>` 로 Routes 감싸기.

### 4-6. 승인 → Step 5

---

## Phase 5 — 검증 & 배포 (Step 5)

### 5-1. 스모크 테스트

로컬 `pnpm dev`:

1. 회원가입 → 이메일 인증 링크 수신 → 로그인
2. 아카이브에 이미지 1장 업로드 → T1 자동 태깅 (기존 Dev 프록시 사용)
3. Supabase Studio → Storage → `references` 에 파일 확인
4. Table Editor → `references` 에 row 생성 + tags 채워짐 확인
5. 새 프로젝트 생성 → T2 추천 → T3 분석 → `analysis_results` row 생성
6. ZIP export 동작 확인
7. 로그아웃 → 다른 계정 로그인 → 이전 데이터 보이지 않는지 (RLS 격리)

### 5-2. 스킬 호출

> "Phase 5 검증 완료. 07-api-integration.md 작성"

결과물: `docs/muse/07-api-integration.md`

### 5-3. 승인 → Step 6 (또는 종료)

---

## Phase 6 — Anthropic Edge Function (Step 6, 필수)

**이 Step을 건너뛰면 프로덕션 배포 시 AI 호출 불가**. MUSE는 반드시 수행.

### 6-1. 스킬 호출

> "Phase 6 진행. anthropic-proxy Edge Function 작성. 기능 검증은 이미 끝났으니 Stage C 바로."

결과물:
- `supabase/functions/anthropic-proxy/index.ts`
- `docs/muse/08-edge-functions.md`
- `src/utils/museAi.js` 내부 구현 교체 (시그니처 유지)
- `package.json` scripts: `functions:serve`, `functions:deploy`
- `supabase/functions/.env.local` (gitignored)

### 6-2. Secret 등록

```bash
# 기존 ANTHROPIC_API_KEY 를 Supabase secrets 로 이전
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

### 6-3. 로컬 테스트

```bash
# 로컬 secret 파일
echo "ANTHROPIC_API_KEY=sk-ant-..." > supabase/functions/.env.local

# 로컬 함수 서버
pnpm functions:serve

# 다른 터미널 — 토큰 꺼내서 POST
TOKEN=$(supabase status -o json | jq -r .anon_key)
curl -X POST http://localhost:54321/functions/v1/anthropic-proxy \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-haiku-4-5","max_tokens":32,"messages":[{"role":"user","content":"say hi"}]}'
```

### 6-4. 배포

```bash
pnpm functions:deploy anthropic-proxy
```

### 6-5. 프론트 env 정리 & 검증

```bash
# .env.local 에서 ANTHROPIC_API_KEY 제거

# 프로덕션 번들에 키 노출 0건 확인
pnpm build
grep -rE "sk-ant-[A-Za-z0-9_-]{20,}" dist/ || echo "✅ 노출 없음"

# 외부 서비스(Anthropic Console)에서 기존 개발용 키 revoke
```

### 6-6. 최종 체크리스트

- [ ] 로그아웃 상태 `anthropic-proxy` 호출 → 401
- [ ] 로그인 상태 호출 → 정상 응답
- [ ] `pnpm build && grep -rE "sk-" dist/` → 0건
- [ ] `supabase secrets list` 에 `ANTHROPIC_API_KEY` 존재
- [ ] Storybook 스토리가 `functions.invoke` mock 으로 동작

---

## 트러블슈팅

### "Email not confirmed" 로그인 에러
→ Supabase Dashboard → Users → 해당 계정에서 **Confirm user** 클릭. 또는 inbox 에서 링크 클릭.

### RLS 42501 에러
→ Studio SQL Editor 에서:
```sql
select * from pg_policies where tablename = '<table>';
```
정책이 빠졌거나 `using` 조건이 틀렸을 가능성. `is_project_owner()` 호출 경로 확인.

### Storybook 에서 실제 Supabase 호출됨
→ `src/hooks/data/*` 의 client 파라미터가 mock 으로 주입되지 않음. `.storybook/preview.jsx` 의 데코레이터 확인.

### 이미지 signed URL 만료
→ `createSignedUrl(path, 3600)` 는 1시간. 프론트에서 조회 시점마다 새로 생성하거나 TTL 늘리기. 공개 bucket 으로 전환 시 `getPublicUrl` 사용 (단, MUSE 는 사적 데이터이므로 비권장).

### Anthropic proxy cold start
→ Supabase Edge Function (Deno) cold start ~200-500ms. Anthropic 호출 자체가 수초라 체감 영향 미미. 필요 시 `wrangler`/`vercel` 대안도 가능 (플랜 의존).

---

## 참고 링크

- 전체 계획: `./backend-integration-plan.md`
- 데이터 모델: `./02-ux-flow.md#데이터-모델`
- Supabase MCP/CLI 역할: `.claude/skills/supabase-integration/resources/mcp-cli-playbook.md`
- RLS 패턴: `.claude/skills/supabase-integration/resources/rls-patterns.md`
- Edge Functions Stage A/B/C: `.claude/skills/supabase-integration/resources/edge-functions.md`
