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
10. **모든 Phase는 "설명 → 질문 → 실행" 순서** — 사용자가 학습 중이라는 전제. 작업만 하지 말고 각 Phase 진입 시 개념·이유·위험을 먼저 설명. 명령어·SQL을 실행하기 전에 "이게 왜 필요한가"를 1~3줄로 풀어 전달.
11. **프로그래밍적으로 검증 못 하는 건 게이트가 될 수 없다** (CRITICAL) — Dashboard UI·외부 서비스 콘솔 등 **LLM이 직접 관측 못 하는 상태**는 필수 체크리스트로 두지 않는다. 필요하면 SQL/CLI/파일 검사로 **등가 검증**을 만들어 게이트화한다. UI 언급은 고수준 라벨(예: "Advisor 패널")까지만. 절대 경로(`Settings → Database → X`)를 단언하지 않는다. Supabase Dashboard는 자주 개편되며 LLM은 최신 상태를 모른다.
12. **사용자가 "없음/못 찾음" 보고 시 flip 금지** (CRITICAL) — UI가 바뀌었을 가능성을 인정하되, **원래 스킬이 주장한 사실을 부정하지 않는다**. 대신 다음 순서로 대응: (a) "UI 개편으로 위치가 바뀌었을 수 있음" 한 줄 인정 → (b) 프로그래밍적 등가 검증 경로 제시 → (c) 그 체크가 필수/보조인지 재확인, 보조면 skip 허용. 사용자 한 마디에 스킬 내용을 "제가 틀렸네요"로 뒤집는 행동 = 환각의 역방향, 더 큰 신뢰 손상.

---

## Phase 진입 설명 포맷 (모든 Phase 공통)

각 Phase를 시작할 때 **반드시 아래 구조로 먼저 메시지를 출력**한 뒤 작업에 들어간다.

```
## Phase N — {이름}

### 📘 이 단계가 하는 일
{1~2줄: 목적}

### 🧠 알아야 할 개념
- {개념1}: {왜 중요한지 1줄}
- {개념2}: {왜 중요한지 1줄}

### ❓ 왜 이 단계가 필요한가
{건너뛰거나 잘못하면 어떤 문제가 생기는지 2~3줄}

### ⚠️ 주의할 점
- {흔한 실수 / 되돌리기 어려운 작업 / 위험 신호}

### ▶ 지금부터 할 일
1. {사용자에게 물어볼 것}
2. {읽을 문서/파일}
3. {생성할 파일·실행할 명령}
```

이 포맷은 **사용자의 이해를 워크플로우의 일부**로 만드는 게 목적. 건너뛰지 말 것.

질문-답 이후 **실제 명령 실행 직전**에도 "이 명령은 X를 Y하기 때문에 필요합니다" 한 줄을 덧붙인다 (특히 `supabase db reset`, `db push`, `secrets set`, `functions deploy`처럼 상태 변경이 일어나는 명령).

---

## Phase 0 — Prerequisites Check (자동, 승인 불필요)

### 📘 이 단계가 하는 일
후속 Phase가 안전하게 동작할 환경인지 자동 점검.

### 🧠 알아야 할 개념
- **Supabase CLI**: 로컬 개발·마이그레이션·타입 생성·함수 배포를 담당. Dashboard가 "GUI"라면 CLI는 "재현 가능한 스크립트"
- **`.env.local`**: Vite가 로컬 개발에서만 읽는 환경 변수. `.gitignore`에 들어가야 커밋 사고 방지
- **anon key vs service_role key**: anon은 프론트 공개용 (RLS로 보호), service_role은 DB 전권 (서버·MCP 전용)
- **Supabase MCP**: 탐색·검증 전용 read 도구. 상태 변경은 하지 않는 게 원칙 (이유: 재현성)

### ❓ 왜 필요한가
CLI·env·디렉터리가 준비 안 된 상태로 Phase 1~6을 돌리면 "왜 안 되지?"로 시간 낭비 + secret이 잘못된 곳에 저장되는 사고 위험.

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

6. ~~Dashboard 보안 기본값 확인~~ — **삭제됨**
   - 이유: 이 프로젝트는 마이그레이션 전용 정책이라 Dashboard/Studio UI로 테이블을 만들지 않음 → 해당 토글이 보호해줄 경로 자체가 없음
   - 진짜 방어선은 **Phase 3 자동 검증 SQL**(`pg_tables.rowsecurity`) — 이쪽이 프로그래밍적 게이트
   - Dashboard UI 경로 단언은 원칙 11 위반 소지 → 체크리스트에서 제외

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

