# Stage 5. Supabase 연동하기

> 선행: [Stage 4](./04-local-ai-simulation.md) · 마지막 Stage

---

## ① 이번 Stage에서 만드는 것

**로컬에서 완결된 앱을 Supabase 백엔드로 옮긴다.** DB + 인증 + Storage + RLS까지 붙여 실 사용 가능 상태로 만든다.

30초 요약:
- 6 테이블 DB 설계 (jsonb + RLS owner-only + `reference_items` 예약어 회피)
- 3 마이그레이션 분리 (스키마 / 인증 트리거 / RLS 정책)
- 회원가입 · 로그인 플로우 + AuthProvider 싱글톤
- Stage 4의 슬라이스 훅을 **시그니처 유지하며 내부만 Supabase로 교체**
- Storage 경로 `{user_id}/{reference_id}.{ext}`
- T3 이미지 512px 리사이즈 (비용)
- async/await race fix (Supabase 왕복 후에만 dispatch)

> 이 Stage의 핵심 메시지: **"공개 API는 불변, 내부만 교체."** 슬라이스 훅 시그니처를 유지하면 ArchivePage·Wizard·Settings 어느 것도 수정 없이 백엔드 전환이 끝난다.

---

## ② 프리뷰 — 이번에 만질 것

### Supabase 리소스
| 종류 | 항목 |
|---|---|
| 테이블 (6) | `reference_items`, `projects`, `project_references`, `analysis_results`, `profiles`, `user_settings` |
| 트리거 | `handle_new_user` (auth.users → profiles + user_settings 생성) |
| RLS 정책 | 6 테이블 전부 owner-only (user_id = auth.uid()) |
| Storage 버킷 | `references` (private) |

### 마이그레이션 (3개)
| 파일 | 내용 |
|---|---|
| `supabase/migrations/XXXXX_init_schema.sql` | 6 테이블 생성 |
| `supabase/migrations/XXXXX_auth_profiles.sql` | `handle_new_user` 트리거 |
| `supabase/migrations/XXXXX_rls_policies.sql` | RLS 정책 전부 |

### 신규 코드
| 파일 | 역할 |
|---|---|
| `src/lib/supabase.js` | Supabase 클라이언트 싱글톤 |
| `src/lib/museDb.js` | snake↔camel 매퍼 + CRUD 헬퍼 |
| `src/hooks/auth/AuthProvider.jsx` | 세션 Context 싱글톤 |
| `src/hooks/auth/useAuth.js` | `useAuth()` 훅 |
| `src/pages/auth/AuthPage.jsx` | 로그인/회원가입 탭 통합 |

### 수정 파일
| 파일 | 변경 |
|---|---|
| `src/store/museStore.jsx` | 슬라이스 훅 공개 API 유지, 내부만 Supabase CRUD로 전환 |
| `STORAGE_KEY` | `v4 → v5` bump (구버전 localStorage 무효화) |
| `.env.local` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| `src/App.jsx` | `AuthProvider` 최상위, `ProtectedRoute` 래핑 |
| `src/pages/ProjectCreateRoute.jsx` | async/await race fix |
| AI 호출 유틸 | T3 입력 이미지 512px 리사이즈 |

---

## ③ 설계 기준 (Spec)

### DB 설계 원칙
1. **jsonb 채택** — 편집은 통째 write, 검색은 단순 containment (`@>`)
   - 이유: MUSE는 토큰 편집 흐름이 jsonb에 적합. 태그를 별도 테이블로 정규화하면 조인 비용만 큼.
2. **RLS owner-only** — 모든 테이블에 `user_id = auth.uid()` 정책
   - 이유: 단일 사용자 계정 전제. 공유 기능은 추후 별도 정책.
3. **테이블명 `reference_items`** — `references`는 PostgreSQL 예약어
   - 이유: 초기에 안 잡으면 배포 후 변경 비용 매우 큼.
4. **3 마이그레이션 분리** — 스키마 / 트리거 / RLS
   - 이유: 교육·디버그 용이. 롤백 단순.

### 인증 정책
- **이메일 + 비밀번호** (이메일 인증 링크)
- **`handle_new_user` 트리거**가 `auth.users` 생성 시 `profiles` + `user_settings`를 **동시에 생성** — 조회 시 row 0건 문제 방지
- **AuthProvider 싱글톤** — 여러 라우트에서 `supabase.auth.getSession()` 직접 호출 금지

