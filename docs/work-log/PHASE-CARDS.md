# MUSE Phase Cards (재현 가이드)

실습 교육생이 Phase 진입 전에 읽는 카드. 각 카드는 4블록: **진입조건 / 핵심결정 / 산출물 / 검증기준**.

> 짝 문서: [ANALYSIS.md](./ANALYSIS.md) · [REPRODUCE-FAQ.md](./REPRODUCE-FAQ.md)

24개 로그를 10개 Phase로 묶었다.

---

## Phase 1 — 기획 (log 001-003)

### 진입조건
- 제품 아이디어 한 문장 정리됨
- `docs/muse/` 디렉토리 생성 가능

### 핵심결정
1. **MVP 스코프**: 필수 6 + 선택 2, 제외 범위(코드 생성·협업·모바일) 문서화
2. **UX 2축**: 토큰 on/off + emphasis(0-2) — 삭제가 아닌 비활성화 기반
3. **비주얼 디렉션**: Primary `#14132B` (이미지 퍼스트), 배경 `#FCFCFF`, Card radius 24px 통일, elevation 최소

### 산출물
- `docs/muse/01-project-summary.md`
- `docs/muse/02-ux-flow.md` — 4 시나리오 Mermaid + IA + 컴포넌트 7그룹
- `docs/muse/03-visual-direction.md` — 변경 필드 요약 테이블

### 검증기준
- [ ] 각 Phase 끝에 "확인 포인트 N개" 응답 → 승인 게이트
- [ ] 제외 범위 명시됨 (스코프 크립 차단)
- [ ] Primary 색상이 이미지 인식을 방해하지 않는 톤

---

## Phase 2 — 디자인 토큰 (log 004)

### 진입조건
- Phase 1 visual-direction 승인 완료
- `src/styles/themes/default.js` 존재

### 핵심결정
1. **단일 파일 관리**: `default.js`만 수정, 별도 JSON 생성 금지
2. **전역 `shape.borderRadius: 0` 유지 + 컴포넌트 오버라이드로만 확장** (Button/Chip=999px, Card/Dialog=24px)
3. **MUI grey 스케일 전면 교체** (커스텀 바이올렛 틴트 10단계)
4. **`info` 슬롯 = 바이올렛 `#4F46E5`** (기존 컴포넌트 호환성)

### 산출물
- `src/styles/themes/default.js` 수정본
- Storybook `Colors.stories.jsx` MUI 원시 import 제거

### 검증기준
- [ ] Storybook 토큰 페이지가 MUSE 색으로 렌더됨
- [ ] 기존 컴포넌트(Card/Dialog/Button)가 설계된 radius로 표시됨

---

## Phase 3 — 컴포넌트·템플릿 조립 (log 005-007)

### 진입조건
- Phase 2 토큰 적용 완료
- ux-flow 컴포넌트 리스트 확정

### 핵심결정
1. **Phase 1→5 의존순 구현** (primitive→복합template). 역순 불가
2. **`TokenListItem` = slot primitive** (preview 슬롯 주입으로 4 레이어 반복 최소화)
3. **`InfiniteMasonry` sentinel은 Masonry 바깥** (CSS columns 영향 회피)
4. **`ProjectCreateWizard` = useReducer + 경계 콜백** (AI 연동은 외부 교체)
5. **ArchivePage = 풀 조립, ProjectDetailPage = SplitScreen 60:40**
6. **ProjectListPage: MoodboardCard 재활용** (API 확장 금지, 호출측 어댑터)

### 산출물
- 신규 컴포넌트 12종 + ImageCard 확장
- 템플릿 4종 (Archive/ProjectDetail/ProjectList/Settings)
- 각 컴포넌트 `.stories.jsx`

### 검증기준
- [ ] 모든 컴포넌트 Storybook에서 단독 렌더됨
- [ ] 템플릿이 Storybook fixture로 풀 렌더됨
- [ ] IA 5개 엔트리(archive/projects/new/detail/settings) 전부 페이지 존재