### 🧠 알아야 할 개념
- **테이블 vs 엔티티**: UX의 "Post/User/Comment"는 DB에선 각각 테이블. 관계(1:N, N:M)는 FK/junction 테이블로 표현
- **Primary key로 UUID 쓰는 이유**: 자동증가 정수는 총 개수가 노출되고 분산 환경에서 충돌 → `gen_random_uuid()` 기본값 사용
- **`created_at` / `updated_at`**: 감사·디버깅·캐시 무효화에 필수. `updated_at`은 **트리거**로 자동 갱신
- **Soft delete vs Hard delete**: `deleted_at` 컬럼 방식 vs `DELETE`. 삭제 복구·감사 필요하면 soft
- **FK의 `on delete` 정책**: `cascade`(연쇄 삭제) / `set null`(FK만 초기화) / `restrict`(삭제 차단). 선택에 따라 운영 사고 달라짐
- **마이그레이션 파일**: 스키마 변경을 **재현 가능한 SQL 스크립트**로 저장. 팀·프로덕션 간 일관성 확보

### ❓ 왜 이 단계가 필요한가
DB 스키마는 한 번 박히면 바꾸기 어려운 "뼈대". UX에서 드러나지 않은 관계(예: 좋아요가 사용자와 포스트 둘 다에 엮임)를 이 단계에서 정리하지 않으면 RLS·쿼리·인덱스 설계가 무너진다.

### ⚠️ 주의할 점
- `on delete` 미지정하면 기본값 `no action` → 운영에서 "사용자 삭제하려는데 FK 때문에 막힘" 발생
- `updated_at` 트리거 빠뜨리면 **영원히 생성 시각만 기록됨** (자동 안 채워짐)
- 엔티티 "소유자"가 누구인지 이 단계에서 결정 안 하면 Phase 3 RLS에서 되돌아와야 함

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

### 🧠 알아야 할 개념
- **`auth.users` vs `public.profiles`**: Supabase는 인증 정보를 `auth` 스키마에 격리. 프로필(닉네임·아바타)은 별도 `profiles` 테이블에 두고 `id`로 FK 연결
- **`handle_new_user` 트리거**: `auth.users`에 row가 생길 때 `profiles`에 자동으로 row를 만들어주는 트리거. 없으면 "회원가입은 됐는데 프로필이 없음" 상태 발생
- **`security definer`**: 트리거 함수가 **함수 소유자 권한으로** 실행되게 함. `search_path`를 `public`으로 고정하지 않으면 권한 탈취 경로가 됨
- **JWT / access_token / refresh_token**: 로그인 시 두 토큰 발급. access는 짧게(1시간), refresh는 길게(주 단위). Supabase SDK가 자동 갱신
- **Email Confirmation**: 이메일 인증 ON이면 `email_confirmed_at`이 채워져야 로그인 가능. OFF면 즉시 로그인 가능하지만 스팸 가입 위험
- **Redirect URL**: OAuth·이메일 링크가 돌아올 허용 URL 목록. 등록 안 하면 링크 클릭 후 404

### ❓ 왜 이 단계가 필요한가
인증은 **거의 모든 RLS 정책의 전제**(`auth.uid()`로 소유자 판단). 여기서 `profiles` 자동 생성·이메일 인증·Redirect URL을 안 잡으면 Phase 3 RLS가 동작해도 실제 사용자 플로우가 깨짐.

### ⚠️ 주의할 점
- `handle_new_user`에 `security definer + set search_path = public` 빠뜨리면 보안 경고 + 권한 문제
- Dashboard의 **Site URL**과 **Redirect URLs** 설정이 env와 다르면 이메일 인증 링크가 엉뚱한 곳으로 감
- 비밀번호 정책은 Dashboard Auth 설정이 **권한**. 마이그레이션으론 못 바꿈

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

