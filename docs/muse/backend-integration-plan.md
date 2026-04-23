# MUSE — Supabase Backend Integration Plan

> MUSE 프론트엔드(현 상태 = localStorage persist + Dev 프록시)를 Supabase 백엔드(Postgres + Auth + Storage + Edge Functions)로 이전하기 위한 **6-Phase 로드맵**. `docs/muse/02-ux-flow.md` 의 데이터 모델을 입력으로 삼는다.
>
> 실행 가이드: `./backend-integration-tutorial.md` (Step-by-step)

---

## 1. 현재 상태 & 목표

### 현재 (session 017 시점)

- 상태 관리: Context + useReducer + localStorage (`muse_store_v4`)
- AI 호출: Vite dev middleware (`.storybook/museApiPlugin.js`) 로컬 전용
- 이미지: Vite 번들 URL (더미 28장 static import) 또는 `data:` URL (업로드 시)
- 인증: 없음. 단일 사용자 가정

### 목표 (Phase 6 완료 후)

- 상태 저장: Supabase Postgres (`references / projects / analysis_results` 등)
- 인증: Supabase Auth (Email+Password)
- 이미지: Supabase Storage (`references` bucket, signed URL)
- AI 호출: Supabase Edge Function (`anthropic-proxy`). `ANTHROPIC_API_KEY` 는 secrets 에만 존재 — 프론트 번들에 노출 0
- 프론트 훅 인터페이스 불변: `useReferencesSlice / useProjectsSlice / ...` 이름을 유지해 컴포넌트 수정 최소화

---

## 2. 데이터 모델 → Postgres 매핑 (Phase 1 초안)

### 테이블 목록

| 테이블 | 도메인 엔티티 | PK | 주요 FK |
|--------|-------------|----|---------|
| `profiles` | (신규) auth.users 확장 | `id → auth.users.id` | — |
| `references` | Reference | `id uuid` | `user_id → profiles.id` |
| `projects` | Project | `id uuid` | `user_id → profiles.id` |
| `project_references` | Project ↔ Reference N:M | `(project_id, reference_id)` | 양쪽 CASCADE |
| `analysis_results` | AnalysisResult | `id uuid` + `project_id UNIQUE` | `project_id → projects.id` |
| `user_settings` | UserSettings (singleton per user) | `user_id → profiles.id` | — |

### 스키마 핵심 결정

1. **`Project.referenceIds[]` 배열 → `project_references` junction 테이블로 정규화**
   - 이유: 향후 "프로젝트에 속한 모든 레퍼런스 조회", "특정 레퍼런스가 속한 프로젝트" 양방향 쿼리 + CASCADE 관리 용이
   - 프론트 훅에서는 `Project.referenceIds` 파생 필드로 계속 노출 (join 쿼리 결과를 flatten)

2. **`Reference.tags` (ReferenceLayeredTags 중첩) → `tags jsonb`**
   - 이유: preset 어휘 기반 중첩 구조(color/typography/layout/gradient/visualDirection.{genre,style,subject})를 테이블 정규화하면 7개 join 테이블 필요. 조회는 "전체 꺼내기" 패턴이므로 `jsonb` + GIN 인덱스로 충분
   - 검색 시: `tags @> '{"color":["muted"]}'::jsonb` 같은 containment 쿼리 활용

3. **`AnalysisResult.layers` (5개 레이어 이종 shape) → `layers jsonb`**
   - 이유: 레이어별 토큰 shape이 완전히 달라 정규화 비용이 매우 큼. 편집은 항상 "프로젝트 1개의 분석 결과 통째로" 단위
   - `project_id` UNIQUE 제약으로 1:1 강제

4. **이미지는 Supabase Storage, 테이블에는 path만**
   - `references.storage_path text` (예: `"user/{uid}/{referenceId}.jpg"`)
   - 조회 시 client 헬퍼에서 signed URL 변환 → `thumbnailUrl` 필드로 노출

5. **공통 컬럼 일관**: `id uuid default gen_random_uuid()`, `created_at timestamptz`, `updated_at timestamptz` + `set_updated_at` 트리거

### ERD (요약)

```
auth.users ──1:1── profiles ──1:N── references
                      │                  │
                      │                  │ N:M (via project_references)
                      │                  │
                      └──1:N── projects ─┘
                                  │
                                  │ 1:1
                                  │
                            analysis_results

profiles ──1:1── user_settings
```

---

## 3. 인증 설계 (Phase 2 초안)

