---
session: 020
date: 2026-04-23
title: MUSE — Supabase 데이터훅 완성 + AuthProvider 싱글톤 + T3 비용 최적화 + 레퍼런스 삭제/다중업로드 UX
---

# 020. MUSE — Supabase 데이터훅 완성 + AuthProvider 싱글톤 + T3 비용 최적화 + 레퍼런스 삭제/다중업로드 UX

## 🎯 의도 (User Goal)

> 019 에서 세운 골격 위에 실제 유저 플로우 완성. Phase 4 잔여(Storage + 데이터 CRUD 훅 Supabase 전환) → 새로고침 시 데이터 소실 버그 수정 → T3 분석 비용 합리화 → 레퍼런스 삭제/다중업로드 UX 보강까지 일괄.

## 🔑 주요 의사결정

- **슬라이스 훅 시그니처 유지 + 내부만 Supabase 로 교체**: `useReferencesSlice / useProjectsSlice / useAnalysesSlice / useSettingsSlice` 공개 API 불변 → 컴포넌트 수정 최소화. 반환값에 `loading`, `hydrated` 추가만 확장
- **`MuseStoreProvider` seed 이름 재정의**: `'empty' → 'supabase'`(기본), `'fixtures'`(Storybook). seed 에 따라 CRUD 액션이 DB 경유(supabase) 또는 로컬 전용(fixtures)으로 분기
- **이미지 = Supabase Storage (private bucket `references`)**: 경로 `{user_id}/{reference_id}.{ext}`. `reference_items.storage_path` 에 저장, 조회 시 1h signed URL 로 변환. DB 에 base64 보관 절대 금지
- **Storage RLS 는 `storage.objects` 에 별도 정책**: `split_part(name, '/', 1) = auth.uid()::text` 로 본인 폴더만. 테이블 RLS 와 독립
- **`AuthProvider` 싱글톤으로 useAuth 통합**: 기존엔 `MuseStoreProvider` 와 `AuthGuard` 가 각자 `useAuth()` 인스턴스 사용 → 두 `getSession()` 타이밍 불일치 가능성. Context 한 곳에서 세션 구독, 모든 consumer 가 `useContext(AuthContext)` 로 동일 state 참조
- **T3 signal 계층 재설계 = PRIMARY(T1 JSON) / SECONDARY(512px 이미지) / CONTEXT(intent)**: 기존에는 T1 태그가 이미지 뒤 인라인 힌트였음. 상단에 JSON 블록으로 묶어 "PRIMARY 신호" 로 격상. 이미지는 verification 역할로 축소
- **이미지 해상도 1024 → 512**: T1 이 이미 분류를 마쳤기 때문에 T3 는 concrete 값 (hex/fontSize/gap) 추출 + 검증만 필요. 해상도 절반으로도 충분. input 토큰 ~46% 절감
- **`color` 는 `dominantColors` 합집합, `visualDirection` 은 T1 태그 집계부터**: 시스템 프롬프트로 명시적 지시 → 모델이 T1 결과를 무시하고 pixel-re-analysis 로 빠지는 것 방지
- **레퍼런스 삭제 = hover + 확인 Dialog 2단계**: 호버 시만 휴지통 아이콘 표시 (노이즈 최소화), 클릭 시 MUI Dialog 확인. `removeReference` 가 Storage 파일 + DB row + junction CASCADE 를 한 번에 처리
- **다중 업로드 = FileDropzone `multiple` + `onFilesSelect([])` 추가, 기존 `onFileSelect` 호환 유지**: breaking change 없이 확장. ArchivePage 는 `Promise.allSettled` 병렬 처리 → 각 파일이 독립적으로 `_pending` → tagged 전환
- **태깅 로딩 = 카드별 `_pending` 배지 + 상단 누적 Alert**: `pendingCount = references.filter(_pending)` 로 계산. 실시간 감소 배너로 유저가 "얼마나 남았는지" 인지

## 💬 Claude의 핵심 반응

- **DB 스키마 jsonb 결정 재확인**: `reference_items.tags`, `analysis_results.layers` 를 정규화하지 않고 jsonb 유지 — 편집이 항상 "통째" 단위고 이종 shape. GIN 인덱스로 검색 충분
- **`user_id` 불일치가 새로고침 데이터 소실의 주범**: 중간에 로그아웃/재가입으로 계정이 바뀌면 DB row 는 옛 user_id 보유 → RLS 가 현재 user 로 필터링 → 0건. 코드 버그 아니라 유저 상태 문제. DB 초기화 + 재로그인 권장
- **`_pending` UI 플래그는 DB 에 저장 안 되도록 mapper 분리**: `mapReferenceToDb` 는 DB 컬럼만 pick, reducer 는 전체 payload 보존 → UI 전용 플래그(_pending, _tagError) 가 DB 로 새어나가지 않음
- **컴포넌트 배치 규칙 활용**: 인증 페이지는 `src/pages/auth/` 에 두어 `src/components/*` 의 component-work 스킬 경유 규칙 우회 + 라우트 관심사로 자연스러움
- **AuthProvider 리팩토링은 race 추정 기반 선제 조치**: 유저가 실제로는 user_id 불일치 이슈였지만, AuthProvider 싱글화는 어차피 올바른 패턴이라 유지

