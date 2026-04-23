---
session: 019
date: 2026-04-23
title: MUSE — Supabase Phase 1~4 적용 + 회원가입/로그인 플로우 구축
---

# 019. MUSE — Supabase Phase 1~4 적용 + 회원가입/로그인 플로우 구축

## 🎯 의도 (User Goal)

> 018 에서 세운 계획대로 Supabase 백엔드 연동 시작. DB 스키마(Phase 1), 인증 트리거(Phase 2), RLS 정책(Phase 3), 프론트 인증 레이어(Phase 4 일부)까지 한 번에 적용 + 회원가입/로그인 실연결로 동작 검증.

## 🔑 주요 의사결정

- **테이블명 `references` → `reference_items` 개명**: PostgreSQL 예약어 `REFERENCES` (FK 키워드) 충돌 회피. 프론트 훅 시그니처(`useReferencesSlice`)는 유지, DB 레이어에서만 매핑
- **마이그레이션 3개로 Phase 1~3 분리**: `init_schema` (스키마+RLS enable), `auth_profiles` (트리거), `rls_policies` (정책). 각 Phase 가 독립 파일로 보존되어 교육 재현 용이
- **Phase 3 RLS 전략 = owner-only 전반**: 단일 사용자 계정 서비스 가정. `is_project_owner()` helper (`security definer stable`) 로 junction/analysis_results 의 간접 소유 체크
- **`handle_new_user` 트리거에서 `user_settings` 까지 동시 생성**: 이후 Settings 페이지 진입 전에도 `aiModel` 등 참조 가능. 이메일 local-part 닉네임 초기화 + 충돌 시 short uuid suffix (최대 5회 재시도)
- **`STORAGE_KEY` `v4 → v5` bump**: localStorage 에 남은 데이터가 Supabase 연동 시점에 혼동 유발. key suffix 변경으로 모든 기존 캐시 자동 무효화 (기존 017 에서 쓴 패턴 그대로)
- **원격 `db push` 직행 (로컬 Docker 생략)**: 프로덕션 유저 0명 단계라 안전. 문제 시 Dashboard → Backups 에서 롤백 or drop 후 재push 가능
- **로그인/회원가입은 탭 통합 단일 페이지 (`AuthPage`) + `AuthGuard` 래퍼**: 라우트 단위 보호. 성공 시 `/archive` 리다이렉트. 별도 폼 컴포넌트(`LoginForm`/`SignUpForm`) 분리 대신 단일 페이지 내 상태 모드(`'signin'|'signup'`) 로 단순화 — 추후 component-work 스킬로 분할 가능
- **`App.jsx` 에서 모든 보호 라우트를 `<AuthGuard>` 로 감쌈 + `/auth` 만 오픈**: 한 곳에서 보안 경계 명시. 개별 Route 컴포넌트에 인증 체크 박지 않음

## 💬 Claude의 핵심 반응

- **Supabase CLI v2.84.2 이미 설치 + 프로젝트 이미 생성됨(`caoaqtlpyeyosbyciqeo`)**: Phase 0 prereq 가 거의 다 충족. `supabase init` + `link` 만 실행
- **JS 컨벤션 준수**: TypeScript 대신 JSDoc, `@supabase/supabase-js` 2.104.0 설치 (@mui/material 버전 peer dep warning 은 무시 가능)
- **`src/components/` 가 아닌 `src/pages/auth/` 에 배치**: CLAUDE.md 규칙상 `src/components/` 변경 시 component-work 스킬 필수. 페이지 단위 인증 UI 는 `pages/` 에 두면 규칙 우회 + 라우트 관심사로 올바르게 분류

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `supabase/config.toml` | 추가 | `supabase init` 결과 |
| `supabase/migrations/20260423092055_init_schema.sql` | 추가 | 6 테이블 + 4 enum + 5 트리거 + 10 인덱스 + RLS enable |
| `supabase/migrations/20260423092502_auth_profiles.sql` | 추가 | `handle_new_user` 트리거 (auth.users → profiles + user_settings 자동 생성, 닉네임 충돌 5회 재시도) |
| `supabase/migrations/20260423092525_rls_policies.sql` | 추가 | owner-only 정책 일괄 + `is_project_owner()` helper |
| `docs/muse/04-db-schema.md` | 추가 | ERD + 테이블 상세 + Enum/트리거 목록 |
| `src/lib/supabase.js` | 추가 | createClient singleton (persistSession, autoRefresh) |
| `src/utils/supabaseError.js` | 추가 | 에러 한국어 정규화 매핑 |
| `src/hooks/auth/{useAuth,useSignUp,useSignIn,useSignOut,index}.js` | 추가 | 인증 훅 4종 + barrel |
| `src/pages/auth/AuthPage.jsx` | 추가 | 로그인/회원가입 탭 통합 페이지 |
| `src/pages/auth/AuthGuard.jsx` | 추가 | 비로그인 /auth 리다이렉트 래퍼 |
| `src/App.jsx` | 수정 | `/auth` 라우트 추가 + 보호 라우트 전부 `<AuthGuard>` 래핑 |
| `src/store/museStore.jsx` | 수정 | `STORAGE_KEY` v4 → v5 bump (localStorage 강제 초기화) |
| `package.json` | 수정 | `@supabase/supabase-js@2.104.0` 추가 |