- **Provider**: Email + Password (표준)
- **이메일 인증**: 필수 (Supabase 기본)
- **`profiles` 자동 생성**: `handle_new_user` 트리거 (auth.users insert → profiles insert, nickname=email의 local-part)
- **`user_settings` 자동 생성**: `handle_new_user` 트리거에서 동시에 기본값 insert (MUSE는 Settings 페이지 진입 전부터 `aiModel` 등을 참조)

---

## 4. RLS 정책 매트릭스 (Phase 3 초안)

**핵심**: MUSE는 다중 사용자 SaaS 전제, 모든 데이터는 **owner-only**. 공개 공유 기능은 현재 요건에 없음.

| 테이블 | SELECT | INSERT | UPDATE | DELETE | 패턴 |
|--------|--------|--------|--------|--------|------|
| `profiles` | 모두 | 트리거 전용 | 본인만 | 금지 (auth cascade) | G |
| `references` | 본인만 | 본인만 | 본인만 | 본인만 | A (owner-only) |
| `projects` | 본인만 | 본인만 | 본인만 | 본인만 | A |
| `project_references` | 프로젝트 소유자 | 프로젝트 소유자 | — (UPDATE 정책 없음) | 프로젝트 소유자 | F (junction) + is_project_owner helper |
| `analysis_results` | 프로젝트 소유자 | 프로젝트 소유자 | 프로젝트 소유자 | 프로젝트 소유자 | via is_project_owner |
| `user_settings` | 본인만 | 트리거 전용 | 본인만 | 금지 | A |

**Helper 함수**: `public.is_project_owner(p_project_id uuid)` — `security definer stable`, projects 테이블의 user_id 조회

---

## 5. 클라이언트 코드 (Phase 4 초안)

### 유지되는 공개 API (컴포넌트 수정 0)

현재 `src/store/museStore.jsx` 가 노출하는 슬라이스 훅 시그니처 그대로 유지:
- `useReferencesSlice()` → `{ references, addReference, updateReference, removeReference }`
- `useProjectsSlice()` → `{ projects, addProject, updateProject, removeProject }`
- `useAnalysesSlice()` → `{ analyses, getAnalysis, setAnalysis, updateLayer }`
- `useSettingsSlice()` → `{ settings, updateSettings }`

### 내부 구현 교체

- `src/lib/supabase.js` — client singleton
- `src/utils/supabaseError.js` — 에러 정규화
- `src/types/database.js` — `supabase gen types` + JSDoc 변환
- `src/hooks/auth/{useAuth,useSignUp,useSignIn,useSignOut}.js`
- `src/hooks/data/{useReferences,useProjects,useAnalyses,useSettings}.js`  ← Supabase 기반 CRUD
- `src/store/museStore.jsx` → **shim 모드**: 기존 슬라이스 훅을 `src/hooks/data/*` 로 위임하는 래퍼로 축소. `seed='fixtures'` 경로는 Storybook 전용으로 유지 (mock client 주입)

### Storybook 호환

- 모든 데이터 훅 `{ client }` 파라미터 주입 가능
- `.storybook/preview.jsx` 에서 in-memory mock client 주입 → 기존 27장 fixtures 스토리 모두 회귀 없음

---

## 6. 이미지 스토리지 (Phase 4 확장)

- Bucket: `references` (private)
- Path 규칙: `{user_id}/{reference_id}.{ext}`
- Upload: `supabase.storage.from('references').upload(path, file)` → 성공 시 references 테이블에 insert (`storage_path` 저장)
- Download: `supabase.storage.from('references').createSignedUrl(path, 3600)` → `thumbnailUrl` 로 노출
- ZIP Export: 기존 `museExport.js` 는 fetch(signedUrl) → JSZip 로 변경

---

## 7. Edge Function — Anthropic Proxy (Phase 6)

**현재 문제**: `.storybook/museApiPlugin.js` 는 Vite dev 서버 전용. 프로덕션 배포 시 T1/T2/T3 호출 경로가 없음. `VITE_*` 로 키 노출은 금지.

**해법**: Edge Function `anthropic-proxy` 1개로 통일.

| 항목 | 내용 |
|------|------|
| 이름 | `anthropic-proxy` |
| Method | POST |
| Auth | Supabase JWT 필수 (비로그인 차단) |
| 입력 | `{ model, system, messages, tools?, tool_choice?, max_tokens }` (Anthropic API passthrough) |
| 출력 | Anthropic 응답 그대로 |
| Secret | `ANTHROPIC_API_KEY` (supabase secrets) |
| Rate limit | user별 `100회/일` (초기값, `rate_limits` 테이블 + trigger로 counter) |