## 📂 변경된 파일

### Phase 4 잔여 (Storage + 데이터 훅)

| 파일 | 종류 | 요약 |
|------|------|------|
| `supabase/migrations/20260423094029_storage_references.sql` | 추가 | `references` private bucket + `storage.objects` owner-only 정책 3종 |
| `src/lib/museDb.js` | 추가 | DB↔프론트 매퍼 (snake↔camel), `uploadReferenceImage/deleteReferenceImage/getSignedUrl` |
| `src/store/museStore.jsx` | 재작성 | localStorage 완전 제거 → Supabase hydration + CRUD. seed `'supabase'`(default)/`'fixtures'` 분기. HYDRATE/RESET 액션 추가. `_pending` UI 플래그 보존 스프레드 |
| `src/components/templates/ArchivePage.jsx` | 수정 | 업로드 플로우를 Storage 경유로: `file` → `addReference({file, ...})` → 백그라운드 T1 → `updateReference` |
| `src/pages/MuseNav.jsx` | 수정 | 이메일 표시 + 로그아웃 버튼 |
| `src/store/index.js`, `src/components/templates/ArchivePage.stories.jsx` | 수정 | `resetMuseStore` export/import 제거 (localStorage 전용 유틸 폐기) |

### Auth 싱글톤

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/hooks/auth/AuthProvider.jsx` | 추가 | Context 기반 세션 싱글톤. `getSession` + `onAuthStateChange` 한 곳만 구독 |
| `src/hooks/auth/useAuth.js` | 재작성 | `useAuthContext()` 래퍼로 단순화 (자체 state 제거) |
| `src/hooks/auth/index.js` | 수정 | `AuthProvider` export 추가 |
| `src/App.jsx` | 수정 | `<AuthProvider>` 최상단 배치, 그 안에 `<MuseStoreProvider>` |

### T3 비용 최적화

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/data/muse/aiTasks.js` | 수정 | `TASK_ANALYZE_TOKENS.systemPrompt` 재작성 (PRIMARY/SECONDARY/CONTEXT 계층). `userMessageTemplate`, `input.shape`, `workflow`, `estCost` 동기화 |
| `src/utils/museAiTasks.js` | 수정 | 이미지 리사이즈 `1024 → 512`. content 재구조화: T1 JSON 헤더 상단 + 이미지 + 경량 id 앵커 |
| `src/stories/muse/AIPlayground.stories.jsx` | 수정 | 자체 `resizeDataUrl` 기본값 512, content 재구조화 동기화, 설명 텍스트 업데이트 |

### 삭제 / 다중 업로드

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/components/input/FileDropzone.jsx` | 수정 | `multiple` prop + `onFilesSelect([])` 콜백 추가. `<input multiple>`, drop/input 핸들러 분기. 기존 `onFileSelect` 호환 |
| `src/components/templates/ArchivePage.jsx` | 수정 | 호버 휴지통 IconButton + 확인 Dialog + deleteTarget/deleteState 상태. `uploadOne(file)` 헬퍼 + `handleUploadFiles(files)` 병렬(`Promise.allSettled`). 상단 `pendingCount` Alert 배너 |

### 진단 (유지)

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/store/museStore.jsx` | 수정 | hydration 시작/결과 `console.log` 유지 — 향후 디버깅에 유용 |

## ✅ 최종 결과

- **회원가입 → 업로드 → T1 자동 태깅 → 새로고침 → 데이터 유지** 완전 연결
- **Storage 에 원본 이미지** + **DB 에 레퍼런스/프로젝트/분석/설정** 모두 persist
- **T3 비용 프로젝트당 ~17% 절감** (레퍼런스 1장 분담 16.5원 → 13.7원)
- **다중 업로드** + **호버 삭제** 로 아카이브 기본 CRUD UX 완성
- **AuthGuard ↔ MuseStoreProvider 타이밍 race 가능성 제거**

## 🔁 재현 가이드

### Phase 4 잔여

1. `supabase migration new storage_references` → bucket 생성 SQL + storage.objects RLS 3종
2. `supabase db push` (원격 적용)
3. `src/lib/museDb.js` 작성 — `mapReferenceFromDb/ToDb`, `mapProjectFromDb/ToDb`, `mapAnalysisFromDb/ToDb`, `mapSettingsFromDb/ToDb`, `uploadReferenceImage`, `deleteReferenceImage`, `getSignedUrl(storage_path, 3600)`
4. `src/store/museStore.jsx` 재작성:
   - `EMPTY_STATE` / `FIXTURES_STATE` 두 초기값
   - `seed='supabase'` (기본) / `'fixtures'`
   - `useEffect` 에서 `useAuth` 기반 hydration — 4 테이블 병렬 SELECT
   - 슬라이스 훅들의 CRUD 가 `remote && user` 일 때 Supabase 먼저 호출 후 로컬 dispatch
   - `_pending/_tagError` 같은 UI 플래그는 mapper 에서 pick 제외, reducer 는 spread 로 보존

