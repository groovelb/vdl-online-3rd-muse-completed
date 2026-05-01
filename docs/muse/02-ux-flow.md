# MUSE. UX Flow

> **문서 성격**: 프로젝트 초반 가이드. "이 프로젝트에서 어떤 데이터를 어떻게 다루는지" 처음 이해하는 단계.
> **데이터 모델 활용**: 본 문서 § 데이터 모델 활용이 단일 진실 원천. 컬럼·SQL·제약은 `appendix-db-schema.md` (`/supabase-integration` 산출).
> **부록**: 컴포넌트별 상세 → [appendix-screen-component-map.md](./appendix-screen-component-map.md).

## 유저 시나리오

### 시나리오 1. 레퍼런스 수시 아카이빙

- **사용자**: 디자이너 / 바이브 코딩 유저
- **목표**: 영감 이미지를 모아두고 자동 태깅된 상태로 보관
- **흐름**: Archive 진입 → 드래그앤드롭/URL 로 업로드 → AI 가 자동 태깅 → 그리드에 추가
- **다루는 데이터**: `Reference` (W, 업로드)

### 시나리오 2. 프로젝트 생성 (5-step 위자드)

- **사용자**: 디자이너 / PM / 엔지니어
- **목표**: 모드·의도·레퍼런스·활용 노트로 좁혀가며 디자인 결정. "내가 단계마다 결정했다"
- **흐름**: ProjectCreate 진입 → 모드 선택 → 의도 입력 → 레퍼런스 + layer chip 큐레이션 → 활용 노트 작성 → AI 분석
- **다루는 데이터**: `Project` (W, 생성), `ProjectReference` (W, chip 토글), `AnalysisResult` (W, 분석), `Reference` (R)

### 시나리오 3. 토큰 확인 + 결정 추적

- **사용자**: 디자이너 / 엔지니어
- **목표**: AI 가 만든 토큰의 출처·이유를 검증하고 의도에 맞게 다듬기
- **흐름**: ProjectDetail 진입 → 레이어 탭 전환 → 토큰 카드 펼침 (출처 + 이유 + 노트 + 탈락 후보) → on/off + emphasis 편집
- **다루는 데이터**: `AnalysisResult` (R, 편집은 D), `Reference` (R)

### 시나리오 4. 모드별 Export

- **사용자**: 바이브 코딩 유저 / 디자인 시스템 엔지니어
- **목표**: 토큰 + 결정 로그를 외부 도구로 가져가기
- **흐름**: ProjectDetail Export → 모드별 default 산출물 자동 선택 → 복사 / 다운로드 / ZIP 번들
- **다루는 데이터**: `AnalysisResult` (R), `Project` (R), `Reference` (R)

## 데이터 모델

#### 📦 레퍼런스 `Reference`

> 사용자가 모은 영감 이미지. 자동 태깅으로 색·타이포·레이아웃 정보가 함께 보관됨.

- **보이는 페이지**: Archive, ProjectCreate, ProjectDetail
- **만드는 사람**: 사용자
- **만드는 곳**: Archive

#### 📦 프로젝트 `Project`

> 의도와 모드, 레퍼런스 큐레이션을 묶는 단위. 5-step 위자드의 산출물.

- **보이는 페이지**: ProjectList, ProjectCreate, ProjectDetail
- **만드는 사람**: 사용자
- **만드는 곳**: ProjectCreate

#### 📦 프로젝트-레퍼런스 매핑 `ProjectReference`

> 한 프로젝트가 어떤 레퍼런스를 어떤 레이어 (색·타이포·레이아웃 등) 로 활용할지 표시.

- **보이는 페이지**: ProjectCreate, ProjectDetail
- **만드는 사람**: 사용자
- **만드는 곳**: ProjectCreate

#### 📦 분석 결과 `AnalysisResult`

> AI 가 만든 디자인 토큰 묶음. 각 토큰의 출처·이유·탈락 후보 동봉.

- **보이는 페이지**: ProjectDetail
- **만드는 사람**: AI
- **만드는 곳**: ProjectCreate

#### 📦 사용자 설정 `UserSettings`

> 사용자별 AI 모델 / 스토리지 / 테마 설정. 사용자당 1 row.

- **보이는 페이지**: Settings
- **만드는 사람**: 시스템
- **만드는 곳**: Settings