---

## Phase 4 — 데이터 중앙화 (log 008-010)

### 진입조건
- 컴포넌트·템플릿 완성, 각자 로컬 더미로 렌더 중

### 핵심결정
1. **`src/data/muse/` 전용 폴더**로 데이터 집중
2. **`schemas.js` JSDoc typedef = 단일 진실 원천** (이후 모든 문서는 참조만)
3. **결정적 생성 패턴** `i*prime%range`로 더미 27건
4. **Project 썸네일 = Reference에서 파생** (이미지 교체 시 자동 전파)
5. **Vite 정적 import** (경로 문자열 대신, 빌드 시 누락 감지)
6. **공통 컴포넌트 API 확장 금지** → 호출측 어댑터로 해결(010)

### 산출물
- `src/data/muse/{schemas, references, projects, analysisResults, userSettings, index}.js`
- 실 이미지 28장 연결 (reference1 삭제 후 27건 최종)
- Storybook 카탈로그 4종

### 검증기준
- [ ] 스토리 파일에 인라인 더미 배열이 남아있지 않음
- [ ] Reference 썸네일 1건 교체 → Project 썸네일 자동 반영
- [ ] 카탈로그 스토리가 스키마 + 실데이터 병기

---

## Phase 5 — AI 통합 (log 011-014)

### 진입조건
- 데이터 중앙화 완료
- Anthropic API 키 발급

### 핵심결정
1. **`aiTasks.js` 단일 진실 원천** (프롬프트·tool스키마·품질축·골든예시 통합)
2. **API 키는 `.env.local` + loadEnv Node측만** — `VITE_` 접두어 **절대 금지**
3. **Vite 플러그인 = `mergeConfig` + 반환 함수 패턴**
4. **Tool use 강제** (`tool_choice: { type: 'tool', name }`)
5. **프리셋 재설계는 012(계획) → 013(실행) 순** — 동시 진행 금지
6. **keyVisual 제거 + visualDirection 도입** — 레이어 개수(5) 보존, 마지막만 이미지→Markdown
7. **`Reference.tags` flat → 중첩**, `flattenTags()` 어댑터로 기존 코드 호환
8. **T1 tool schema 레이어별 enum 강제** (visualDirection은 중첩 서브카테고리)
9. **T3 = `tool_choice: { type: 'any' }` + 2 tool** (하나만 와도 partial 렌더)

### 산출물
- `src/data/muse/aiTasks.js`
- `.storybook/museApiPlugin.js`, `src/utils/museAi.js`
- `src/data/muse/tag/index.js` (프리셋 소비 단일창구)
- `AIPlayground.stories.jsx` (T1/T2/T3 end-to-end)

### 검증기준
- [ ] Storybook에서 T1 클릭 → 실 이미지 업로드 → 태그 반환
- [ ] T2 클릭 → 추천 referenceIds 반환
- [ ] T3 클릭 → 토큰 + visualDirection markdown 반환
- [ ] 네트워크 탭에 API 키 노출 없음

---

## Phase 6 — 상태관리 (log 015)

### 진입조건
- AI Playground 동작 확인
- ArchivePage가 로컬 state로만 동작 중

### 핵심결정
1. **Zustand 등 신 의존성 배제** (향후 DB 고려 시 오버헤드)
2. **Context + useReducer** + localStorage persist
3. **슬라이스 훅 분리** (`useReferencesSlice` 등, re-render 최소화)
4. **`STORAGE_KEY = 'muse_store_v3'` 버전 suffix** (스키마 변경 시 자동 무효화)
5. **ArchivePage `useStoreMode` prop** — 듀얼 모드로 Storybook 호환 유지
6. **업로드 flow: Pending → T1 → Patch** (2초 이내 썸네일 노출)

### 산출물
- `src/store/museStore.jsx`
- ArchivePage 실제 업로드→T1 연결

