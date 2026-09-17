# MUSE: Visual Direction

> 이 문서가 결정하는 것: 정체성과 화면이 어떻게 보이는가
> 입력: 01 3절 정체성, 02 2.1절 페이지, 02 4절 원칙 · 출력 대상: theme.js, /component-work, /layout-composer, /visual-asset-prompt (넘기는 항목은 이 문서 6절 표)

## 결정 현황

이 표의 확정 항목만 다음 문서가 그대로 인용한다. 잠정은 `(잠정)` 표시를 달고 인용하고, 미정은 인용하지 않는다.

| 섹션 | 상태 | 비고 |
|---|---|---|
| 1. 무드 | 확정 | 원문 톤앤매너 기반 |
| 2. 레이아웃 전략 | 잠정 | 배정 미승인 (Q4) |
| 3.1 색 | 확정 | 테마 실제 값 |
| 3.2 타이포 | 확정 | 테마 실제 값 |
| 3.3 형태·표면·모션 | 확정 | 테마 실제 값 |
| 4. 이미지·에셋 방향 | 잠정 | 코드에서 역추출 |
| 4.1 레퍼런스 | 미정 | 제공 자료 없음 |
| 5. 변경 토큰 요약 | 확정 | 현재값은 스타터킷 |
| 6. 다음 문서로 넘기는 것 | 확정 | |

문서 상태: 잠정 승인 (하드 게이트 충족)
개정: 2026-09-17 v2 · 변경: 새 포맷으로 재구성 (교육 예제)

비고:

- **2절 잠정**: 아키타입 id는 `src/data/layoutTaxonomyData.js`의 목록에서 골랐고, 페이지별 배정과 콘텐츠 신호는 화면 코드에서 추론했다 (Q4).
- **3절 값 출처**: `src/styles/themes/default.js`(라이트)와 `src/styles/themes/dark.js`(다크)의 palette, typography, shape, customShadows, transitions, components다. 라이트와 다크가 다른 값은 셀 안에서 L과 D로 나눠 적었다.
- **4절 잠정**: 원문에 이미지·에셋 절이 없다. 랜딩과 데모가 쓰는 예시 이미지 19장, 더미 레퍼런스 26장, 아이콘 출처를 코드에서 확인해 채웠다.
- **5절 현재값 출처**: 스타터킷 `src/styles/themes/default.js`. 스타터킷이 정하지 않은 축은 "없음"으로 적었다.
- **원문에서 달라진 값**: 원문이 제안한 좌우 여백과 좌우 분할 비율은 코드에서 다른 값으로 구현됐다. 코드 값을 적고 원문 값은 2절 비고에 남겼다.
- **분량**: 232줄(권장 200). 가독성 규칙(비고 목록, 구분선)으로 늘었다. 4절 에셋별 방향을 부록으로 옮기면 줄일 수 있다.

---

## 1. 무드

- **키워드** (최대 5, 01 3.2절에서 파생): Image-First Neutral · Fluid Space · Low Density · Rounded Affordance · Tinted Near-Black
- **태도 선언** (최대 3): 화면은 뒤로 빠지고 레퍼런스 이미지가 앞에 선다. 완벽한 흰색도 순수한 검정도 쓰지 않고 한 축의 틴트로 모은다. 누를 수 있는 것은 둥글고 누를 수 없는 것은 각지다.
- **하지 않는 것** (최대 5): 튀는 강조색 · 방향이 있는 드롭섀도 · 대문자 버튼 · 고정 폭 중심 페이지 · 높은 정보 밀도

---

## 2. 레이아웃 전략

구조:

| 페이지 (02 2.1절) | 공간 모델 | 아키타입 | 구분 언어 |
|---|---|---|---|
| Auth | 유동 | narrative-scroll + full-bleed-hero (잠정, Q4) | 여백 |
| Archive | 유동 | masonry + sidebar-content (잠정, Q4) | 여백 |
| ProjectList | 유동 | uniform-card-grid (잠정, Q4) | 여백 |
| ProjectCreate | 혼합 | wizard-stepper + centered-form (잠정, Q4) | 여백 |
| ProjectDetail | 혼합 | split-view-master-detail (잠정, Q4) | 선 |
| Settings | 고정 | centered-form (잠정, Q4) | 선 |

