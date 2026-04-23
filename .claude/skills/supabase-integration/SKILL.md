---
name: supabase-integration
description: Converts the data model in docs/{project}/02-ux-flow.md into a production-ready Supabase backend — schema, auth (email+password), RLS, client hooks, and Edge Functions for external API integration — so the user only has to think about UX and data.
when_to_use: When user explicitly invokes /supabase-integration or asks to "connect supabase", "add backend", "set up auth", "create DB schema", "design RLS", "hide API key", "move API call to server", "add edge function". Do not auto-activate.
user-invocable: true
disable-model-invocation: true
---

# Supabase Integration Skill

> `02-ux-flow.md`의 데이터 모델을 입력으로 받아 **스키마 → 인증 → RLS → 클라이언트 훅 → 검증**까지 6단계 Phase로 안정적인 Supabase 백엔드를 구축한다.

## 활성화 조건

| 의도 | 트리거 예시 |
|------|-----------|
| 전체 연동 시작 | "/supabase-integration", "supabase 연동해줘", "백엔드 붙여줘" |
| 스키마만 | "DB 스키마 만들어줘", "테이블 설계해줘" |
| 인증만 | "회원가입/로그인 붙여줘", "auth 설정해줘" |
| RLS만 | "RLS 정책 짜줘", "보안 정책 만들어줘" |
| 외부 API 서버 이전 | "OpenAI 키 숨겨줘", "API 호출 서버로 옮겨줘", "edge function 만들어줘" |
| 이어서 | "다음 Phase 진행", "Phase 3 이어서" |

---

## 전체 워크플로우

```
Phase 0         Phase 1     Phase 2        Phase 3   Phase 4         Phase 5    Phase 6
Prereq Check → Schema →    Auth Design →  RLS →     Client Code →   Verify →   Edge Functions
 (자동)         [승인]      [승인]         [승인]    [승인]          [최종]     [조건부·승인]
```

**Phase 6는 조건부**: 외부 API(OpenAI/결제/SMS 등) 연동이 있을 때만 진행. 없으면 Phase 5에서 종료.

**입력**: `docs/{project}/02-ux-flow.md`의 `## 데이터 모델` 섹션
**산출 문서**: `04-db-schema.md` / `05-auth-design.md` / `06-rls-policies.md` / `07-api-integration.md` / `08-edge-functions.md`(Phase 6)
**산출 코드**: `supabase/migrations/*.sql`, `supabase/functions/*/index.ts`(Phase 6), `src/lib/supabase.js`, `src/hooks/data/`, `src/types/database.js`

---

## 핵심 원칙 (절대 위반 금지)

1. **UX-first 질문** — 사용자에게는 **권한·관계·역할**만 묻는다. SQL 구문을 묻지 않는다.
2. **승인 게이트 엄수** — 각 Phase는 독립 승인 단위. 승인 없이 다음 Phase 금지.
3. **상태 변경은 반드시 마이그레이션 파일로** — MCP로 즉흥 `CREATE/ALTER/DROP` 금지. 탐색·검증만 MCP 사용.
4. **최소 권한 RLS 기본값** — 모든 테이블 `ENABLE ROW LEVEL SECURITY`, 명시적 정책 외 DENY.
5. **service_role key 프론트 금지** — `.env.local`에는 `VITE_SUPABASE_ANON_KEY`만. service_role은 서버/MCP 전용.
6. **JS 프로젝트 컨벤션 준수** — TS 대신 JSDoc typedef로 타입 제공 (`src/types/database.js`).
7. **Storybook 호환** — 모든 데이터 훅은 `{ client }` 파라미터 주입 가능하도록 설계.
8. **인증 UI는 component-work에 위임** — 이 스킬은 훅만 만들고, UI 생성은 `component-work` 스킬 호출.
9. **비밀키는 절대 프론트에 두지 않는다** — 외부 API 키(OpenAI, Stripe, SMS 등)는 `VITE_*`로 노출 금지. Vite env는 번들에 평문으로 박힘. 로컬 검증(Stage A)은 제한적으로 허용하되 Stage C에서 반드시 Edge Function으로 이전 + 키 revoke.

---