### 검증기준
- [ ] 새로고침 후 업로드 기록 유지
- [ ] T1 실패해도 Reference 항목은 유지 (_tagError 플래그)
- [ ] Storybook ArchivePage는 fixture 모드로 계속 동작

---

## Phase 7 — 라우팅·Export (log 016-017)

### 진입조건
- 상태관리 완료
- React Router v7 설치

### 핵심결정
1. **stateless 템플릿 vs `*Route.jsx` 컨테이너 분리** (Storybook↔프로덕션 양립)
2. **5 라우트**: `/archive`, `/projects`, `/projects/new`, `/projects/:id`, `/settings`
3. **Wizard `recommendedLoader` prop**로 T2 자동 호출
4. **범용 JSON** = MUI 식별자 제거, hex/CSS value만
5. **ZIP 번들**: README 자동 생성 + muse.json + VD.md + 이미지
6. **seed 분기**: 기본 `'empty'`, Storybook만 `'fixtures'`
7. **`STORAGE_KEY` v3→v4 bump** (구버전 자동 무효화)

### 산출물
- `src/pages/{*Route}.jsx` 5개
- `src/utils/museExport.js`
- `src/components/overlay-feedback/ThemeExportDialog.jsx` 업데이트

### 검증기준
- [ ] Dev 서버에서 모든 경로 접근 가능
- [ ] Wizard Step2 진입 시 T2 자동 호출
- [ ] Export ZIP에 README 포함, JSON에 MUI 식별자 없음
- [ ] Dev 초기 진입 = 빈 상태 (온보딩 flow 체험 가능)

---

## Phase 8 — Supabase 백엔드 (log 018-020)

### 진입조건
- 로컬 기능 전부 동작
- Supabase 프로젝트 생성, CLI 설치

### 핵심결정
1. **데이터 모델 단일 진실 원천 = `schemas.js`** (문서 불일치 먼저 해소)
2. **jsonb 채택** (편집=통째, 검색=단순 containment)
3. **RLS owner-only** (단일 사용자 계정)
4. **테이블명 `reference_items`** (PostgreSQL `references` 예약어 회피)
5. **3 마이그레이션 분리** (스키마 / 인증 트리거 / RLS 정책 — 재현 용이)
6. **`handle_new_user` 트리거**: profiles + user_settings 동시 생성
7. **`AuthProvider` 싱글톤** (race 제거)
8. **Storage 경로 `{user_id}/{reference_id}.{ext}`** (RLS 기반 보안)
9. **UI 플래그(`_pending`)는 매퍼에서 제외** (DB 저장 금지)
10. **T3 이미지 512px 리사이즈** (~17% 절감)
11. **슬라이스 훅 공개 API 불변** (내부만 Supabase 전환)
12. **`STORAGE_KEY` v4→v5 bump**

### 산출물
- `supabase/migrations/*.sql` × 3
- `src/lib/{supabase, museDb}.js`
- `src/hooks/auth/AuthProvider.jsx`
- `src/pages/auth/AuthPage.jsx`

### 검증기준
- [ ] 회원가입 → 이메일 인증 → 로그인 플로우 성공
- [ ] 업로드 시 Supabase Storage에 파일 저장, DB에 row 생성
- [ ] 다른 사용자 계정에서 데이터 조회 불가 (RLS)
- [ ] 슬라이스 훅 시그니처가 Phase 6과 동일

---

## Phase 9 — 필터·디자인 QA (log 021-022)

### 진입조건
- 백엔드 통합 완료
- 실사용 피드백 수집됨