콘텐츠 신호 (/layout-composer 입력):

| 페이지 | 밀도 | text / media / repeat / hierarchy |
|---|---|---|
| Auth | airy | short / dominant / many / two-tier |
| Archive | airy | micro / dominant / many / flat |
| ProjectList | airy | micro / balanced / few / flat |
| ProjectCreate | airy | short / balanced / many / two-tier |
| ProjectDetail | compact | mixed / balanced / many / two-tier |
| Settings | compact | short / none / few / flat |

- 공간 모델: 유동 / 고정 / 혼합. 아키타입: `src/data/layoutTaxonomyData.js`의 id. 구분 언어: 선 / 면 / 여백.
- Archive의 필터는 `sticky-header-sidebar`를 함께 쓴다. ProjectDetail의 좌우 비율은 `asymmetric-two-up`에 가깝다 (잠정, Q4).
- 전역 리듬: 폭은 두 모드뿐이다. 탐색과 열람 화면은 화면 전체를 쓰고 좌우 여백만 `clamp(16px, 2.5vw, 40px)`로 늘어난다(작은 화면은 16px). 설정 같은 폼 화면은 640px 안쪽으로 모은다. 브레이크포인트는 xs 0 / sm 600 / md 900 / lg 1200 / xl 1536이다. 섹션 사이 수직 간격은 화면 성격에 따라 갈린다. 랜딩 섹션은 작은 화면 80px, 큰 화면 144px이고 안쪽 화면은 32px에서 80px 사이다. 그리드 열 수는 폭에 따라 2에서 5까지 늘어난다.
- 원문이 제안한 좌우 여백 `clamp(24px, 4vw, 64px)`와 좌우 분할 40 대 60은 코드에서 각각 `clamp(16px, 2.5vw, 40px)`와 25 대 75로 구현됐다. 코드 값을 기준으로 적었다.
- 원문이 제안한 섹션 간 간격(큰 화면 96~120px, 작은 화면 64px)도 코드 값과 다르다. 위의 랜딩 80/144px와 안쪽 화면 32~80px가 실제 값이다.
- 원문이 제안한 나머지 간격 네 건은 이렇게 정리된다. 폼 최대 폭 720px는 코드 기본값으로 살아 있고(설정 화면은 640px로 좁힌다), 버튼 여백 16/28px는 32/10px와 36/14px로, 카드 패딩 24~32px와 요소 사이 간격 16/24/40px는 8px 그리드 위의 화면별 값으로 바뀌었다.

---

## 3. 토큰 방향

### 3.1 색 (역할 팔레트)

| 역할 | 이름 | 값 | MUI 토큰 | 근거 (01 3절) |
|---|---|---|---|---|
| 전경·브랜드 중심 | Ink Near-Black | L `#14132B` / D `#F3F3F6` | `primary.main`, `text.primary` | Restraint |
| 보조 액션 | Mid Neutral | L `#5A586E` / D `#97969E` | `secondary.main` | 계조만 다르게 |
| 지면 배경 | Tinted White | L `#FCFCFF` / D `#121118` | `background.default` | 흰검 회피 |
| 카드·패널 면 | Paper Tint | L `#F8F8FC` / D `#1D1C25` | `background.paper` | 한 단계 깊은 면 |
| 보조 텍스트 | Muted Violet Grey | L `#7A798E` / D `#97969E` | `text.secondary` | 낮은 대비 |
| 구분선 | Ink 저투명 | L 8% / D 10% | `divider` | 선은 약하게 |
| 중간 톤 | Tinted Grey 50~900 | L `#FAFAFD` ~ `#14132B` | `grey.*` | 틴트축 일관 |
| 유일한 악센트 | Indigo Accent | L `#4F46E5` / D `#6366F1` | `info.main` | 분석 중 강조 |