## Phase 0 — Prerequisites Check (자동, 승인 불필요)

**목적**: 후속 Phase가 안전하게 동작할 환경인지 자동 점검.

### 체크 항목

1. **입력 문서 존재 확인**
   - `docs/{project}/02-ux-flow.md` 존재 여부
   - 해당 문서에 `## 데이터 모델` 섹션 존재 여부
   - 없으면 → "먼저 `/project-planning`으로 ux-flow를 완성해주세요"로 중단

2. **환경 변수 확인**
   ```bash
   # .env.local 존재 및 다음 키 확인
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```
   - `.gitignore`에 `.env.local` 포함 여부 검증

3. **CLI 설치 확인**
   ```bash
   supabase --version
   ```
   - 없으면 → `brew install supabase/tap/supabase` 가이드 제시

4. **프로젝트 디렉터리 초기화 확인**
   - `supabase/` 디렉터리 존재 여부
   - 없으면 → `supabase init` 실행 안내 (사용자 확인 후)

5. **MCP 연결 확인**
   - Supabase MCP 서버 응답 확인 (탐색용)
   - 없어도 진행 가능 (CLI로 대체)

### 산출

사용자에게 체크 결과 표로 제시:

```
| 항목 | 상태 |
|------|------|
| ux-flow 데이터 모델 | ✅ |
| .env.local | ❌ (생성 필요) |
| Supabase CLI | ✅ v1.x.x |
| supabase/ 디렉터리 | ❌ (init 필요) |
| Supabase MCP | ✅ |
```

누락 항목이 있으면 **해결 후 다시 호출** 요청. 모두 ✅면 Phase 1 자동 진행.

---

## Phase 1 — Schema Design (DB 스키마 설계)

**목적**: 데이터 모델을 PostgreSQL 스키마로 변환.

### 작업 순서

1. `docs/{project}/02-ux-flow.md` Read → 데이터 모델 추출
2. `resources/schema-patterns.md` Read → 공통 패턴(id, timestamps, soft delete 등) 확인
3. `resources/trigger-patterns.md` Read → `updated_at` 트리거, `handle_new_user` 트리거 템플릿 확인
4. `resources/doc-templates.md` Read → `04-db-schema.md` 템플릿 확인
5. **사용자 확인 질문** (UX 레벨만):
   - 각 엔티티의 **소유자**가 누구인지 (사용자? 팀? 조직?)
   - 엔티티 간 **관계** (1:N, N:M)
   - **삭제 정책**: hard delete vs soft delete
   - **다국어 필드** 여부

6. `docs/{project}/04-db-schema.md` 작성:
   - Mermaid ERD
   - 테이블별 상세 스펙 표 (컬럼/타입/제약/인덱스)
   - 공통 컬럼 자동 포함: `id uuid default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at timestamptz default now()`
7. 마이그레이션 파일 생성:
   ```bash
   supabase migration new init_schema
   ```
   - 생성된 파일에 `CREATE TABLE`, FK, 인덱스, `updated_at` 트리거 작성
   - `resources/trigger-patterns.md`의 `set_updated_at` 트리거 공통 적용

### 승인 게이트

사용자에게 요약 제시:
- ERD 다이어그램
- 테이블 개수 / 주요 FK
- 마이그레이션 파일 경로

**"승인" 받기 전 Phase 2 진행 금지.**

---

## Phase 2 — Auth Design (회원가입/로그인 설계)

**목적**: 안정적인 Email+Password 인증 체계 구축.

### 작업 순서

1. `resources/auth-flows.md` Read → Email+Password 표준 플로우 확인
2. `resources/doc-templates.md`에서 `05-auth-design.md` 템플릿 확인
3. **사용자 확인 질문**:
   - 이메일 인증 필수 여부 (권장: ✅)
   - 비밀번호 최소 정책 (권장: 8자 이상)
   - 닉네임/아바타 등 `profiles` 필드 (기본: nickname, avatar_url)
   - 역할(role) 시스템 필요 여부 (admin/user 등)