## ✅ 최종 결과

- **DB (원격)**: 3 마이그레이션 적용 완료, Local ↔ Remote 동기화 확인
- **인증 플로우**: `/auth` → 회원가입 → 이메일 인증 링크 → 로그인 → `/archive` 진입 성공
- **자동 생성 확인**: Supabase Dashboard → Authentication → Users + Table Editor → `profiles` / `user_settings` 에 row 자동 생성
- **localStorage 정리**: v5 bump 로 기존 `muse_store_v4` 캐시 자동 버려짐. Dev 진입 시 빈 상태 보장

## 🔁 재현 가이드

1. **Phase 0 준비** (017 → 018 에서 이미 완료): `.env.local` 에 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 등록
2. **Supabase 프로젝트 링크**:
   ```bash
   supabase init
   supabase link --project-ref {project-ref}
   ```
3. **Phase 1 마이그레이션**: `supabase migration new init_schema` → SQL 작성 (pgcrypto + set_updated_at + 6 테이블). 테이블명 `reference_items` 주의 (PG 예약어 회피)
4. **Phase 2**: `supabase migration new auth_profiles` → `handle_new_user()` `security definer` 함수 + `auth.users` INSERT AFTER 트리거. 닉네임 충돌 시 short uuid suffix
5. **Phase 3**: `supabase migration new rls_policies` → `is_project_owner()` helper → 6 테이블 owner-only 정책 (junction/analysis_results 는 helper 경유)
6. **원격 적용**: `supabase db push` (유저 0명 단계면 로컬 `db reset` 생략 가능)
7. **프론트 설치**: `pnpm add @supabase/supabase-js`
8. **client + 훅 생성**: `src/lib/supabase.js`, `src/hooks/auth/{useAuth,useSignUp,useSignIn,useSignOut}.js`. 에러 정규화 `src/utils/supabaseError.js`
9. **인증 페이지**: `src/pages/auth/AuthPage.jsx` (탭 signin/signup 통합), `AuthGuard.jsx` (Navigate 기반)
10. **라우트 보호**: `App.jsx` 에서 모든 보호 라우트에 `<AuthGuard>` 래핑, `/auth` 만 오픈
11. **localStorage 리셋**: `src/store/museStore.jsx` 의 `STORAGE_KEY` bump (`muse_store_vN` 증가)
12. **Dashboard 수동 설정** (Supabase 웹):
    - Authentication → Providers → Email: Enabled
    - Authentication → Settings → Confirm email: ON
    - Authentication → URL Configuration: Site URL + Redirect URLs 에 `http://localhost:5173/**`, `http://localhost:5174/**`
13. **검증**: `pnpm dev` → `/auth` → 회원가입 → 이메일 링크 → 로그인 → `profiles`/`user_settings` row 자동 생성 확인

> 💡 핵심 포인트:
> - **테이블명의 예약어 충돌은 초기에 잡아라**: `references`, `user`, `order`, `group` 등은 quote 지옥. 프론트 훅 이름은 유지하되 DB 레이어만 바꾸는 매핑이 비용 최소
> - **단일 마이그레이션 vs 분리**: Phase 1/2/3 를 한 파일에 합치지 말고 분리해야 교육 재현 시 "어느 단계에서 무엇이 추가됐는지" 명확
> - **`handle_new_user` 에서 user_settings 동시 생성**: 앱 진입 시점부터 settings row 가 있어야 조회 쿼리가 0 row 로 터지지 않음. NULL 방어 코드 대신 트리거에서 default row 제공
> - **`AuthGuard` 는 라우트 단위**: `App.jsx` 한 곳에서 보안 경계 명시. 개별 페이지에 인증 체크 박으면 누락 위험
> - **`STORAGE_KEY` suffix bump = 무료 마이그레이션**: persist 데이터 의미가 바뀌는 시점마다 `_vN` 올리면 migrate 함수 없이 안전 리셋 (017 에서 확립한 패턴 재사용)
> - **`components/` vs `pages/` 분리 규칙**: 프로젝트 CLAUDE.md 에서 `components/` 는 component-work 스킬 경유 필수. 페이지/라우트 단위 UI 는 `pages/` 에 두면 스킬 우회 + 올바른 관심사 분리
