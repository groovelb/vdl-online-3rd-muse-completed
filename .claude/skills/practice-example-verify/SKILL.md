---
name: practice-example-verify
description: 실습예제 변환 작업 후 빠진 게 없는지 항목별로 검증하는 체크리스트 스킬. `vibe-design-starterkit-v1.0-practice/` 같은 변환 결과물 폴더 경로를 인자로 받아 실행. 사용자가 "/practice-example-verify <path>" 또는 "실습예제 점검해줘" 호출 시 사용.
---

# Practice Example Verify Skill

실습예제 변환 작업 후 **모든 삭제·수정·정리가 누락 없이 적용됐는지** 자동 점검한다.

`docs/practice-example-plan.md` 와 1:1 대응되는 체크리스트로 구성.

## 사용법

```
/practice-example-verify <target-dir>
```

`<target-dir>` 미지정 시 디폴트: `/Users/ddd/Desktop/starter-kit-v1.0-original/starter-kit-3rd/vibe-design-starterkit-v1.0-practice`

## 점검 항목 (각 항목 PASS / FAIL / WARN 으로 보고)

### A. 디렉토리 구조

- [ ] `<target>/.git` 존재하지 않음
- [ ] `<target>/node_modules` 존재하지 않음 (사용자가 install)
- [ ] `<target>/dist` 존재하지 않음
- [ ] `<target>/storybook-static` 존재하지 않음
- [ ] `<target>/.env.local` 존재하지 않음 (`.env.example` 만 존재)

### B. Supabase 코드 / 폴더 완전 제거

- [ ] `<target>/supabase/` 폴더 없음
- [ ] `<target>/src/lib/supabase.js` 없음
- [ ] `<target>/src/lib/museDb.js` 없음
- [ ] `<target>/src/hooks/auth/` 폴더 없음
- [ ] `<target>/src/utils/supabaseError.js` 없음
- [ ] `<target>/src/config/betaLimits.js` 없음
- [ ] grep `@supabase/supabase-js` → `<target>/package.json` 에서 매치 0
- [ ] grep `'supabase'\|from.*lib/supabase\|from.*lib/museDb` → `<target>/src/**/*.{js,jsx}` 매치 0
- [ ] grep `useAuth\|AuthProvider\|signIn\|signOut\|signUp` → `<target>/src/**/*.{js,jsx}` 매치 0
- [ ] grep `isAdminUser\|BETA_LIMIT` → `<target>/src/**/*.{js,jsx}` 매치 0

### C. 어드민 / 인증 라우트 제거

- [ ] `<target>/src/pages/AdminRoute.jsx` 없음
- [ ] `<target>/src/pages/auth/` 폴더 없음
- [ ] `<target>/src/App.jsx` 에서 `/auth`, `/admin`, `AuthProvider`, `AuthGuard`, `AdminRoute` 매치 0
- [ ] `<target>/src/pages/index.js` 에서 `AdminRoute` export 없음

### D. 랜딩페이지 제거

- [ ] `<target>/src/pages/auth/sections/Landing*.jsx` 없음 (B 와 중복 검증)
- [ ] `<target>/src/stories/page/LandingPage.stories.jsx` 없음
- [ ] `<target>/src/result/landing-stage2/` 없음
- [ ] grep `Landing\|landing` → `<target>/src/**/*.{js,jsx}` 매치 0 (또는 false-positive 만 잔존)

### E. Supabase 관련 문서 제거

- [ ] `<target>/docs/muse/appendix-db-schema.md` 없음
- [ ] `<target>/docs/muse/appendix-rls-policies.md` 없음
- [ ] `<target>/docs/muse/appendix-auth-design.md` 없음
- [ ] `<target>/docs/muse/appendix-edge-functions.md` 없음
- [ ] `<target>/docs/muse/appendix-api-integration.md` 없음
- [ ] `<target>/docs/work-log/018-*.md` 없음 (Supabase 백엔드 계획)
- [ ] `<target>/docs/work-log/019-*.md` 없음 (Supabase Phase1-4)
- [ ] `<target>/docs/work-log/020-*.md` 없음 (Supabase 데이터훅)
- [ ] `<target>/docs/work-log/curriculum/05-supabase-integration.md` 없음
- [ ] `<target>/.claude/skills/supabase-integration/` 없음

### F. 보존 대상 무결성