비고:

- L은 라이트, D는 다크 테마 값이다. 두 테마는 palette만 다르고 타이포·간격·모양·컴포넌트 설정은 같은 파일을 공유한다.
- 악센트는 `info` 자리에 올렸다. 상태 색 중 정보 색을 브랜드 악센트로 쓰고, 나머지 상태 색(error·warning·success)은 기본값을 유지한다.
- 다크 팔레트의 회색 스케일은 라이트의 역순이다. 50이 가장 어둡고 900이 가장 밝다.
- 액션 상태는 전경색을 저투명으로 깐다. 라이트는 hover 4% / selected 6% / focus 12%다.
- 라이트 회색 스케일의 실제 값은 `#FAFAFD`(50) · `#F3F3F9`(100) · `#E8E7F0`(200) · `#D6D5E0`(300) · `#B5B4C2`(400) · `#9493A3`(500) · `#7A798E`(600) · `#5A586E`(700) · `#3A384E`(800) · `#14132B`(900)이다.
- 순수한 검정 `#000000`은 팔레트 어디에도 없다. 가장 어두운 값이 `#14132B`이고, 흰색은 대비 글자색으로만 남는다.

### 3.2 타이포

| 역할 | 서체 | 방향 (웨이트·크기·자간·행간) | MUI variant |
|---|---|---|---|
| 디스플레이 | Outfit | 700, clamp(3rem, 6vw, 6rem), -0.02em | h1 |
| 섹션 타이틀 | Outfit | 600, clamp(2rem, 4vw, 3.5rem), -0.02em | h2 |
| 구간 제목 | Outfit | 700, clamp(1.875rem, 3.25vw, 2.625rem) | h3 |
| 소제목 | Outfit | 600 24px·20px, 500 18px, 행간 1.3~1.4 | h4, h5, h6 |
| 본문 | Pretendard Variable | 400, 16px·14px, 행간 1.7, 자간 0 | body1, body2 |
| 부제 | Pretendard Variable | 500, 18px·14px, 행간 1.5 | subtitle1, subtitle2 |
| 버튼 | Pretendard Variable | 500, 15px, 자간 0, 자연 케이스 | button |
| 캡션 | Pretendard Variable | 500, 12px, 자간 0.02em | caption |
| 오버라인 | Pretendard Variable | 500, 12px, 자간 0.08em, 대문자 | overline |

비고:

- 제목은 Outfit, 본문은 Pretendard Variable로 나눈 스타터킷 조합을 유지했다. 바꾼 것은 웨이트를 낮추고 큰 제목을 화면 폭에 따라 늘린 것이다.
- 유체 크기를 px로 환산하면 h1은 48px에서 96px, h2는 32px에서 56px, h3은 30px에서 42px이다. 테마 파일의 주석 값과 같다.

### 3.3 형태·표면·모션

| 축 | 방향 | 값 |
|---|---|---|
| 기본 radius | 누를 수 없는 면은 각지게 | `shape.borderRadius: 0` |
| 클리커블 radius | 누르는 것은 완전한 pill | Button·IconButton·Chip `999px` |
| 입력 radius | 큰 곡률, 글자 정렬은 유지 | Outlined·Filled Input `16px` |
| 면 radius | 부드러운 공간감 | Card·Dialog `24px` |
| elevation | 그림자를 걷어낸 평면 | Paper·Card·Dialog·AppBar 모두 none |
| 커스텀 그림자 | offset 0, blur만 | 12px 5% ~ 40px 10%, 색은 전경 틴트 |
| 버튼 여백 | 한 단계 넉넉하게 | 기본 32/10px, 큰 것 36/14px |
| 입력 여백 | 한 단계 넉넉하게 | 상하 16px, 좌우 18px |
| 간격 | 8px 그리드 유지 | `spacing: 8`, 브레이크포인트 기본값 |
| 전환 템포 | 짧고 눈에 띄지 않게 | 150~375ms, 버튼 색 전환 150ms |
| 이징 | 기본 곡선 유지 | easeInOut `cubic-bezier(0.4, 0, 0.2, 1)` |