4. `docs/{project}/05-auth-design.md` 작성
5. 마이그레이션 생성:
   ```bash
   supabase migration new auth_profiles
   ```
   - `profiles` 테이블 (`id uuid primary key references auth.users on delete cascade`)
   - `handle_new_user()` 트리거 (auth.users insert → profiles insert 자동화) — **필수**
   - 필요 시 `roles` enum + 컬럼

6. Supabase Dashboard 설정 가이드 제공:
   - Auth → Providers → Email 활성화
   - Email Confirmation ON
   - Redirect URLs 등록 (`http://localhost:5173/*`, 프로덕션 URL)

### 승인 게이트

- `profiles` 스키마 요약
- 트리거 동작 설명
- Dashboard 수동 설정 체크리스트

---

## Phase 3 — RLS Policies (행 수준 보안)

**목적**: 각 테이블에 최소 권한 원칙으로 정책 부여.

### 작업 순서

1. `resources/rls-patterns.md` Read → 정책 카탈로그 확인
2. Phase 1에서 만든 모든 테이블 목록 추출
3. **사용자 확인 질문** (테이블별):
   - 누가 **읽는가**? (비로그인 / 로그인 / 소유자 / 역할 / 멤버)
   - 누가 **쓰는가**? (본인만 / 역할 / 허용 없음)
   - 누가 **삭제하는가**?
   - 공유/협업 관계가 있는가?

4. 각 답변을 `rls-patterns.md`의 패턴에 매핑:
   - `owner-only` / `public-read-owner-write` / `role-based` / `member-of-team` / `public-read-admin-write`

5. `docs/{project}/06-rls-policies.md` 작성 (테이블별 정책 매트릭스)
6. 마이그레이션 생성:
   ```bash
   supabase migration new rls_policies
   ```
   - 모든 테이블 `ENABLE ROW LEVEL SECURITY`
   - 정책 `CREATE POLICY ... FOR SELECT/INSERT/UPDATE/DELETE`

7. **자동 검증** — `resources/verification-checklist.md` RLS 섹션 실행:
   - 비로그인 상태에서 보호 테이블 SELECT 차단 확인 (MCP 쿼리)
   - 다른 사용자 데이터 접근 차단 확인

### 승인 게이트

- 테이블별 정책 매트릭스 표
- 검증 결과 (PASS/FAIL)

---

## Phase 4 — Client Integration (프론트 연동 코드)

**목적**: 프론트엔드에서 안전하고 일관되게 Supabase를 사용하는 코드 생성.

### 작업 순서

1. `resources/client-templates.md` Read → 코드 템플릿 확인
2. `resources/error-catalog.md` Read → 에러 메시지 매핑
3. `resources/storybook-mock.md` Read → mock 주입 패턴 확인

4. **파일 생성**:
   - `src/lib/supabase.js` — client singleton, session listener
   - `src/utils/supabaseError.js` — 에러 정규화
   - `src/types/database.js` — JSDoc typedef (아래 자동 생성)
   - `src/hooks/auth/useAuth.js` — 현재 세션/사용자
   - `src/hooks/auth/useSignUp.js` — 회원가입
   - `src/hooks/auth/useSignIn.js` — 로그인
   - `src/hooks/auth/useSignOut.js` — 로그아웃
   - `src/hooks/data/use{Entity}.js` — 엔티티별 CRUD (스키마의 각 테이블마다)

5. **JSDoc 타입 자동 생성**:
   ```bash
   pnpm add -D @supabase/supabase-js
   supabase gen types typescript --linked > /tmp/db.ts
   node .claude/skills/supabase-integration/scripts/ts-to-jsdoc.mjs /tmp/db.ts > src/types/database.js
   ```
   - 스크립트는 Phase 4 실행 시 `resources/scripts/ts-to-jsdoc.mjs`에서 복사
   - `package.json`에 `"db:types"` 스크립트 추가

6. **인증 UI 컴포넌트는 `component-work` 스킬로 위임**:
   - 생성할 컴포넌트:
     - `src/components/input/LoginForm.jsx` (카테고리: input)
     - `src/components/input/SignUpForm.jsx` (카테고리: input)
     - `src/components/layout/AuthGuard.jsx` (카테고리: layout)
   - `component-work` 스킬 호출 시 전달할 스펙:
     - 소비할 훅 시그니처 (`useSignIn`, `useSignUp`, `useAuth`)
     - 필드 목록 (email, password, nickname 등)
     - 상태 (loading, error, success) 처리
     - Storybook 스토리 자동 생성
   - 위임 후, 이 스킬은 **훅 ↔ 컴포넌트 연결만 검증**

