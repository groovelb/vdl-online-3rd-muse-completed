---
session: 035
date: 2026-04-29
title: MUSE 어드민 페이지·이미지 만료 대응·위자드 풀스크린·AI 노트 제안
---

# 035. MUSE 어드민 페이지·이미지 만료 대응·위자드 풀스크린·AI 노트 제안

## 🎯 의도 (User Goal)

여러 갈래 작업을 한 세션에 처리:
1. ProjectCreateWizard 의 모드 카드/워딩/레이아웃을 풀스크린 + 고정 하단 nav 로 재구성
2. Archive 의 인라인 dropzone 을 모달로 이동 ("레퍼런스 추가" 버튼)
3. Custom SMTP 없이도 회원가입이 동작하도록 즉시 로그인 흐름으로 변경
4. groovelb@gmail.com 어드민 지정 + 어드민 전용 페이지 (전체 사용자의 references / projects 조회)
5. 라우터 이동 중 이미지 깨짐 현상 진단 및 완화
6. Step 3 활용 노트에 AI 자동 생성 (반짝 아이콘) 추가

## 🔑 주요 의사결정

- **모드 default `system` → `concept`**: 첫 진입 사용자가 가장 자주 쓸 흐름. 모드 카드 emoji 제거 + 시나리오 중심 설명문 추가.
- **위자드 레이아웃 = 3분할 viewport**: `height: calc(100vh - 64px)` + `flex column`. 상단 Stepper(고정), 중앙 input(flex:1, `my:auto` 로 콘텐츠 짧을 때만 중앙정렬), 하단 nav(`position:fixed`). `align-items:center + overflow:auto` 의 클리핑 문제는 `my:auto` 트릭으로 해결.
- **이미지 만료 = 본질 해결 X**: TTL 1h→7d 와 RefImage `onError` 재서명은 완화책임을 사용자에게 명시. 본질 해결안(Public bucket / Edge Function proxy / Store가 단일 진실원)을 L1~L5 구조 계획으로 정리.
- **어드민 = `auth.users.app_metadata.role`**: client SDK 변경 불가한 필드. JWT 에 자동 포함되어 RLS 에서 안전 검증. `user_metadata` 사용 금지.
- **CLI 직접 마이그레이션 적용**: `supabase db push` 가 사전 마이그레이션 enum 충돌로 실패해 `supabase db query --linked --file` 로 두 admin 마이그레이션만 실행 후 `migration repair --status applied` 로 트래커 동기화.
- **회원가입 즉시 로그인**: signUp 후 session 있으면 바로 navigate, 없으면 signIn 폴백. "Confirm email" OFF 가 사용자 측 전제임을 명시.

## 💬 Claude의 핵심 반응

재현에 영향을 주는 판단:

- **Archive 의 `onNewProject` prop은 이제 hero 버튼에 연결 안 됨** — `ArchiveRoute` 의 prop 전달은 dead code 상태. 명시적으로 보고했으나 정리 안 했음.
- **이미지 깨짐 진단 시 "본질적 수정 아님" 을 명시** — 사용자가 솔직 진단 요청 시 가설과 검증 부재를 분리해 보고. 다음 단계로 DevTools Network 응답코드 확인을 제시.
- **`mui-grid-usage.md` 룰 (Grid2 금지)** 은 이번 작업에서 직접 영향 없음. Grid 사용처 새로 만들지 않음.
- **`/component-work` skill 우회** — 본 세션은 텍스트/레이아웃/스토리 없는 변경이 다수라 skill 호출하지 않고 직접 Edit. 신규 컴포넌트(`RefImage`, `AdminRoute`) 만 신규 작성했으나 별도 스토리 미생성.

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/components/templates/ProjectCreateWizard.jsx` | 수정 | MODE_DEFS 워딩+default, 풀스크린 레이아웃, 고정 하단 nav, AI 노트 버튼 |
| `src/components/card/ModeSelectCard.jsx` | 수정 | emoji 제거, description 폰트/위치 조정, minHeight 200→260 |
| `src/components/templates/ReferencePicker.jsx` | 수정 | columns `{lg:5, xl:6}` 확장 |
| `src/components/templates/ArchivePage.jsx` | 수정 | 인라인 dropzone 제거, "레퍼런스 추가" 모달 + 파일 업로드 버튼 |
| `src/pages/ProjectCreateRoute.jsx` | 수정 | PageContainer 제거, 풀폭 wrapper, `toPickerItem` 에 storagePath 추가 |
| `src/pages/auth/AuthPage.jsx` | 수정 | signUp 후 즉시 signIn 자동 호출, "이메일 인증" 안내 제거 |
| `src/hooks/auth/AuthProvider.jsx` | 수정 | `isAdmin` (app_metadata.role) 노출 |
| `src/pages/MuseNav.jsx` | 수정 | admin 일 때 "Admin" 링크 추가 |
| `src/pages/AdminRoute.jsx` | 추가 | 어드민 전용: 사용자 리스트 + 선택 유저의 refs/projects 조회 |
| `src/pages/index.js` | 수정 | AdminRoute export |
| `src/App.jsx` | 수정 | `/admin` 라우트 등록 |
| `src/lib/museDb.js` | 수정 | SIGNED_URL_TTL 1h → 7d |
| `src/components/media/RefImage.jsx` | 추가 | onError 시 storagePath 로 1회 자동 재서명 |
| `src/components/media/index.js` | 수정 | RefImage export |
| `src/components/templates/ProjectDetailPage.jsx` | 수정 | 사용된 레퍼런스 썸네일 → RefImage |
| `src/components/overlay-feedback/ReferenceNotesDialog.jsx` | 수정 | 썸네일 → RefImage |
| `src/components/overlay-feedback/ReferenceDetailDialog.jsx` | 수정 | 대형 미리보기 → RefImage |
| `src/components/data-display/TokenDecisionTracePanel.jsx` | 수정 | 28×28 출처 칩 → RefImage |
| `src/components/input/RefinementNotesField.jsx` | 수정 | ref 카드 썸네일 → RefImage |
| `src/utils/museAiTasks.js` | 수정 | `runSuggestRefNote` 추가 (단일 ref 활용 노트 생성) |
| `supabase/migrations/20260429000000_grant_admin_groovelb.sql` | 추가 | groovelb@gmail.com `app_metadata.role='admin'` |
| `supabase/migrations/20260429000100_admin_rls_and_rpc.sql` | 추가 | `is_admin()` helper, 5개 admin SELECT 정책, `admin_list_users()` RPC |

## 🧩 컴포넌트 작업

- **신규**: `RefImage` (category: `media`) — signed URL 만료 자동 복구 이미지
- **신규**: `AdminRoute` (page) — 사용자/References/Projects 3-pane
- **수정**: `ProjectCreateWizard` — viewport 분할 레이아웃, AI 노트 자동생성 (`AutoAwesomeIcon` + 펄스 애니메이션)
- **수정**: `ModeSelectCard` — emoji 제거, description body2 + 카드 minHeight 확장
- **수정**: `ArchivePage` — 모달 + 모달 내 FileDropzone + "파일 업로드" 버튼 (숨겨진 input 트리거)
- **재사용**: `FileDropzone`, `ImageCard`, `ReferencePicker`, `Stepper`, `Tabs`, `Table`, `AutoAwesomeIcon`

## ✅ 최종 결과

- 어드민 페이지: groovelb 만 GNB 에 "Admin" 노출, 4명 사용자 / 본인 35 ref·5 project / 나머지 0개 확인 (CLI 검증 완료).
- 회원가입: 1폼으로 즉시 로그인 진입 (Supabase 측 "Confirm email" OFF 전제).
- 위자드: 3분할 풀스크린 + 모드 default `concept` + Step 3 활용 노트에 ✨ AI 자동생성.
- 이미지 만료: TTL 7d + RefImage 자가 복구. **본질 해결 아님** (구조 계획 L1~L5 별도 정리).

## 🔁 재현 가이드 (교육생용)

1. **모드 카드 워딩 / 풀스크린 위자드**: `ProjectCreateWizard.jsx` MODE_DEFS 의 title/subtitle/description 교체 + initialState mode `'concept'`. 외곽 wrapper 를 `height: calc(100vh - 64px)` flex column 으로 변경, 하단 nav 는 `position: fixed`. 중앙 input 영역 클리핑 방지는 부모 `flexDirection:column + overflow:auto`, 자식 `width:100%; my:auto` 패턴.
2. **Archive 모달화**: 기존 hero 아래 FileDropzone 을 Dialog 로 이동. hero 버튼을 "레퍼런스 추가" 로 바꾸고 `setIsAddRefOpen(true)`. 모달 안에 `FileDropzone` + 숨겨진 `<input type="file">` 을 ref 로 트리거하는 "파일 업로드" Button.
3. **즉시 로그인**: `AuthPage` 의 signup 분기에서 `signUp` 후 `data.session` 있으면 navigate, 없으면 같은 자격으로 `signIn` 호출. Supabase 대시보드 "Confirm email" OFF 필요.
4. **어드민 지정 (CLI 직접)**:
   ```
   supabase db query --linked --file supabase/migrations/20260429000000_grant_admin_groovelb.sql
   supabase db query --linked --file supabase/migrations/20260429000100_admin_rls_and_rpc.sql
   supabase migration repair --linked --status applied 20260429000000 20260429000100
   ```
   이후 `app_metadata.role='admin'` 이 박힌 새 JWT 가 필요하므로 **재로그인 필수**.
5. **AdminRoute**: `useAuth().isAdmin` 가드 → `supabase.rpc('admin_list_users')` 로 사용자 리스트, 선택 시 `reference_items / projects` 를 user_id 로 조회. RLS 가 admin SELECT 정책으로 통과시킴.
6. **이미지 만료 완화**: `museDb.js` TTL 7d 로 변경. `RefImage` 컴포넌트로 `<img>` 교체 — `onError` 시 `getSignedUrl(storagePath)` 로 1회 재서명. `storagePath` 가 prop 으로 전달돼야 동작하므로 `toPickerItem` 등 매퍼에 보강 필수.
7. **AI 노트 자동생성**: `museAiTasks.js` 에 `runSuggestRefNote` 추가 (intent + mode + ref 메타로 ≤100자 한 줄 생성). Step 3 TextField 우상단에 `AutoAwesomeIcon` IconButton, 진행 중에는 `CircularProgress` + 펄스 키프레임 애니메이션 + drop-shadow glow.

> 💡 핵심 포인트:
> - **Supabase signed URL 은 1h 만료가 기본**. 이 프로젝트처럼 storage_path 100% 의존이면 세션 1시간 후 전 이미지 깨짐 → TTL 연장 + 재서명 mechanism 둘 다 있어야 사용 가능.
> - **app_metadata 는 JWT 에 박히는 시점이 토큰 발급 시점**. role 변경 후 무조건 재로그인 필요.
> - **`align-items:center` + `overflow:auto` 의 클리핑** 은 잘 알려진 함정. `my:auto` 트릭으로 우회.