### 🧠 알아야 할 개념
- **RLS (Row Level Security)**: PostgreSQL이 제공하는 "행 단위 권한 제어". DB 엔진이 쿼리마다 "이 사용자가 이 row를 볼 수 있나?"를 검사
- **`auth.uid()`**: 현재 요청의 JWT에서 추출한 사용자 UUID. 정책의 핵심 조건
- **DENY by default**: RLS 활성화 + 정책 없음 = **아무도 못 읽음**. 정책은 "허용 조건"을 명시적으로 푸는 역할
- **`anon` role vs `authenticated` role**: 비로그인 요청은 `anon`, 로그인 요청은 `authenticated`. 정책에서 `to authenticated` 식으로 대상 지정
- **USING vs WITH CHECK**: `USING`은 "읽을 수 있는 행 조건", `WITH CHECK`는 "쓸 때 허용할 행 조건". 둘 다 필요한 경우가 많음
- **정책 조합**: 같은 테이블에 여러 정책 = **OR 조합** (하나라도 허용이면 통과). 주의 필요
- **`security definer` 헬퍼 함수**: 복잡한 권한 체크(팀 멤버십 등)는 함수로 분리해 RLS에서 재사용

### ❓ 왜 이 단계가 필요한가
**RLS 없이 프론트에 anon key를 노출하는 순간 DB 전체가 공개 API가 된다.** anon key 자체는 비밀이 아니라 "어느 프로젝트인가"만 알려주는 라벨. 진짜 경계선은 RLS. 여기를 부실하게 하면 Phase 5에서 사용자가 다른 사용자 데이터를 읽는다.

### ⚠️ 주의할 점
- `enable row level security`만 하고 정책을 안 쓰면 **정상 사용자도 차단** → 500 에러 양산
- 반대로 정책 `using (true)`는 **전체 공개**와 같음 → 의도한 경우에만
- `auth.uid()`를 JWT claim과 직접 비교하는 정책은 캐시 미스로 느릴 수 있음 → `security definer + stable` 함수로 래핑
- 테이블별 `FOR SELECT/INSERT/UPDATE/DELETE` 각각에 정책이 필요. `FOR ALL`은 편해도 의도 불명확해짐

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

### 🧠 알아야 할 개념
- **Singleton client**: `createClient()`를 앱 전체에서 1개만 만들어 세션·캐시·실시간 구독을 공유. 훅마다 새로 만들면 인증이 꼬임
- **React 훅 패턴**: `useAuth` / `useSignIn` / `use{Entity}` — UI 상태(loading/error/data)와 Supabase 호출을 캡슐화. 컴포넌트는 비즈니스 로직 모르게 유지
- **`{ client }` 주입**: 모든 데이터 훅이 기본값으로 싱글톤을 쓰되, 파라미터로 교체 가능 → Storybook·테스트에서 mock 주입
- **에러 정규화**: Supabase 에러 코드(`23505`, `42501` 등)를 한국어 메시지로 변환하는 레이어. UI마다 분기하지 않게
- **JSDoc typedef**: TS 대신 `@typedef`로 DB row 타입 정의. `supabase gen types typescript` → `ts-to-jsdoc.mjs` 스크립트로 자동 변환
- **Vite env**: `import.meta.env.VITE_*`만 번들에 노출. 즉 **여기에 secret을 넣으면 안 됨** (원칙 9)

### ❓ 왜 이 단계가 필요한가
훅으로 감싸지 않으면 모든 컴포넌트가 Supabase client를 직접 import → 에러 처리·로딩 스피너 로직이 50군데에 중복. 또 Storybook에서 실제 API를 치면 디자인 리뷰가 느려지고 비용이 든다.

### ⚠️ 주의할 점
- **Auth UI 컴포넌트는 직접 만들지 말 것** — `component-work` 스킬에 위임 (카테고리·스토리 규칙 자동 준수)
- 훅 안에서 `useEffect` 없이 top-level await 쓰면 React가 무한 렌더 → 반드시 effect/콜백 안에서
- 훅 시그니처(`{ data, loading, error, ... }`)를 **Phase 4에서 확정**해야 나중에 Phase 6(Edge Function 이전)에서 컴포넌트 수정 없이 교체 가능

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

