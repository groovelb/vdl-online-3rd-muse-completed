# 실습예제 변환 계획 (Practice Example Setup Plan)

작성일: 2026-05-01
목적: 완성된 `vibe-design-starterkit-v1.0` 프로젝트를 **백엔드/배포 코드를 제거한 실습용 시작 키트**로 변환하여 상위 폴더에 복사한다.

---

## 0. 작업 원칙 (CRITICAL)

1. **원본 프로젝트는 절대 수정하지 않는다.**
   현재 작업 디렉토리(`vibe-design-starterkit-v1.0/`)는 그대로 보존. 모든 삭제·수정은 **복사본에서만** 수행.
2. **복사본에는 `.git` 을 두지 않는다. `git init` 도 하지 않는다.**
   사용자가 직접 강의 단계에서 git 초기화하도록 빈 상태로 인계.
3. **빌드·런타임 무결성 보장**: 작업 후 `pnpm install && pnpm dev` 가 동작해야 한다 (fixtures 모드).
4. 모든 단계는 점검 스킬 `.claude/skills/practice-example-verify/SKILL.md` 의 체크리스트로 검증.

---

## 1. 결과물 위치 및 명명

- **목표 경로**: `/Users/ddd/Desktop/starter-kit-v1.0-original/starter-kit-3rd/vibe-design-starterkit-v1.0-practice/`
- 상위 폴더 기존 항목과 충돌 없음 (현재: `-start`, `-start-upload`, `-start-upload.zip` 만 존재).

---

## 2. 보존(KEEP) 대상

### 2-1. 라우터 (메인만)

`src/App.jsx` — 다음 라우트만 남긴다.

```
/             → Navigate to /archive
/archive      → ArchiveRoute (keep-alive)
/projects     → ProjectListRoute (keep-alive)
/projects/new → ProjectCreateRoute
/projects/:id → ProjectDetailRoute
/settings     → SettingsRoute
*             → Navigate to /archive
```

삭제: `/auth`, `/admin`, `<AuthProvider>`, `<AuthGuard>`.

### 2-2. 핵심 기능

- **레퍼런스 업로드** (드래그/파일 선택 → 로컬 dispatch 만)
- **프로젝트 생성 위자드** (Step 0 모드 선택 → Step 4 분석)
- **T1 / T2 / T3 분석 템플릿 호출 코드** (`src/utils/museAi.js`, `src/utils/museAiTasks.js`, `scripts/cli-test/`, `scripts/test-concept-call.mjs`)
- **컴포넌트 라이브러리 전체** (`src/components/**`)
- **Storybook 설정**, 디자인 토큰, 테마, 룰
- **`docs/muse/`** 중 Supabase 의존이 없는 UX/T3 스펙 문서 (선별)

### 2-3. 환경 변수

- `.env.example` — 다음 키만 유지:
  - `VITE_ANTHROPIC_API_KEY` (T1/T2/T3 분석용)
  - 이미지 업로드/스토리지 관련 키 전부 제거 (Pexels API 키 등 광고/외부 검색용은 사용자 판단으로 결정 — 디폴트 유지 권장)

---

## 3. 삭제(DELETE) 대상

### 3-1. Supabase 연동 (전면 삭제)

| 경로 | 비고 |
|------|------|
| `supabase/` (전체 폴더) | migrations / functions / config.toml |
| `src/lib/supabase.js` | 클라이언트 |
| `src/lib/museDb.js` | DB 매퍼 + storage 업로드 |
| `src/hooks/auth/` (전체 폴더) | AuthProvider / useSignIn / useSignOut / useSignUp / useAuth |
| `src/pages/auth/` (전체 폴더) | AuthPage / AuthDialog / AuthGuard / AuthHeroBackdrop / BetaNoticeDialog / landingCopy / sections/ |
| `src/utils/supabaseError.js` | 에러 매퍼 |
| `src/config/betaLimits.js` | 베타 한도 + isAdminUser |
| `src/pages/AdminRoute.jsx` | 어드민 페이지 |
| `src/pages/UserMenu.jsx` | 로그아웃 메뉴 (또는 stub 대체 검토) |
| `package.json` | `@supabase/supabase-js` dependency 제거 |
| `.env.local` | 복사본에서 제외 (`.env.example` 만 남김) |

### 3-2. 랜딩페이지 / 결과물

| 경로 | 비고 |
|------|------|
| `src/pages/auth/sections/Landing*.jsx` | LandingCta / LandingSolutionStage1 / LandingSolutionStage2 / LandingTagFlow / SectionShell |
| `src/stories/page/LandingPage.stories.jsx` | 랜딩 스토리 |
| `src/result/landing-stage2/` | 랜딩 결과물 |
| `src/result/test/` | 테스트 산출물 (검토 후 삭제) |

### 3-3. Supabase 관련 문서

| 경로 | 비고 |
|------|------|
| `docs/muse/appendix-db-schema.md` | DB 스키마 |
| `docs/muse/appendix-rls-policies.md` | RLS 정책 |
| `docs/muse/appendix-auth-design.md` | 인증 설계 |
| `docs/muse/appendix-edge-functions.md` | Edge Functions |
| `docs/muse/appendix-api-integration.md` | API 통합 (Supabase 종속 부분) |
| `docs/work-log/018-...Supabase-백엔드-계획.md` | |
| `docs/work-log/019-...Supabase-Phase1-4...md` | |
| `docs/work-log/020-...Supabase-데이터훅-완성...md` | |
| `docs/work-log/curriculum/05-supabase-integration.md` | |
| `.claude/skills/supabase-integration/` | 스킬 폴더 통째 |

### 3-4. 빌드 산출물 / 캐시