#### 📦 사용자 `User`

> 가입한 사용자. 모든 데이터의 소유자.

- **보이는 페이지**: Auth, GNB
- **만드는 사람**: 사용자
- **만드는 곳**: Auth

## UX-flow

> 위 시나리오를 데이터 관점에서 단계별로 쪼갠 서사. 각 단계의 페이지·사용자 행동·발생 데이터·결과.

### 시나리오 1 단계별. 레퍼런스 아카이빙

1. **Archive 진입** (Archive)
   - 사용자 행동: 영감 이미지 그리드를 둘러본다
   - 발생하는 데이터: `Reference` R (기존 그리드 표시)
   - 결과: 업로드 영역 (드래그앤드롭 / URL 입력) 노출

2. **이미지 업로드** (Archive)
   - 사용자 행동: 이미지를 드래그앤드롭하거나 URL 을 붙여넣는다
   - 발생하는 데이터: `Reference` W (썸네일·소스 URL 보관)
   - 결과: 그리드에 빈 카드 즉시 추가, 자동 태깅 시작

3. **자동 태깅** (Archive)
   - 사용자 행동: (대기) 카드의 태그 배지·대표 색상이 비동기로 채워짐
   - 발생하는 데이터: `Reference` D (태그·색·타이포·레이아웃 정보 보강)
   - 결과: 카드 완성. 검색·필터에서 발견 가능해짐

### 시나리오 2 단계별. 프로젝트 생성 5-step

1. **모드 선택 (Step 0)** (ProjectCreate)
   - 사용자 행동: concept / system 카드 중 하나 선택
   - 발생하는 데이터: `Project` W (mode 필드 저장)
   - 결과: 다음 step 의 가이드·minLength 분기

2. **제목 + 의도 (Step 1)** (ProjectCreate)
   - 사용자 행동: 프로젝트명 + 한 줄 의도 입력
   - 발생하는 데이터: `Project` W (name + intent 필드)
   - 결과: AI 가 의도 기반 레퍼런스 추천 시작

3. **레퍼런스 + layer chip (Step 2)** (ProjectCreate)
   - 사용자 행동: 추천 레퍼런스에서 골라 카드별 layer chip (색·타이포·레이아웃) 토글
   - 발생하는 데이터: `Reference` R (선택), `ProjectReference` W (id + useLayers 매핑)
   - 결과: 큐레이션 완료. 다음 step 의 가이드 표시

4. **활용 노트 (Step 3)** (ProjectCreate)
   - 사용자 행동: 레퍼런스 본 후 활용 지점을 자유 텍스트로 명시
   - 발생하는 데이터: `Project` D (userNotes 필드 추가)
   - 결과: [분석 시작] 버튼 활성화

5. **AI 분석 (Step 4)** (ProjectCreate)
   - 사용자 행동: 분석 시작 클릭 후 진행 인디케이터 관찰
   - 발생하는 데이터: `AnalysisResult` W (4~8축 토큰 + 출처 + 이유 + 탈락 후보)
   - 결과: ProjectDetail 로 자동 이동

### 시나리오 3 단계별. 토큰 확인 + 결정 추적

1. **ProjectDetail 진입** (ProjectDetail)
   - 사용자 행동: 프로젝트 카드 클릭
   - 발생하는 데이터: `Project` R, `AnalysisResult` R, `Reference` R (사용된 ref strip)
   - 결과: 레이어 탭 (색·타이포·레이아웃·그라디언트·비주얼 디렉션) 노출

2. **토큰 카드 펼침** (ProjectDetail)
   - 사용자 행동: 토큰 카드의 ❓ 인디케이터 클릭
   - 발생하는 데이터: `AnalysisResult` R (decisionRationale 인용)
   - 결과: 출처 ref + 의도 매칭 + 사용자 노트 적용 표시 + 탈락 후보 표시

3. **on/off + emphasis 편집** (ProjectDetail)
   - 사용자 행동: 불필요 토큰 토글 off, 중요 토큰 emphasis 상승
   - 발생하는 데이터: `AnalysisResult` D (isEnabled / emphasis 필드)
   - 결과: 실시간 프리뷰 갱신

### 시나리오 4 단계별. Export