비고:

- 그림자를 완전히 끈 것은 elevation 0~4 단계를 모두 none으로 덮었기 때문이다. 커스텀 그림자는 대시보드 표면 등 따로 부르는 곳에서만 쓴다.
- 라이트의 그림자 색은 `rgba(20, 19, 43, ...)`다. 순수한 검정을 쓰지 않는다는 원칙이 그림자에도 걸려 있다.
- 랜딩만 예외로 감속 스크롤을 쓴다. 1.2초 길이의 지수 감속이고 모달이 열리면 멈춘다.

---

## 4. 이미지·에셋 방향

| 에셋 유형 | 쓰이는 곳 | LOOK 키워드 (1~2) |
|---|---|---|
| 예시 레퍼런스 이미지 | Auth Hero·CTA, 데모 | curated design reference |
| 더미 레퍼런스 이미지 | 첫 화면 시드, 스토리 | curated design reference |
| 아이콘 | 전역 | outlined UI icon |

에셋별 방향 (에셋 유형마다 한 블록):

- **예시 레퍼런스 이미지**
  - FORMAT: 원본 비율 그대로, 강제 크롭 없음. 19장 한 벌
  - LOOK: curated design reference, 색이 뚜렷해 대표색이 잡히는 화면
  - SUBJECT: 실제 태그와 대표색이 붙어 있는 화면·그래픽 레퍼런스
  - 하지 않는 것: 비율 강제, 톤 보정, 브랜드 로고가 읽히는 컷
- **더미 레퍼런스 이미지**
  - FORMAT: 원본 비율 그대로, 파일명 규칙으로 교체 가능. 26장 한 벌
  - LOOK: curated design reference, 레이어별 태그가 고르게 퍼지는 폭
  - SUBJECT: 색·타이포·레이아웃·그라디언트가 서로 다른 화면
  - 하지 않는 것: 비슷한 톤만 모으기, 실제 사용자 자료 사용
- **아이콘**
  - FORMAT: 24px 기본, 선 굵기 400
  - LOOK: outlined UI icon
  - SUBJECT: 동작을 가리키는 아이콘만
  - 하지 않는 것: 장식용 일러스트, 채워진 아이콘과 섞어 쓰기

비고: 사용자가 올린 레퍼런스는 방향을 정하지 않는다. 사용자의 자료이고, 도구가 톤을 바꾸면 추출값이 흔들린다.

### 4.1 레퍼런스 (사용자 제공만)

미정: 사용자가 제공한 레퍼런스가 없다 (Q5). 원문도 "추후 매핑"으로 비워 두었다.

---

## 5. 변경 토큰 요약 (theme.js 입력)