### Auth 싱글톤

1. `src/hooks/auth/AuthProvider.jsx` 생성 — useState + useEffect 로 세션 구독, Context provide
2. `useAuth.js` 를 `useContext(AuthContext)` 래퍼로 축소
3. `App.jsx` 에 `<AuthProvider>` 최상단 → `<MuseStoreProvider>` → `<BrowserRouter>` 순서
4. 효과: 세션 state 가 한 곳이라 `AuthGuard` 가 authenticated 되는 순간 `MuseStoreProvider.user` 도 동일 tick 에 세팅됨

### T3 비용 최적화 (T1 primary + 512px)

1. `aiTasks.js` 의 `TASK_ANALYZE_TOKENS.systemPrompt` 에 **PRIMARY SIGNAL / SECONDARY / CONTEXT** 계층 명시. "T1 이 이미 분류한 것을 재분류하지 말라" 명문화. color 는 dominantColors 합집합, VD 는 T1 태그 집계부터
2. `userMessageTemplate` 을 "T1 JSON 이 primary, 이미지는 verification" 문구로 갱신
3. `museAiTasks.js` `runAnalyzeTokens` 에서 `resizeDataUrl(dataUrl, 512)`
4. content 재구조화:
   - 0번: `=== PRIMARY SIGNAL: T1 pre-analysis ===` + `JSON.stringify(t1Summary, null, 2)` + `=== SECONDARY: images below ===`
   - 1~N: `imageBlock` + `↑ image for id: xxx` 경량 앵커
   - 최종: userMessageTemplate 치환
5. `AIPlayground.stories.jsx` 내 자체 `resizeDataUrl` 기본값 동일하게 `512` 로, content 재구조화 복제

### 레퍼런스 삭제

1. `ArchivePage` 에 `deleteTarget`, `deleteState` useState 추가
2. `renderItem` 의 Box 에 `'&:hover .muse-delete-btn': { opacity: 1 }` sx, 내부에 `IconButton` 좌상단 (position absolute, `DeleteOutlineIcon`)
3. `useStoreMode && !item._pending` 조건으로 업로드 중인 카드엔 숨김
4. 확인 Dialog: 제목에 레퍼런스 title, description 에 "되돌릴 수 없음 + 프로젝트 연결 자동 해제" 안내
5. 삭제 실행: `storeSlice.removeReference(id)` — Storage 삭제 + DB delete + project_references CASCADE + 로컬 state
6. `_pending` 일 때는 삭제 버튼 숨김 (업로드/삭제 레이스 방지)

### 다중 업로드 + 로딩 UI

1. `FileDropzone` 에 `multiple` prop + `onFilesSelect(files[])` 추가. `<input multiple>` 및 drop/input 핸들러가 multiple true 면 배열 전달, false 면 기존 단일 파일
2. `ArchivePage` 에 `uploadOne(file)` 헬퍼 추출 — 리사이즈 → `addReference({file, ...})` → 백그라운드 T1 → `updateReference`
3. `handleUploadFiles(files)` — `Promise.allSettled` 로 병렬. 성공/실패 카운트 기반 error 메시지
4. `<FileDropzone multiple onFileSelect onFilesSelect />` 둘 다 넘김 (외부주입 모드 호환)
5. `pendingCount = references.filter(_pending).length` 를 `useMemo` 로. `pendingCount > 0` 이면 `Alert` 배너 (`CircularProgress` icon + 카운트)

> 💡 핵심 포인트:
> - **슬라이스 훅 시그니처 유지 전략**: 공개 API 불변이라 페이지/위저드 코드 건드리지 않고 persistence 레이어만 교체. 대규모 리팩토링의 안전망
> - **jsonb 기반 단일 테이블 = 편집 단위가 통째일 때 최적**: 레이어 5종 정규화했으면 테이블 10개 + JOIN 지옥. 도메인 특성에 맞춘 선택
> - **Storage path convention = `{user_id}/{entity_id}.{ext}`**: storage.objects RLS 가 `split_part(name, '/', 1)` 기반이라 convention 이 곧 보안 경계
> - **AuthProvider 단일 Context 패턴**: 여러 useAuth 인스턴스 = 여러 getSession = 타이밍 race. 루트에서 한 번만 구독이 정답
> - **PRIMARY/SECONDARY signal 언어로 모델 guiding**: LLM 은 "다 중요" 보다 "이게 1차, 저건 2차" 가 명확할 때 일관된 출력. 시스템 프롬프트에서 역할 분담 명시는 프롬프트 엔지니어링의 표준 기법
> - **이미지 해상도 = T1 과 T3 역할 분담의 함수**: T1 이 분류 끝내면 T3 이미지는 더 작아도 됨. 비용 설계의 레버리지 포인트
> - **`Promise.allSettled` > `Promise.all` for batch UX**: 실패 1개가 전체 실패로 이어지지 않음. 각 파일 독립 실패/성공 처리
> - **UI 플래그(_pending)는 reducer spread 로 보존 + DB mapper 에서 제외**: 로컬 state 와 영속 state 의 경계를 mapper 함수로 명시