### 승인 게이트

- 생성된 파일 목록
- `package.json` 변경사항
- 인증 UI 컴포넌트 생성 요청 여부 (component-work 호출 동의)

---

## Phase 5 — Migration & Verification (배포 · 검증)

**목적**: 마이그레이션 적용 + 전체 시스템 스모크 테스트.

### 작업 순서

1. **마이그레이션 적용**:
   ```bash
   # 로컬 개발
   supabase start
   supabase db reset   # 로컬 DB에 전체 마이그레이션 적용

   # 또는 원격
   supabase db push
   ```

2. **Seed 데이터** (선택):
   - `supabase/seed.sql` 작성
   - 개발용 기본 데이터 (admin 계정, 샘플 row)

3. `resources/verification-checklist.md` 체크리스트 실행:
   - [ ] 회원가입 → 이메일 인증 링크 수신 → 로그인 성공
   - [ ] 로그인 사용자만 본인 데이터 접근 (MCP로 RLS 검증)
   - [ ] 비로그인 상태에서 보호 API 접근 차단
   - [ ] 토큰 만료 시 자동 갱신
   - [ ] `updated_at` 트리거 동작
   - [ ] `handle_new_user` 트리거 → profiles 자동 생성
   - [ ] Storybook에서 데이터 훅 mock 동작

4. `docs/{project}/07-api-integration.md` 작성:
   - 훅 사용 예시 (각 `use{Entity}`)
   - 에러 처리 패턴
   - 자주 발생하는 이슈 FAQ
   - OAuth 확장 가이드 링크 (`auth-flows.md` 참조)

### 최종 승인

- 체크리스트 결과 리포트
- 문서 4종 경로 + 코드 파일 목록

외부 API 연동이 필요하면 → Phase 6 진행 여부 질문. 필요 없으면 여기서 종료.

---

## Phase 6 — Edge Functions (외부 API 서버 이전, 조건부)

**목적**: 외부 API(OpenAI, Stripe, SMS, 카카오 OAuth 등) 호출을 **프론트 → Edge Function**으로 안전하게 이전. 비밀키를 번들에서 완전히 제거.

**핵심 철학**: 로컬에서 **기능을 먼저 검증**(Stage A) → 검증 통과하면 **서버로 이전**(Stage C). 기능 검증과 보안 검증을 분리해야 디버깅 가능.

### 언제 이 Phase를 진행하는가

아래 중 **하나라도** 해당하면 진행:
- 외부 API를 호출해야 하며 그 호출에 **비밀키/토큰이 필요**
- 호출량에 **과금**이 붙음 (OpenAI, SMS, 결제)
- **써드파티 webhook**을 수신해야 함 (Stripe, 카카오)
- **관리자 전용/복잡 집계** 로직을 서버에 두고 싶음

단순 Supabase DB CRUD만이라면 Phase 6 **불필요** (RLS + 데이터 훅으로 충분).

### 작업 순서

1. `resources/edge-functions.md` Read → 전체 가이드 + 판단 기준 + 이유 확인
2. **사용자 확인 질문**:
   - 어떤 외부 API를 호출하는가? (목록)
   - 각 API별 **호출자 제한** 기준 (비로그인 가능? 로그인 필수? 유료 플랜만?)
   - 호출당 요금이 붙는가? (rate limit 필요 여부 판단)
   - 지금 Stage A(로컬 프론트 직접 호출)로 **기능 검증이 이미 끝났는가**, 아니면 처음부터 시작하는가?