### 🧠 알아야 할 개념
- **`supabase db reset`**: 로컬 DB를 비우고 **모든 마이그레이션을 순서대로 재적용**. 마이그레이션이 처음부터 돌아가는지 확인하는 유일한 방법
- **`supabase db push`**: 로컬에서 작성한 마이그레이션을 **원격 프로젝트에 적용**. 되돌리기 어려우므로 로컬 `reset`으로 검증 후 실행
- **Seed 데이터**: `supabase/seed.sql`에 개발용 기본 데이터(admin 계정·샘플 row). `db reset` 시 자동 실행
- **Smoke test**: "타는 연기 확인" — 핵심 플로우가 최소한 **죽지 않는지** 빠르게 검사. 회원가입→로그인→데이터 CRUD→RLS 차단
- **Supabase Advisor**: Dashboard가 제공하는 자동 점검. 플랫폼 관점에서 RLS·인덱스·보안 문제를 탐지

### ❓ 왜 이 단계가 필요한가
앞 Phase들은 각자 자기 영역만 검증했다. 여기서 처음으로 **전체 시스템을 연결**해본다. 마이그레이션 순서 문제, 트리거 누락, 정책 충돌 같은 **교차 영역 버그**는 이 단계에서만 드러남.

### ⚠️ 주의할 점
- **`supabase db reset`을 프로덕션에 실행하면 데이터 전부 삭제됨** — 로컬 전용
- `db push`는 한번 나간 마이그레이션을 삭제하지 않음. 되돌리려면 새 "역방향 마이그레이션"을 작성해야 함
- 실제 이메일 인증은 Supabase 기본 SMTP라 받는 편에서 스팸함 갈 수 있음 — 체크 시 확인

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
   - [ ] **SQL 기반 RLS 완전성 검증** (프로그래밍적 게이트):
     ```sql
     -- RLS 미활성 public 테이블 0건
     SELECT tablename FROM pg_tables
     WHERE schemaname='public' AND rowsecurity=false;
     -- 정책 없는 RLS 활성 테이블 0건
     SELECT c.relname FROM pg_class c LEFT JOIN pg_policy p ON p.polrelid=c.oid
     WHERE c.relnamespace='public'::regnamespace AND c.relkind='r'
       AND c.relrowsecurity=true AND p.polname IS NULL;
     ```
   - [ ] (선택·보조) Supabase Advisor 패널 확인 — 위치는 UI 개편으로 바뀔 수 있음. 보이면 경고 0건, 못 찾으면 **skip**. 필수 방어선은 위 SQL임

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

### 🧠 알아야 할 개념
- **Edge Function**: Supabase가 Deno 런타임으로 실행하는 서버리스 함수. HTTP endpoint 형태로 퍼블릭 노출
- **Vite env는 번들에 박힌다**: `VITE_*` 값은 빌드 시 JS에 평문으로 포함. 브라우저에서 그대로 보임 → **절대 secret 저장 금지**
- **Supabase secrets**: `supabase secrets set`으로 등록한 값. 함수 런타임의 `Deno.env.get()`으로만 접근. 프론트 번들엔 존재하지 않음
- **JWT forwarding**: `supabase.functions.invoke()`는 현재 사용자 JWT를 `Authorization` 헤더로 자동 전달 → 함수에서 `auth.getUser()`로 호출자 식별 가능
- **Stage A / B / C**: 로컬 프론트 직접 호출(기능 검증) → 이전 체크리스트 → Edge Function 이전(보안 검증). 이유는 디버깅 영역 분리
- **Rate limit**: RLS는 DB row 접근만 막음. 외부 API 호출량 제한은 **Edge Function 안에서 직접** 구현해야

### ❓ 왜 이 단계가 필요한가
OpenAI 같은 유료 API 키가 프론트 번들에 박히면 **사용자가 키를 뽑아서 직접 호출 가능** → 과금 공격·데이터 유출. Edge Function으로 감싸면 키는 서버에만 존재하고, 요금 민감 로직(플랜별 쿼터)도 서버에서 강제할 수 있다.

### ⚠️ 주의할 점
- Stage A 키를 **Stage C 완료 후 반드시 revoke** — git 히스토리·구 빌드에 남아있을 수 있음
- 함수 배포 후 `pnpm build && grep -r "sk-" dist/`로 **번들 유출 재확인**
- 함수 최상단에 **JWT 검증을 넣지 않으면 익명 호출 허용** = 공개 과금 API가 됨
- CORS `*` 그대로 프로덕션에 올리면 타 사이트에서도 호출 가능 → Origin 좁히기

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