### 핵심결정
1. **ImageCard `dominantColors` prop** (14px 원형 스와치, 상위 5개)
2. **필터 3단 계층** — SuperSection(label + borderLeft) / SubRow(caption + chips)
3. **색상 필터 = hex swatch 26px** — 빈도 집계 상위 40개
4. **필터 조합**: swatch OR + 태그 AND + 두 필터 간 AND
5. **테마 전역 `elevation: 0`** (MuiPaper/Button/IconButton 등)
6. **hover = 색/opacity만, 위치 이동 금지**
7. **HSL 유사도**: hue≤30°, sat≤0.35, light≤0.28 + neutral 저채도 예외
8. **라벨 제거 → placeholder 전수 전환**
9. **GNB 재구성**: 좌 로고+nav / 우 Avatar dropdown
10. **앰비언트 배경 = multi-radial + linear 3-layer**

### 산출물
- `src/utils/colorSimilarity.js`
- `src/pages/{MuseNav, UserMenu}.jsx`
- ImageCard/ArchivePage/테마 수정

### 검증기준
- [ ] 필터 3단 계층 시각적 구분 명확
- [ ] 색상 swatch 클릭 시 유사색 포함 필터링
- [ ] 모든 버튼/Input/Card에 elevation 없음, hover 위치 고정

---

## Phase 10 — 아키텍처 최적화·안정화 (log 023-024)

### 진입조건
- 실사용 시 T3 비용 체감됨
- 다중업로드/race 버그 재현됨

### 핵심결정
1. **T1 재정의**: 분류 + **extraction**(palette/typography/layout/gradient per-image) 2역할
2. **T3 재정의**: PRIMARY(T1 JSON pool) / SECONDARY(512px) / CONTEXT(intent). **이미지 재분석 금지**
3. **Sonnet → Haiku 통일** (tool schema 확장 리스크 실측 확인)
4. **비용 ~2.5배 절감** (19원 → 7~8원/레퍼런스)
5. **기존 데이터 truncate** (테스트 단계, 마이그레이션에 포함)
6. **Fixture mock extracted 결정적 생성** (Storybook = production 동일)
7. **async 콜백 = Supabase 왕복 후에만 dispatch** (race fix)
8. **`runWithConcurrency(3)`** — Promise.all 금지
9. **재시도 정책**: addReference 500ms 1회, T1 exponential backoff(500→1500) 3회 + 수동 재시도 🔄
10. **에러 분류**: 429/5xx/network → retry / 4xx(≠429) → 포기
11. **자동 삭제 금지** — 사용자 선택권(재시도/삭제)

### 산출물
- `supabase/migrations/20260423115623_reference_extracted_and_compose.sql`
- `src/data/muse/aiTasks.js`, `src/utils/museAiTasks.js` 재작성
- `Reference.extracted` 필드 + 스토어/매퍼 업데이트

### 검증기준
- [ ] 업로드 1건당 T1 1회만 호출 (T3는 project 생성시 별도)
- [ ] 프로젝트 생성 시 이미지 첨부 없음, text-only compose
- [ ] 20건 동시 업로드 시 3개씩 처리됨
- [ ] T1 실패 카드에 🔄 버튼 표시, 재시도 시 재호출

---

## 부록 — Phase 진입 체크리스트 (한눈에)

| Phase | 시작 전 확인 | 끝난 후 검증 |
|---|---|---|
| 1 기획 | 아이디어 1줄 정리 | 3개 문서 승인 게이트 통과 |
| 2 토큰 | visual-direction 승인 | Storybook 색 렌더 일치 |
| 3 컴포넌트 | 토큰 적용됨 | Storybook 전 컴포넌트 렌더 |
| 4 데이터 | 템플릿 완성 | 스토리에 인라인 더미 0건 |
| 5 AI | 데이터 중앙화 | T1/T2/T3 Playground 동작 |
| 6 상태 | AI 동작 | 새로고침 후 상태 유지 |
| 7 라우팅 | 상태 동작 | 5 라우트 접근 가능 |
| 8 Supabase | 로컬 기능 완성 | RLS 격리 확인 |
| 9 QA | 실사용 피드백 | 필터·디자인 10항목 이행 |
| 10 최적화 | 비용/버그 확인 | 비용 실측 ~2.5× 절감, race 재현 0 |