### Storage 규칙
- 버킷 `references` (private)
- 경로: `{user_id}/{reference_id}.{ext}`
  - 이유: RLS가 경로의 첫 segment를 `auth.uid()`로 검증
- 업로드 후 **signed URL** 발급해 `reference_items.storage_path`에 저장

### 공개 API 불변 원칙
Stage 4의 슬라이스 훅 시그니처:
```js
const { references, addReference, removeReference, updateReference } = useReferencesSlice();
const { projects, addProject, removeProject } = useProjectsSlice();
```
Supabase 전환 후에도 **시그니처 동일**. 내부만 `supabase.from('reference_items')...`로 교체.

### UI 플래그 분리
`_pending`, `_tagError` 같은 **로컬 세션 상태**는 DB에 저장하지 않는다.
- museDb 매퍼에서 `_` 접두 필드 pick 제외
- 이유: 업로드 중 상태는 세션별 개념. DB에 남으면 다른 디바이스에서 혼란

### 비용 정책
- **T3 입력 이미지 512px 리사이즈** (이전 1024px)
  - T1이 이미 primary signal을 줬으므로 T3 이미지는 verification 목적만
  - ≈17% 비용 절감 + Stage 4에서 이미 text-only 설계했으므로 실제로는 이미지 없이도 동작

### Race 방지
async 콜백에서:
```js
// ❌ 금지 — dispatch 먼저
dispatch(addProjectLocal(newProject));
await supabase.from('projects').insert(...);

// ✅ 필수 — await 먼저, 성공 후 dispatch
const { data, error } = await supabase.from('projects').insert(...).select().single();
if (error) throw error;
dispatch(addProjectLocal(data));
```
**이유**: 먼저 dispatch하면 DB에 없는 ID로 `/projects/:id` 이동 시 "없는 프로젝트" 에러.

---

## ④ 실습 순서

### Step 1. Supabase 프로젝트 생성 + env

1. Supabase 대시보드에서 새 프로젝트 생성
2. `.env.local`에 추가:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
3. `.env.example`에 키 이름만 남기기 (값 없음)

**주의**: Anthropic API 키와 달리 Supabase anon key는 **클라이언트 노출 OK** (RLS로 보호되므로 `VITE_` 접두어 사용 정상).

### Step 2. Supabase CLI 로컬 셋업

```bash
npm i -g supabase
supabase login
supabase link --project-ref <프로젝트-ref>
supabase migration new init_schema
```

### Step 3. Migration 1 — 스키마 (6 테이블)

`supabase/migrations/XXXXX_init_schema.sql`:

```sql
-- 1) profiles
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz default now()
);

-- 2) user_settings
create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ai_model text default 'claude-haiku-4-5-20251001',
  is_auto_tag_enabled boolean default true,
  storage_mode text default 'cloud',
  theme_mode text default 'light'
);

-- 3) reference_items  ← 예약어 회피
create table public.reference_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  tags jsonb default '{}'::jsonb,
  dominant_colors jsonb default '[]'::jsonb,
  storage_path text,
  extracted jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index on public.reference_items (user_id);
create index on public.reference_items using gin (tags);

-- 4) projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  intent text,
  type text,
  created_at timestamptz default now()
);
create index on public.projects (user_id);

-- 5) project_references (조인 테이블)
create table public.project_references (
  project_id uuid references public.projects(id) on delete cascade,
  reference_id uuid references public.reference_items(id) on delete cascade,
  primary key (project_id, reference_id)
);

-- 6) analysis_results
create table public.analysis_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  layers jsonb not null,
  created_at timestamptz default now()
);
create index on public.analysis_results (user_id);
```

### Step 4. Migration 2 — 인증 트리거

`supabase/migrations/XXXXX_auth_profiles.sql`:

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));

  insert into public.user_settings (user_id)
  values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

**포인트**: `profiles` + `user_settings` 동시 생성. 둘 중 하나 빠지면 "설정 조회 0건" 버그.

### Step 5. Migration 3 — RLS 정책

`supabase/migrations/XXXXX_rls_policies.sql`:

```sql
-- 전부 RLS on
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.reference_items enable row level security;
alter table public.projects enable row level security;
alter table public.project_references enable row level security;
alter table public.analysis_results enable row level security;

-- profiles: 본인만
create policy "own profile" on public.profiles for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- user_settings: 본인만
create policy "own settings" on public.user_settings for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- reference_items: 본인만
create policy "own references" on public.reference_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- projects
create policy "own projects" on public.projects for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- project_references: 본인 소유 project 를 통해 간접 검증
create policy "own project_refs" on public.project_references for all
  using (exists (
    select 1 from public.projects p
    where p.id = project_id and p.user_id = auth.uid()
  ));

-- analysis_results
create policy "own analysis" on public.analysis_results for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
```

### Step 6. Storage 버킷 생성 + 정책

Supabase 대시보드 또는 SQL:
```sql
insert into storage.buckets (id, name, public) values ('references', 'references', false);

create policy "users can upload own" on storage.objects for insert
  with check (bucket_id = 'references' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users can read own" on storage.objects for select
  using (bucket_id = 'references' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users can delete own" on storage.objects for delete
  using (bucket_id = 'references' and (storage.foldername(name))[1] = auth.uid()::text);
```

**경로 규칙**: `{user_id}/{reference_id}.{ext}` — 첫 segment가 user_id.

### Step 7. 마이그레이션 적용

```bash
supabase db push
```
또는 대시보드 SQL Editor에서 순서대로 실행.

### Step 8. Supabase 클라이언트 싱글톤

`src/lib/supabase.js`:
```js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
```

### Step 9. AuthProvider + useAuth

`src/hooks/auth/AuthProvider.jsx`:
```jsx
import { createContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setIsReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}
```

`src/hooks/auth/useAuth.js`:
```js
import { useContext } from 'react';
import { AuthContext } from './AuthProvider.jsx';
export const useAuth = () => useContext(AuthContext);
```

**규칙**: `supabase.auth.getSession()`을 다른 곳에서 직접 호출 금지. **반드시 `useAuth()`만 사용**. race/token refresh 중복 방지.

### Step 10. AuthPage (로그인/회원가입 탭)

`src/pages/auth/AuthPage.jsx`:
- MUI Tabs (로그인 / 회원가입)
- 로그인: `supabase.auth.signInWithPassword`
- 회원가입: `supabase.auth.signUp` → 이메일 인증 안내
- 에러/로딩 상태 표시

### Step 11. App.jsx 최상위에 AuthProvider

```jsx
function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <MuseStoreProvider seed="empty">
          <RouterProvider router={router} />
        </MuseStoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

**중요**: AuthProvider가 MuseStoreProvider **바깥**에 있어야 함. 스토어 내부에서 `useAuth()` 호출 가능.

### Step 12. ProtectedRoute 래핑

```jsx
function ProtectedRoute({ children }) {
  const { session, isReady } = useAuth();
  if (!isReady) return <LoadingScreen />;
  if (!session) return <Navigate to="/auth" replace />;
  return children;
}
```
`/archive`, `/projects`, `/projects/new`, `/projects/:id`, `/settings` 전부 ProtectedRoute로 감싼다.

### Step 13. museDb 매퍼

`src/lib/museDb.js`:
```js
import { supabase } from './supabase.js';

// snake ↔ camel 매퍼
const toRefFromRow = (row) => ({
  id: row.id,
  title: row.title,
  tags: row.tags,
  dominantColors: row.dominant_colors,
  storagePath: row.storage_path,
  extracted: row.extracted,
  createdAt: row.created_at,
  thumbnailUrl: null,  // signed URL은 별도 fetch
});

const toRowFromRef = (ref, userId) => ({
  id: ref.id,
  user_id: userId,
  title: ref.title,
  tags: ref.tags,
  dominant_colors: ref.dominantColors,
  storage_path: ref.storagePath,
  extracted: ref.extracted,
  // _pending, _tagError 같은 UI 플래그는 여기서 제외 → DB 저장 X
});