| 토큰 경로 | 현재값 | 변경값 | 적용 대상 |
|---|---|---|---|
| `palette.primary.main` | `#0000FF` | `#14132B` | 버튼·링크·강조 |
| `palette.primary.light` / `.dark` | `#6666FF` / `#0000B2` | `#2D2B5A` / `#0A091A` | hover와 눌림 |
| `palette.secondary.main` | blueGrey 900 `#263238` | `#5A586E` | 보조 액션 |
| `palette.info.main` | `#0288d1` | `#4F46E5` | 악센트, 분석 중 |
| `palette.background.default` | `#FFFFFF` | `#FCFCFF` | 지면 |
| `palette.background.paper` | `#FFFFFF` | `#F8F8FC` | 카드와 패널 |
| `palette.text.primary` | 검정 87% | `#14132B` | 본문 |
| `palette.text.secondary` | 검정 60% | `#7A798E` | 보조 텍스트 |
| `palette.divider` | 검정 12% | 전경 틴트 8% | 모든 구분선 |
| `palette.grey.*` | MUI 기본 회색 | `#FAFAFD`(50) ~ `#14132B`(900) | 보조 톤 전체 |
| `palette.action.*` | 검정 기반 | 전경 틴트 기반 | hover·선택·비활성 |
| `typography.fontFamily` | Pretendard Variable | Pretendard Variable (유지) | 본문 |
| `typography.h1` | Outfit 900, 2.5rem | Outfit 700, clamp(3rem, 6vw, 6rem) | 큰 제목 |
| `typography.h2` | Outfit 900, 2rem | Outfit 600, clamp(2rem, 4vw, 3.5rem) | 섹션 제목 |
| `typography.h3~h6` | Outfit 800~600 | Outfit 700~500, 자간 조정 | 하위 제목 |
| `typography.body1` / `body2` | 16px / 14px, 행간 1.6 | 같은 크기, 행간 1.7 | 본문 |
| `typography.button` | 14px 600 | 15px 500, 자간 0 | 모든 버튼 |
| `typography.overline` | 600, 자간 0.08em | 500, 자간 0.08em (유지) | 라벨 |
| `shape.borderRadius` | `0` | `0` (유지) | 전역 기본 |
| `MuiButton` radius | `0` | `999` | 모든 버튼 |
| `MuiButton` 여백 | 없음 | 32/10px, 큰 것 36/14px | 모든 버튼 |
| `MuiIconButton` radius | 없음 | `999` (신설) | 아이콘 버튼 |
| `MuiChip` radius | `4` | `999` | chip과 태그 |
| `MuiCard` radius | `0` | `24`, 그림자 없음 | 모든 카드 |
| `MuiDialog` radius | 없음 | `24` (신설) | 모든 모달 |
| `MuiOutlinedInput` radius | 없음 | `16` (신설) | 입력 전체 |
| `MuiOutlinedInput` 여백 | 없음 | 상하 16px, 좌우 18px (신설) | 입력 전체 |
| `MuiTextField` 기본 변형 | 없음 | `outlined` 고정 (신설) | 모든 TextField |
| `MuiPaper` 그림자 | elevation 1~4 그림자 | 전 단계 그림자 없음 | 면 전체 |
| `MuiAppBar` 그림자 | 없음 | 그림자 없음 (신설) | 상단 바 |
| `customShadows` | 검정 6~12% | 전경 틴트 5~10% | 따로 부르는 표면 |
| `spacing` | `8` | `8` (유지) | 전역 |
| `breakpoints.values` | xs 0 ~ xl 1536 | 같은 값 (유지) | 전역 |
| `transitions` | MUI 기본 | 같은 값 (유지) | 전역 |
| 다크 테마 파일 | 없음 | palette만 바꾼 두 번째 테마 (신설) | 화면 밝기 설정 |

비고:

- 현재값은 스타터킷 테마 파일이고 변경값은 이 저장소의 테마 파일이다. 유지하는 토큰도 "(유지)"로 남겨 비교가 끊기지 않게 했다.
- 표의 `Mui*` 행은 전부 `components.` 아래 경로다. 전체 경로는 차례로 `components.MuiButton.styleOverrides.root.borderRadius`, `components.MuiIconButton.styleOverrides.root.borderRadius`, `components.MuiChip.styleOverrides.root.borderRadius`, `components.MuiCard.styleOverrides.root.borderRadius`, `components.MuiDialog.styleOverrides.paper.borderRadius`, `components.MuiOutlinedInput.styleOverrides.root.borderRadius`다. 입력 여백은 같은 오버라이드의 `input` 자리에, 기본 변형은 `components.MuiTextField.defaultProps.variant`에 들어간다.

---

## 6. 다음 문서로 넘기는 것

| 받는 곳 | 가져가는 것 |
|---|---|
| theme.js 수정 | 5절 표 |
| /component-work | 3절 토큰 방향, 5절 표 |
| /layout-composer | 2절 두 표의 아키타입·콘텐츠 신호 |
| /visual-asset-prompt | 4절 개요 표와 에셋별 방향, 4.1절 |