- [ ] `<target>/src/components/templates/ReferencePicker.jsx` 존재 (레퍼런스 업로드)
- [ ] `<target>/src/components/templates/ProjectCreateWizard.jsx` 존재 (프로젝트 생성)
- [ ] `<target>/src/components/templates/ArchivePage.jsx` 존재
- [ ] `<target>/src/components/templates/ProjectListPage.jsx` 존재
- [ ] `<target>/src/components/templates/ProjectDetailPage.jsx` 존재
- [ ] `<target>/src/utils/museAi.js` 존재 (T1/T2/T3 분석)
- [ ] `<target>/src/utils/museAiTasks.js` 존재
- [ ] `<target>/scripts/cli-test/` 존재 (system / concept 호출 스크립트)
- [ ] `<target>/.storybook/` 존재
- [ ] `<target>/.claude/rules/{code-convention,design-system,directory-structure,mui-grid-usage}.md` 4개 모두 존재

### G. 빌드 가능성 (정적 점검)

- [ ] `<target>/package.json` 의 `dependencies` JSON 파싱 가능
- [ ] `<target>/src/App.jsx` 의 import 경로 모두 실재 파일 (정적 검사)
- [ ] `<target>/src/store/museStore.jsx` 에서 `from '../lib/supabase'` `from '../hooks/auth'` `from '../lib/museDb'` 모두 매치 0
- [ ] `<target>/src/store/museStore.jsx` 에서 `seed='fixtures'` 또는 fixtures-only 동작 확인 (`remote` 분기 제거 여부)

### H. CLAUDE.md / 룰 정리

- [ ] `<target>/CLAUDE.md` 의 Workflow 섹션에 `supabase-integration` 라인 없음
- [ ] `<target>/CLAUDE.md` 에 em dash `—` 없음 (AI Slop 룰 자체 보존 확인 + 본문 위반 0)
- [ ] `<target>/.claude/skills/` 에 `supabase-integration` 폴더 없음

### I. 잔존 import 청소 (정적)

다음 파일들에서 supabase / auth / admin 참조 매치 0:
- [ ] `<target>/src/components/card/ReferenceCard.jsx`
- [ ] `<target>/src/components/templates/useReferenceArchive.js`
- [ ] `<target>/src/components/media/RefImage.jsx`
- [ ] `<target>/src/components/overlay-feedback/AnalysisProgress.jsx`
- [ ] `<target>/src/components/navigation/GNB.stories.jsx`
- [ ] `<target>/src/pages/AppShellLayout.jsx` (BetaNoticeDialog 제거)
- [ ] `<target>/src/pages/MuseNav.jsx`
- [ ] `<target>/src/pages/UserMenu.jsx` (또는 파일 자체 삭제)

## 실행 절차 (Claude 가 따를 순서)

1. 인자로 받은 `<target>` 경로 존재 확인. 없으면 즉시 중단 + 보고.
2. 각 섹션을 위에서부터 순서대로 검사. `find`, `grep`, `jq`, `node -e` 등 셸 도구 사용.
3. 항목당 결과를 `[PASS]` / `[FAIL]` / `[WARN]` 으로 단답 출력.
4. 마지막에 요약:
   - `✅ 통과: N / M`
   - `❌ 실패: 항목 리스트`
   - `⚠️ 경고: 항목 리스트`
5. 실패 항목이 있으면 **그 항목별 정확한 수정 명령** (예: `rm -rf <path>`, `sed -i '' ...`) 을 함께 제시.
6. 보고는 CLAUDE.md 의 Reporting Rules 형식 준수.

## 출력 예시

```
[A] 디렉토리 구조
  [PASS] .git 없음
  [PASS] node_modules 없음
  [FAIL] dist 존재 → rm -rf <target>/dist

[B] Supabase 제거
  [PASS] supabase/ 폴더 없음
  [FAIL] src/lib/supabase.js 잔존 → rm <target>/src/lib/supabase.js
  ...

요약
  ✅ 통과: 38 / 42
  ❌ 실패: A.dist, B.lib/supabase, ...
```

## 주의 사항

- 점검 스킬은 **읽기/grep 만 수행**. 실제 삭제·수정은 하지 않는다.
- 실패 항목에 대해서는 **수정 명령만 제시**, 실행은 사용자 승인 후.
- false-positive 가능 키워드 (`landing` 이 다른 의미로 쓰인 경우 등) 는 [WARN] 으로 분류.