export async function fetchReferences(userId) {
  const { data, error } = await supabase
    .from('reference_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const refs = data.map(toRefFromRow);
  // signed URL 발급
  for (const r of refs) {
    if (r.storagePath) {
      const { data: urlData } = await supabase.storage
        .from('references').createSignedUrl(r.storagePath, 3600);
      r.thumbnailUrl = urlData?.signedUrl;
    }
  }
  return refs;
}

export async function insertReference(ref, userId, file) {
  const ext = file.name.split('.').pop();
  const storagePath = `${userId}/${ref.id}.${ext}`;

  // 1) Storage 업로드
  const { error: upErr } = await supabase.storage
    .from('references').upload(storagePath, file);
  if (upErr) throw upErr;

  // 2) DB insert
  const row = toRowFromRef({ ...ref, storagePath }, userId);
  const { data, error } = await supabase
    .from('reference_items').insert(row).select().single();
  if (error) throw error;

  return toRefFromRow(data);
}

// deleteReference, updateReference, fetchProjects, insertProject ...
```

### Step 14. museStore 내부 전환

`src/store/museStore.jsx` — **시그니처 유지, 내부만 교체**:

```jsx
import { useAuth } from '../hooks/auth/useAuth.js';
import * as museDb from '../lib/museDb.js';

export function MuseStoreProvider({ children, seed = 'empty' }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  // seed='fixtures' (Storybook)는 fixture 데이터 로드
  // seed='empty' (Dev/Prod)는 user 있을 때만 Supabase hydrate

  useEffect(() => {
    if (seed === 'fixtures') {
      dispatch({ type: 'HYDRATE', payload: fixtures });
      return;
    }
    if (!user) return;

    (async () => {
      const refs = await museDb.fetchReferences(user.id);
      const projs = await museDb.fetchProjects(user.id);
      // ...
      dispatch({ type: 'HYDRATE', payload: { references: refs, projects: projs, /* ... */ } });
    })();
  }, [seed, user?.id]);

  return <MuseStoreContext.Provider value={{ state, dispatch }}>{children}</MuseStoreContext.Provider>;
}

// 슬라이스 훅 — 공개 API 불변
export function useReferencesSlice() {
  const { state, dispatch } = useContext(MuseStoreContext);
  const { user } = useAuth();

  const addReference = useCallback(async (ref, file) => {
    if (!user) throw new Error('not signed in');
    const saved = await museDb.insertReference(ref, user.id, file);  // ← await 먼저
    dispatch({ type: 'ADD_REFERENCE', payload: saved });              // ← 성공 후 dispatch
    return saved;
  }, [user, dispatch]);

  // ... (시그니처는 Stage 4와 동일)

  return { references: state.references, addReference, removeReference, updateReference };
}
```

**`STORAGE_KEY` v4 → v5 bump**:
```js
const STORAGE_KEY = 'muse_store_v5';
// Supabase 사용 시 localStorage persist는 안 하지만, 버전 bump로 구버전 캐시 자동 무효화
```

### Step 15. async/await race fix

`src/pages/ProjectCreateRoute.jsx`:
```jsx
async function handleWizardComplete(projectData) {
  // ❌ 버그 — race
  // dispatch(addProjectLocal(projectData));
  // navigate(`/projects/${projectData.id}`);

  // ✅ 정답 — Supabase 왕복 후에만 dispatch + navigate
  const saved = await addProject(projectData);
  navigate(`/projects/${saved.id}`);
}
```

### Step 16. T3 이미지 512px 리사이즈

Stage 4에서 T3가 text-only로 설계됐더라도, 여전히 이미지 입력이 필요한 시나리오를 위해:
```js
// src/utils/museAiTasks.js
async function resizeImage(file, maxSize = 512) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(maxSize / bitmap.width, maxSize / bitmap.height, 1);
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  const canvas = new OffscreenCanvas(w, h);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
  return blob;
}
```
Stage 4에서 T1 업로드 시 이미 512px로 줄여놓으면 이 단계에서 추가 작업 없음.

### Step 17. RLS 수동 검증

두 개의 다른 계정으로 로그인하여:
1. 계정 A에서 레퍼런스 업로드 → DB/Storage에 저장됨
2. 계정 B로 로그인 → 계정 A의 레퍼런스 **조회 안 됨** (빈 리스트)
3. 계정 B가 계정 A의 Storage 경로로 직접 signed URL 요청 → **실패**

---

## ⑤ 체크리스트

- [ ] Supabase 프로젝트 생성 + `.env.local` 설정
- [ ] 3 마이그레이션 분리 적용 (스키마 / 트리거 / RLS)
- [ ] 6 테이블 전부 RLS enable + owner-only 정책
- [ ] Storage `references` 버킷 + 경로 정책 (`{user_id}/...`)
- [ ] `handle_new_user` 트리거가 profiles + user_settings 동시 생성
- [ ] AuthProvider 싱글톤 (App.jsx 최상위)
- [ ] 모든 곳에서 `supabase.auth.getSession()` 직접 호출 0건, `useAuth()`만 사용
- [ ] 회원가입 → 이메일 인증 → 로그인 플로우 성공
- [ ] ProtectedRoute가 비로그인 사용자를 `/auth`로 리다이렉트
- [ ] museDb 매퍼: snake↔camel, UI 플래그(`_pending` 등) DB 저장 제외
- [ ] museStore 슬라이스 훅 **공개 API 불변** (Stage 4와 동일 시그니처)
- [ ] 업로드 시 Storage `{user_id}/{reference_id}.{ext}` 경로 사용
- [ ] signed URL로 이미지 표시
- [ ] async 콜백: **await 먼저, 성공 후 dispatch** (race fix)
- [ ] T3 이미지 512px 리사이즈
- [ ] `STORAGE_KEY` v5로 bump
- [ ] RLS 수동 검증 — 다른 계정 데이터 조회 불가

---

## ⑥ 원본 로그 레퍼런스

이 Stage의 출처:
- **018** (백엔드 계획, 문서 동기화) → §③ 설계 기준
- **019** (Phase 1-4 적용, 마이그레이션 3종, 회원가입/로그인) → Step 3-12
- **020** (데이터훅, AuthProvider 싱글톤, Storage, 512px, 삭제/다중업로드) → Step 8-17
- **017 일부** (STORAGE_KEY 버전 관리) → Step 14
- **024 일부** (async/await race fix) → **Step 15로 당김**

### 실제 진행 이력 부록

> 원본 프로젝트에서 Supabase 연동은 **018 → 019 → 020** 세 단계에 걸쳐 진행됐고, 각 단계마다 예상치 못한 이슈가 나왔다:
>
> - **018의 교훈**: `references` 테이블명이 PostgreSQL 예약어라서 마이그레이션 스크립트에서 에러. 이후 `reference_items`로 전면 변경. 초기 설계 시 예약어 체크를 빠뜨린 대가가 컸다.
> - **019의 교훈**: `handle_new_user` 트리거가 처음에는 `profiles`만 생성했다. 로그인 후 설정 화면 진입 시 "user_settings 0건" 조회 에러 발생. 트리거에 `user_settings` insert 추가.
> - **020의 교훈**: AuthProvider를 만들기 전에는 여러 라우트에서 `supabase.auth.getSession()`을 직접 호출했다. 페이지 전환 시 세션이 간헐적으로 `null`로 보이는 race condition이 재현. Context 싱글톤으로 해결.
> - **024의 race 버그**: 프로젝트 생성 후 `/projects/:id` 이동 시 "없는 프로젝트" 에러가 간헐 발생. 원인은 Supabase insert가 끝나기 전에 dispatch + navigate가 먼저 일어나서. `await` 위치 하나 바꿔서 해결.
>
> **교훈**: 백엔드 연동은 "이슈 없이 한 번에 끝나지 않는다." 마이그레이션·트리거·세션 race·async 순서 — 각자 지뢰가 있다. 교육용으로는 이 지뢰들을 **사전에 심어놓은 원칙**으로 치환했다 (§③ 참조).

---

## 마무리

5 Stage가 끝났다. 이제 MUSE는:
- 인증된 사용자가 자기 계정으로 레퍼런스를 업로드하고
- T1이 자동 태깅 + 색·타이포·레이아웃 추출하고
- 프로젝트를 만들어 T2로 추천받고
- T3가 text-only로 디자인 토큰을 합성하고
- 범용 JSON / ZIP으로 Export 할 수 있다

실 운영으로 가려면 추가로: 사용량 모니터링 / 에러 트래킹 / 모델 비용 관찰 / 공유 기능 / 모바일 반응형 등이 남았지만, **MVP 스코프(Stage 1 정의)** 기준으로는 완결이다.

---

**돌아가기**: [전체 지도](./00-OVERVIEW.md)