1. **Export 클릭** (ProjectDetail)
   - 사용자 행동: 우상단 Export 버튼 클릭
   - 발생하는 데이터: `Project` R (mode 확인), `AnalysisResult` R (전체 토큰)
   - 결과: 모드별 default 산출물 다이얼로그

2. **모드별 산출물 선택** (ProjectDetail)
   - 사용자 행동: concept = conceptPrompt + 이미지 ZIP / system = ZIP 번들 (DESIGN.md + DTCG + decision-trace + refs) 중 default 확인
   - 발생하는 데이터: `Reference` R (refs 이미지 묶기)
   - 결과: 복사 / 다운로드 / ZIP 번들 완성

## 페이지 리스트

| 페이지 | 경로 | 한 줄 설명 | 다루는 데이터 |
|---|---|---|---|
| Auth | `/auth` | 가입 / 로그인 | User |
| Archive | `/` | 레퍼런스 그리드 + 업로드 + 검색·필터 | Reference |
| ProjectList | `/projects` | 프로젝트 카드 목록 | Project |
| ProjectCreate | `/projects/new` | 5-step 위자드 (모드 → 의도 → 레퍼런스 → 활용 노트 → 분석) | Project, ProjectReference, AnalysisResult, Reference |
| ProjectDetail | `/projects/:id` | 레이어 탭 + 토큰 편집 + Export | AnalysisResult, Reference, Project |
| Settings | `/settings` | AI 모델 / 스토리지 / 테마 | UserSettings |

## 데이터 모델 활용

> 이 표는 `/supabase-integration` 의 유일한 입력. 데이터명 ↔ 테이블명 1:1 매핑은 변경 시 반드시 이 표를 먼저 갱신.

| 데이터명 | 한국어 | 코드 식별자 | 예상 테이블명 | 생성 책임 페이지 |
|---|---|---|---|---|
| `Reference` | 레퍼런스 | `reference` | `reference_items` | Archive |
| `Project` | 프로젝트 | `project` | `projects` | ProjectCreate |
| `ProjectReference` | 프로젝트-레퍼런스 매핑 | `projectReference` | `project_references` | ProjectCreate |
| `AnalysisResult` | 분석 결과 | `analysisResult` | `analysis_results` | ProjectCreate |
| `UserSettings` | 사용자 설정 | `userSettings` | `user_settings` | Settings |
| `User` | 사용자 | `user` | `auth.users` (Supabase 내장) | Auth |

## 컴포넌트 리스트

> 신규 컴포넌트만 본문. 기존 디자인 시스템에 없어 새로 만들어야 할 것. 재활용/수정 컴포넌트는 [appendix-screen-component-map.md](./appendix-screen-component-map.md) 부록.

| 컴포넌트 | 카테고리 | 한 줄 용도 |
|---|---|---|
| `ProjectCreateWizard` | templates | 5-step 위자드 셸 (Step 0~4) |
| `ReferencePicker` | templates | 추천 + 아카이브 다중 선택 패널 |
| `AnalysisProgress` | overlay-feedback | 분석 진행 인디케이터 (레이어별 단계) |
| `ThemeExportDialog` | overlay-feedback | 모드별 Export 다이얼로그 |
| `TokenListItem` | data-display | 토큰 행 (on/off + emphasis 슬라이더) |
| `ColorSwatchList` | data-display | 컬러 토큰 스와치 + HEX + 토글 |
| `TypographyPreview` | data-display | 타이포 샘플 텍스트 + 속성 |
| `LayoutTokenPreview` | data-display | 그리드/스페이싱 다이어그램 |
| `GradientPreview` | data-display | 그라디언트 토큰 스와치 |
| `TokenDecisionTracePanel` | data-display | 토큰 출처·이유·탈락 후보 펼침 |
| `DesignMdPreview` | data-display | DESIGN.md alpha spec 결과 화면 |
| `LoginForm` | input | 이메일 + 비밀번호 입력 |
| `SignUpForm` | input | 회원가입 입력 |
| `AuthGuard` | layout | 로그인 가드 라우트 |

## 참조

- [01-project-summary.md](./01-project-summary.md). 페인포인트 → 기능 매핑
- [appendix-screen-component-map.md](./appendix-screen-component-map.md). 화면 ↔ 컴포넌트 상세 (재활용/수정/신규 전체)
- [docs/research/04-ux-intervention-roadmap.md](../research/04-ux-intervention-roadmap.md). 입력 지점 구현 명세