3. **분기 진행**:

   #### 3-A. Stage A부터 시작 (기능 미검증)
   - `edge-functions.md`의 Stage A 규칙에 따라 `.env.local` + `VITE_DEV_*` 키로 로컬 훅 작성
   - 허용 조건(DEV 전용 키, revoke 계획, 타임박스) 사용자에게 명시적 확인
   - 기능 검증 완료 후 Stage B 체크리스트 → Stage C

   #### 3-B. Stage C 바로 진행 (기능 검증 완료)
   - Stage B 체크리스트 통과 확인
   - 함수별 스켈레톤 생성: `supabase functions new {name}`
   - `edge-functions.md`의 Step 2 템플릿으로 서버 로직 이식 (JWT 검증 → 입력 검증 → 권한 체크 → 외부 API 호출 → 로깅 구조 필수 포함)
   - secret 등록: `supabase secrets set KEY=value`
   - 로컬 테스트: `supabase functions serve {name} --env-file supabase/functions/.env.local`
   - 프론트 훅 교체 (시그니처 유지 — 컴포넌트 수정 0)
   - 배포: `supabase functions deploy {name}`
   - **Stage A 잔재 정리**: VITE_DEV_* 삭제, 구 키 revoke, `pnpm build && grep -r "sk-" dist/` 검증

4. `docs/{project}/08-edge-functions.md` 작성:
   - 함수별 목적·입력·출력·인증 요구사항
   - 필요한 secret 목록 (값 아닌 키명만)
   - 호출 제한 정책
   - 로컬 개발·배포 명령 요약

5. `package.json` 스크립트 추가:
   ```json
   "functions:serve": "supabase functions serve --env-file supabase/functions/.env.local",
   "functions:deploy": "supabase functions deploy"
   ```

6. `.gitignore`에 `supabase/functions/.env.local` 추가

### 검증 (필수)

- [ ] `pnpm build && grep -rcE "sk-[A-Za-z0-9]{20,}|sk_live|sk_test" dist/` → 0건
- [ ] 로컬에서 비로그인 상태로 함수 호출 → 401
- [ ] 로그인 상태로 함수 호출 → 정상 응답
- [ ] rate limit이 있다면, 한도 초과 시 429 반환 확인
- [ ] `supabase secrets list` 결과에 필요한 키 모두 존재
- [ ] Stage A에서 쓰던 개발 키가 외부 서비스 Dashboard에서 **revoke됨**
- [ ] Storybook 스토리가 `functions.invoke` mock으로 동작

### 승인 게이트

- 함수 목록 + 각 함수의 인증/권한/rate limit 요약
- secret 등록 목록 (키명만)
- 배포 결과 (URL)
- Stage A 잔재 정리 완료 리포트

---

## MCP + CLI 사용 규칙 (요약)

| 작업 유형 | 도구 |
|----------|------|
| 스키마 탐색, 테스트 쿼리, RLS 검증, 디버깅 | **MCP** |
| `supabase init` / `link` / `migration new` / `db push` / `gen types` / `start` | **CLI** |

**규칙**: "탐색·검증은 MCP, 상태 변경은 CLI 마이그레이션". 상세는 `resources/mcp-cli-playbook.md`.

---

## Resources

| 파일 | 용도 | 언제 Read |
|------|------|----------|
| `doc-templates.md` | 04~07 문서 템플릿 | 각 Phase 문서 작성 시 |
| `schema-patterns.md` | 공통 스키마 패턴 | Phase 1 |
| `trigger-patterns.md` | 트리거 SQL 템플릿 | Phase 1, 2 |
| `rls-patterns.md` | RLS 정책 카탈로그 | Phase 3 |
| `auth-flows.md` | 인증 플로우 + OAuth 확장 가이드 | Phase 2, 4 |
| `client-templates.md` | 훅/클라이언트 코드 템플릿 | Phase 4 |
| `error-catalog.md` | 에러 코드 → 한국어 메시지 | Phase 4 |
| `storybook-mock.md` | 스토리 mock 주입 가이드 | Phase 4 |
| `mcp-cli-playbook.md` | MCP/CLI 역할 분담 상세 | 전 Phase |
| `verification-checklist.md` | 최종 검증 체크리스트 | Phase 3, 5 |
| `edge-functions.md` | 외부 API 서버 이전 가이드 (Stage A/B/C, 이유 포함) | Phase 6 |
| `scripts/ts-to-jsdoc.mjs` | TS 타입 → JSDoc 변환 | Phase 4 |