**프론트 교체**: `src/utils/museAi.js` 의 `callAnthropic` 구현체만 교체 (fetch URL: `/api/anthropic/messages` → `supabase.functions.invoke('anthropic-proxy')`). `museAiTasks.js` (T1/T2/T3 wrapper) 는 무변경.

**Stage 전환**: 현재 이미 기능 검증 완료(Stage B) → Stage C 바로 진행 가능.

---

## 8. 환경 변수 · 시크릿 (최종 상태)

### 프론트 `.env.local`

```bash
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
# ANTHROPIC_API_KEY 프론트에서 제거 ← Phase 6 완료 후
```

### Supabase secrets (서버)

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

### `.storybook/museApiPlugin.js`

- 로컬 개발 편의를 위해 **유지** (Edge Function 배포 전 로컬 검증용)
- 프로덕션 빌드에서는 호출 경로 자체가 없음

---

## 9. Phase 실행 체크리스트

### RLS 안전장치 (모든 Phase 관통)

> **주의**: Supabase 에는 "프로젝트 레벨로 모든 신규 테이블에 RLS 자동 적용" 이라는 전역 토글은 **존재하지 않음**. Studio Table Editor UI 의 신규 테이블 생성 폼에 RLS 체크박스(기본 ON)가 있을 뿐. 우리는 UI 를 쓰지 않고 마이그레이션으로만 스키마를 관리하므로 그 체크박스도 무관.

- [ ] 모든 마이그레이션 파일에 `alter table ... enable row level security;` **명시적 포함** (유일한 진실 원천)
- [ ] Phase 3 끝 검증 쿼리 실행: 정책 없는 RLS 활성 테이블 0건 + RLS 미활성 public 테이블 0건 (`pg_class` / `pg_policies`)
- [ ] Dashboard → **Advisors → Security Advisor** 에 RLS 경고 0건 (배포 전 자동 감사 역할)
- [ ] Table Editor 에서 모든 public 테이블에 **"Unrestricted" 라벨 없음** 육안 확인
- [ ] Storage bucket 은 별도 RLS — `storage.objects` 에 user-scoped 정책 부착 (Phase 4)

### Phase 별 게이트

| Phase | 산출물 | 승인 게이트 |
|------|-------|-----------|
| 0 | 프리체크 | ✅ (위) |
| 1 | `docs/muse/04-db-schema.md` + `supabase/migrations/{ts}_init_schema.sql` | ERD + 테이블 목록 |
| 2 | `docs/muse/05-auth-design.md` + `{ts}_auth_profiles.sql` | handle_new_user 트리거 |
| 3 | `docs/muse/06-rls-policies.md` + `{ts}_rls_policies.sql` | 정책 매트릭스 + 검증 결과 |
| 4 | `src/lib/supabase.js` + `src/hooks/{auth,data}/*` + `src/types/database.js` | 훅 목록 + Storybook 회귀 |
| 5 | `docs/muse/07-api-integration.md` + seed 데이터 | 스모크 테스트 리포트 |
| 6 | `docs/muse/08-edge-functions.md` + `supabase/functions/anthropic-proxy/index.ts` | `grep sk- dist/ = 0건` + JWT 검증 |

---

## 10. 리스크 & 결정 포인트

| 이슈 | 결정 |
|------|------|
| `tags jsonb` vs 정규화 | **jsonb** 채택 — 편집 항상 통째 단위 + GIN 인덱스로 검색 충분 |
| `layers jsonb` vs 레이어별 테이블 | **jsonb** 채택 — 이종 shape 정규화 비용 과다 |
| Image Storage vs base64 in DB | **Storage** 필수 — 28장만 해도 DB row size 폭발 |
| 기존 localStorage 사용자 마이그레이션 | **폐기** — MUSE는 아직 프로덕션 유저 0명 (개발 단계), 깔끔한 cutover |
| Edge Function cold start | Anthropic 호출 자체가 수백ms~수초라 cold start 영향 미미 |
| Storybook mock | `{ client }` 파라미터 주입 패턴, 기존 `seed='fixtures'` 경로와 결합 |

---

## 11. 다음 스텝

1. 이 계획에 대한 사용자 승인 →
2. `/supabase-integration` 호출하여 **Phase 1** 시작 (`docs/muse/04-db-schema.md` + 첫 마이그레이션)
3. Phase 1 승인 → Phase 2 → ... 순차 진행
4. 튜토리얼(`./backend-integration-tutorial.md`)을 병행 참고
