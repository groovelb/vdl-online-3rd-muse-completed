# Documentation Templates

Phase 1~5에서 산출할 4개 문서의 템플릿. 사용자에게 제시할 때는 반드시 이 구조를 따른다.

---

## 04-db-schema.md

```markdown
# DB Schema

## 개요

- 프로젝트: {project-name}
- 총 테이블 수: N
- 작성일: YYYY-MM-DD

## ERD

\`\`\`mermaid
erDiagram
    profiles ||--o{ posts : "owns"
    posts ||--o{ comments : "has"
    profiles ||--o{ comments : "writes"

    profiles {
        uuid id PK
        string nickname
        string avatar_url
        timestamptz created_at
    }
    posts {
        uuid id PK
        uuid user_id FK
        string title
        text content
        timestamptz created_at
        timestamptz updated_at
    }
\`\`\`

## 테이블 상세

### profiles

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK, FK → auth.users.id | 사용자 ID |
| nickname | text | NOT NULL, UNIQUE | 닉네임 |
| avatar_url | text | NULLABLE | 아바타 이미지 URL |
| created_at | timestamptz | default now() | 생성 시각 |
| updated_at | timestamptz | default now(), trigger | 수정 시각 |

**인덱스**: `nickname (UNIQUE)`
**트리거**: `set_updated_at` BEFORE UPDATE

### posts
(동일 형식 반복)

## 공통 규칙

- 모든 테이블: `id uuid default gen_random_uuid()`, `created_at`, `updated_at`
- 모든 `updated_at`: `set_updated_at()` 트리거 적용
- 삭제 정책: {hard-delete | soft-delete 명시}

## 마이그레이션 파일

- `supabase/migrations/{ts}_init_schema.sql`
```

---

## 05-auth-design.md

```markdown
# Auth Design

## 인증 방식

- **Provider**: Email + Password (표준)
- **이메일 인증**: 필수 (Supabase Auth 기본 동작)
- **비밀번호 정책**: 8자 이상
- **세션**: Supabase 기본 (access token 1h, refresh token 자동 갱신)

## profiles 테이블

`auth.users`는 Supabase가 관리하므로, 프로필 정보는 별도 `profiles` 테이블에 저장.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | `auth.users.id` 참조 |
| nickname | text | 닉네임 |
| avatar_url | text | 아바타 URL |
| role | user_role | enum: user / admin (선택) |

## 자동화 트리거

### handle_new_user
`auth.users` insert 시 `profiles`에 빈 row 자동 생성.

\`\`\`sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
\`\`\`

## Supabase Dashboard 설정 체크리스트

- [ ] Auth → Providers → **Email** Enabled
- [ ] Auth → Settings → **Confirm email** ON
- [ ] Auth → URL Configuration:
  - Site URL: `http://localhost:5173`
  - Redirect URLs: `http://localhost:5173/*`, 프로덕션 URL
- [ ] Auth → Email Templates → 필요 시 한국어 커스터마이즈

## 클라이언트 플로우

1. 회원가입 → 이메일 인증 링크 → 인증 완료 → 로그인 가능
2. 로그인 → access token 저장 (localStorage, Supabase 기본) → 이후 자동 첨부
3. 로그아웃 → 세션 삭제 → 앱 상태 초기화
```

---

## 06-rls-policies.md

```markdown
# RLS Policies

## 개요

- 모든 테이블 `ENABLE ROW LEVEL SECURITY` 적용
- 기본 원칙: **DENY by default, 명시적 ALLOW만 허용**

## 정책 매트릭스

| 테이블 | SELECT | INSERT | UPDATE | DELETE | 패턴 |
|--------|--------|--------|--------|--------|------|
| profiles | 모두 | 자동(트리거) | 본인만 | 본인만 | public-read-owner-write |
| posts | 모두 | 로그인 | 본인만 | 본인만 | public-read-owner-write |
| comments | 모두 | 로그인 | 본인만 | 본인 or 글주인 | custom |
| private_notes | 본인만 | 본인만 | 본인만 | 본인만 | owner-only |

## 테이블별 상세

### profiles
\`\`\`sql
alter table profiles enable row level security;

create policy "profiles_select_all"
  on profiles for select
  using (true);

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id);
\`\`\`

### posts
(동일 형식)

## 검증 결과

| 테스트 | 결과 |
|--------|------|
| 비로그인 SELECT private_notes | ✅ 차단 |
| 사용자 A가 사용자 B의 post UPDATE | ✅ 차단 |
| 본인 post UPDATE | ✅ 허용 |
| (나머지 검증 결과) | |
```

---

## 07-api-integration.md

```markdown
# API Integration Guide

## 파일 구조

- `src/lib/supabase.js` — client singleton
- `src/utils/supabaseError.js` — 에러 정규화
- `src/types/database.js` — JSDoc 타입
- `src/hooks/auth/` — useAuth, useSignIn, useSignUp, useSignOut
- `src/hooks/data/` — 엔티티별 CRUD 훅

## 사용 예시

### 회원가입
\`\`\`jsx
const { signUp, loading, error } = useSignUp();
await signUp({ email, password });
// → 이메일 인증 메일 발송됨
\`\`\`

### 로그인
\`\`\`jsx
const { signIn, loading, error } = useSignIn();
await signIn({ email, password });
\`\`\`

### 데이터 조회
\`\`\`jsx
const { data: posts, loading, error } = usePosts();
\`\`\`

### 데이터 생성
\`\`\`jsx
const { createPost } = useCreatePost();
await createPost({ title, content });
\`\`\`

## 에러 처리

모든 Supabase 에러는 `supabaseError.js`를 거쳐 한국어 메시지로 변환된다.
커스텀 매핑이 필요하면 `resources/error-catalog.md` 참조.

## 자주 발생하는 이슈

### Q. 회원가입 후 로그인이 안 돼요
A. 이메일 인증이 필수로 설정되어 있다. Inbox 확인.

### Q. RLS 차단 에러 (42501)
A. `06-rls-policies.md`에서 해당 테이블 정책 확인.

### Q. Storybook에서 Supabase 호출이 실행돼요
A. 훅에 `{ client }` 파라미터로 mock 주입. `storybook-mock.md` 참조.

## OAuth 확장

현재는 Email+Password만. Google/GitHub 등 OAuth 추가는 `resources/auth-flows.md#oauth-확장`.
```