| 경로 | 비고 |
|------|------|
| `node_modules/` | 복사 시 제외 (사용자가 install) |
| `dist/` | |
| `storybook-static/` | |
| `.git/` | 복사본에 두지 않음 |
| `.DS_Store` | 모든 위치 |

---

## 4. 수정(REFACTOR) 대상

### 4-1. `src/App.jsx`

- `<AuthProvider>` 제거
- `<MuseStoreProvider seed="fixtures">` 또는 빈 시드 모드로 변경 (4-2 참조)
- `<AuthGuard>`, `<AuthPage>`, `AdminRoute` import / route 제거

### 4-2. `src/store/museStore.jsx`

선택지:
- **A. fixtures 모드 단일화**: `seed='fixtures'` 만 동작하게 단순화. Supabase / auth 의존 코드 전부 삭제. `remote` 분기 제거. CRUD는 in-memory dispatch only.
- **B. empty 시드 + 로컬 dispatch**: 초기 빈 상태 + dispatch만. 학습자가 직접 Supabase 연동을 추가하도록 깨끗한 골격 제공.

**권장: B** (실습 시작점이 비어 있는 게 더 자연스러움). 단 fixtures 가 필요한 Storybook 데모는 그대로 동작해야 함.

→ 결정: **`seed='fixtures'` 디폴트 + Supabase/auth 코드 완전 제거**. Storybook 데모와 첫 실행 모두 동작.

### 4-3. `src/pages/AppShellLayout.jsx`

- `BetaNoticeDialog` import 및 사용 제거
- `UserMenu` 를 빈 placeholder 또는 단순 닉네임 표시로 교체 (또는 `headerPersistent` 자체 미설정)

### 4-4. `src/pages/index.js`

- `AdminRoute` export 제거

### 4-5. `package.json`

- `@supabase/supabase-js` 제거
- name: `vibe-design-starter-kit-practice` 로 변경 검토

### 4-6. `CLAUDE.md`

- "Workflow" 섹션에서 `supabase-integration` 스킬 라인 제거
- "Current Status" 섹션은 삭제 또는 "실습 시작 상태" 로 교체
- AI Slop / Reporting / 디렉토리 / 코드 컨벤션 / 디자인시스템 룰은 보존

### 4-7. `.gitignore`

그대로 유지 (사용자가 git init 후 사용).

### 4-8. `README.md`

실습 시작 안내로 교체 (별도 작성 — 사용자 요청 시).

### 4-9. 잔존 import 정리

다음 파일들에서 supabase/auth import 가 여전히 남는지 점검 (점검 스킬에서 확인):
- `src/components/card/ReferenceCard.jsx` — `isAdminUser` 사용 여부
- `src/components/templates/useReferenceArchive.js` — supabase 직접 호출 여부
- `src/components/media/RefImage.jsx` — `getSignedUrl` 사용 여부 (signed URL → 일반 URL 또는 thumbnailUrl 직접 사용으로 대체)
- `src/components/overlay-feedback/AnalysisProgress.jsx` — supabase 문자열만 있는지 실제 호출인지 확인
- `src/components/navigation/GNB.stories.jsx` — 스토리 더미 데이터인지

---

## 5. 실행 순서 (Step-by-Step)

### Step 1. 복사본 생성 (rsync, .git/node_modules/dist/storybook-static 제외)

```bash
rsync -a \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='storybook-static' \
  --exclude='.DS_Store' \
  --exclude='.env.local' \
  /Users/ddd/Desktop/starter-kit-v1.0-original/starter-kit-3rd/vibe-design-starterkit-v1.0/ \
  /Users/ddd/Desktop/starter-kit-v1.0-original/starter-kit-3rd/vibe-design-starterkit-v1.0-practice/
```

### Step 2. 복사본에서 Supabase 폴더 / 파일 일괄 삭제 (3-1, 3-2, 3-3 목록)

### Step 3. `src/App.jsx` 라우트 단순화

### Step 4. `src/store/museStore.jsx` fixtures-only 리팩토링

### Step 5. `AppShellLayout.jsx`, `pages/index.js`, `MuseNav.jsx` 등 import 정리

### Step 6. `package.json` 에서 `@supabase/supabase-js` 제거

### Step 7. `CLAUDE.md` Workflow / Current Status 섹션 정리

### Step 8. `.claude/skills/supabase-integration/` 삭제

### Step 9. 점검 스킬 `practice-example-verify` 실행 → 모든 체크리스트 통과 확인

### Step 10. (선택) 사용자 환경에서 `pnpm install && pnpm dev` 동작 검증

---

## 6. 보고 형식 (CLAUDE.md Reporting Rules 준수)

작업 완료 시 반드시 다음 형식으로:

- ✅ 준비된 것 (파일 삭제 / 수정 완료, 점검 스킬 통과)
- ⚠️ 부분 작동 (린트는 통과하나 런타임 미검증 등)
- ❌ 안 된 것 (사용자 검증 필요한 항목)

---

## 7. 미검증 항목 (사용자 확인 필요)

- Pexels API 키 (`utils/pexels-test-data.js`) — 실습에서 외부 이미지 검색 사용 여부
- `muse-curriculum/` 폴더 (프로젝트 루트) — 실습용으로 보존할지 삭제할지
- `docs/research/`, `docs/spec/`, `docs/claude-knowledge/` 등 메타 문서 보존 여부
- `src/result/` 내 결과물 이미지/JSON — 학습 참고용 보존 여부 (`landing-stage2` 외)
- README.md 를 실습용으로 새로 작성할지

이 7개 항목은 작업 시작 전 **사용자에게 물어보고 결정**한다.
