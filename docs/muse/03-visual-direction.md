# MUSE — Visual Direction

## 톤앤매너

- **키워드**: 미니멀 / 공간감 / 플루이드 / 이미지 퍼스트 / 둥근 클리커블
- **설명**:
  - 한 화면에는 사용자가 지금 필요한 최소한의 정보만.
  - 뷰포트 전체를 시원하게 사용하는 fluid 레이아웃(고정 max-width보다 유체적 폭 우선).
  - 크기·간격·패딩이 넉넉해 정보 밀도가 낮은 현대적 공간 구성.
  - **이미지 퍼스트**: UI는 뒤로 빠져 레퍼런스 이미지와 토큰이 주인공이 되도록 Primary는 검정 기반 뉴트럴.
  - 배경은 완벽한 흰색을 피하되 블루-바이올렛 틴트는 **은은하게**만 — 이미지 색을 왜곡하지 않는 선에서.
  - 클리커블 요소는 가장 큰 border radius를 적용해 부드럽고 "누르고 싶은" 감각을 강조.

---

## 컬러 방향

### 설계 원칙

- **이미지 퍼스트 Primary = 검정 계열**: UI 강조색이 튀면 레퍼런스 이미지와 토큰이 가려짐. Primary는 검정 기반 뉴트럴로 가고, 인터랙션은 radius·간격·모션으로 전달.
- **배경 틴트는 은은하게만**: 완벽한 `#FFFFFF`는 피하되 틴트는 `#FCFCFF` 수준에서 멈춰 이미지 컬러 인식을 방해하지 않는다.
- **순수 검정(`#000000`)도 회피**: Primary는 검정이되 아주 살짝 바이올렛 틴트를 넣어 `#14132B` 수준 (화면에선 검정처럼 읽힘).

### 현재 토큰 대비 변경안

| 용도 | 현재 토큰 | 현재값 | 변경 방향 | 근거 |
|------|----------|--------|----------|------|
| Primary | `palette.primary.main` | `#0000FF` | `#14132B` (틴트 near-black) | 이미지 퍼스트. UI가 뒤로 빠지도록 검정 기반 뉴트럴 |
| Primary Hover | (없음) | — | `#2D2B5A` | hover 시 한 단계 밝게 |
| Secondary | `palette.secondary.main` | `#263238` | `#5A586E` (미드 뉴트럴 틴트) | 보조 액션, Primary와 계조만 다르게 |
| Background Default | `palette.background.default` | `#FFFFFF` | `#FCFCFF` (아주 은은한 블루 틴트) | 완벽한 흰색 회피, 이미지 색 왜곡 없음 |
| Background Paper | `palette.background.paper` | `#FFFFFF` | `#F8F8FC` | 카드/패널, 기본 배경보다 약간 더 깊은 면 |
| Surface Elevated | (신규) | — | `#F3F3F9` | Dialog/Popover 등 최상위 면 |
| Text Primary | `palette.text.primary` | 기본 | `#14132B` | Primary와 동일축 near-black (ink 개념) |
| Text Secondary | `palette.text.secondary` | 기본 grey | `#7A798E` | 보조 텍스트, 은은한 틴트 |
| Divider | `palette.divider` | 기본 grey | `rgba(20, 19, 43, 0.08)` | near-black을 저투명으로 사용 |
| Grey 100 | `palette.grey[100]` | 기본 grey | `#F3F3F9` | 전체 grey 스케일을 은은한 틴트로 재정의 |
| Action Selected | (신규) | — | `rgba(20, 19, 43, 0.06)` | 토큰 on, 태그 선택 상태 — 낮은 대비로 이미지 방해 안 함 |
| Accent (옵션) | (신규) | — | `#4F46E5` | 꼭 필요한 경우(예: "분석 중" 인디케이터)에만 소량 사용 |

### 추천 팔레트 (참고용)

```
Image-First Neutral Scale (은은한 바이올렛 틴트)
#FCFCFF  → background.default
#F8F8FC  → background.paper
#F3F3F9  → surface.elevated / grey.100
#E8E7F0  → grey.200 / subtle border
#7A798E  → text.secondary
#5A586E  → secondary.main
#2D2B5A  → primary.hover
#14132B  → primary.main / text.primary (ink)
#4F46E5  → accent (sparingly)
```

---

## 타이포그래피 방향

### 설계 원칙

- 기존 Pretendard / Outfit 조합은 유지 (브랜드 일관성).
- MUSE의 미니멀 공간감에 맞춰 **대비를 크게** (디스플레이/헤드라인은 크고 굵게, 본문은 가볍게).
- letter-spacing은 타이트하게(-1% ~ -2%), line-height는 여유있게(1.5 이상).

### 변경안

| 요소 | 현재 설정 | 변경 방향 | 근거 |
|------|----------|----------|------|
| `fontFamily` | `Pretendard Variable` | 유지 | 브랜드 자산 유지 |
| `h1` | `Outfit 900` | `Outfit 700`, `clamp(48px, 6vw, 96px)`, letter-spacing `-2%` | 공간감 강조 위해 유체 크기 적용, weight는 900→700로 덜 무겁게 |
| `h2` | — | `Outfit 600`, `clamp(32px, 4vw, 56px)` | 섹션 타이틀 |
| `h3` | — | `Outfit 600`, `clamp(24px, 2.5vw, 32px)` | 레이어 탭 제목 |
| `subtitle1` | — | `Pretendard 500`, `18px`, line-height `1.5` | 프로젝트 의도 문장 등 강조 본문 |
| `body1` | 기본 | `Pretendard 400`, `16px`, line-height `1.7` | 여유있는 행간 |
| `body2` | 기본 | `Pretendard 400`, `14px`, line-height `1.7` | 태그, 토큰 값 |
| `caption` | 기본 | `Pretendard 500`, `12px`, letter-spacing `2%` | 레이블·메타 정보 |
| `button` | 기본 (uppercase) | textTransform `none`, weight `500` | 미니멀 톤에서 대문자 강제는 과함 |

---

## 간격 및 레이아웃

### 설계 원칙

- **Fluid 레이아웃**: 고정 `maxWidth` 최소화, `PageContainer`에서도 화면 전체를 사용하는 변형 우선.
- **넉넉한 패딩·간격**: 기본 spacing 단위는 유지(8px)하되, 섹션/카드/버튼의 기본 패딩을 한 단계 위로.
- **정보 밀도 낮춤**: 한 화면에 핵심 액션 + 결과만. 보조 정보는 hover·탭·패널 진입 이후 노출.

### 값 제안

| 영역 | 현재 | 변경 방향 |
|------|------|----------|
| `spacing` 기본 단위 | `8px` | 유지 |
| 페이지 좌우 패딩 | 기본 | PC `clamp(24px, 4vw, 64px)`, Mobile `20px` |
| 섹션 간 간격 | — | PC `96~120px`, Mobile `64px` |
| 카드 기본 패딩 | 기본 | `24~32px` |
| 버튼 패딩 (lg) | 기본 | `16px 28px` |
| 컴포넌트 간 gap (기본) | — | `16px` (sm) / `24px` (md) / `40px` (lg) |
| 브레이크포인트 전략 | MUI 기본 | 유지 (`xs 0 / sm 600 / md 900 / lg 1200 / xl 1536`), `maxWidth`보다 fluid padding 우선 |

### 레이아웃 패턴

- 아카이브: fluid Masonry (viewport 폭 기반 열 수 자동 조정)
- 프로젝트 상세: `SplitScreen` 좌 40 / 우 60 비율, 양쪽 모두 내부에서 fluid
- Dialog/Export: 최대 폭 제한(`720px`)하되 viewport 높이에 따라 여백이 자동 확장

---

## Border Radius (핵심 변경)

### 설계 원칙

- 기존 전역 `shape.borderRadius: 0` → **클리커블 UI에 한해 가장 큰 radius 적용**.
- 비-클리커블 면(Paper, Section)은 `0` 혹은 매우 작은 값 유지 → 공간의 그리드 감 보존.
- "누를 수 있는 것은 둥글고, 누를 수 없는 것은 각지다" 대비로 어포던스 극대화.

### 토큰별 적용

| 대상 | 값 | 근거 |
|------|-----|------|
| `shape.borderRadius` (전역 기본) | `0` (유지) | 비-클리커블 면은 각지게 |
| Button (모든 사이즈) | `999px` (pill) | "제일 큰 radius" 해석 — 완전 pill |
| IconButton | `999px` | 원형 |
| Chip, Tag | `999px` | pill 일관성 |
| Switch | 기본(MUI) 유지 | 이미 pill |
| Input (TextField, SearchBar) | `16px` | 클리커블이지만 안의 텍스트 정렬을 해치지 않는 큰 radius |
| Select | `16px` | Input과 동일 |
| Card (모든 Card) | `24px` | 클리커블/비클리커블 구분 없이 통일 — MUSE 톤의 부드러운 공간감 일관 유지 |
| Dialog | `24px` | 최상위 면도 부드럽게 |
| Paper / Section | `0` | 유지 |

---

## Elevation (보조 변경)

- 기본 그림자 철학(낮은 opacity + 큰 blur)은 유지.
- 색상만 순수 `rgba(0,0,0,...)` → 바이올렛 틴트로 교체해 전체 톤과 일관.

```jsx
shadows: [
  'none',
  '0 0 8px rgba(20, 19, 43, 0.04)',
  '0 0 16px rgba(20, 19, 43, 0.06)',
  '0 8px 32px rgba(20, 19, 43, 0.08)',
  // ...
]
```

---

## 레퍼런스

> 이번 단계에서는 레이아웃/토큰 설계에 먼저 집중하고, 레퍼런스 이미지는 추후 확보되는 대로 아래 표에 매핑한다.

| # | 레퍼런스 | 참고 포인트 |
|---|---------|------------|
| — | (추후 매핑 예정) | 이미지 퍼스트 · 넉넉한 여백 · 라지 타이포 · pill 버튼 |

---

## 변경 필요 토큰 요약

`src/styles/theme.js`에서 직접 수정해야 할 토큰 목록.

| 토큰 경로 | 현재값 | 변경값 | 적용 대상 |
|-----------|--------|--------|----------|
| `palette.primary.main` | `#0000FF` | `#14132B` | Primary 버튼/링크/강조 (이미지 퍼스트 뉴트럴) |
| `palette.primary.light` | (없음) | `#2D2B5A` | hover, 라이트 강조 |
| `palette.secondary.main` | `#263238` | `#5A586E` | 보조 버튼/영역 |
| `palette.background.default` | `#FFFFFF` | `#FCFCFF` | body 배경 (은은한 틴트) |
| `palette.background.paper` | `#FFFFFF` | `#F8F8FC` | Card, Paper |
| `palette.text.primary` | 기본 | `#14132B` | 본문 텍스트 (Primary와 동일축) |
| `palette.text.secondary` | 기본 | `#7A798E` | 보조 텍스트 |
| `palette.divider` | 기본 | `rgba(20, 19, 43, 0.08)` | 모든 divider |
| `palette.grey[100~900]` | 기본 grey | 은은한 틴트 스케일로 재정의 | 전체 grey 사용처 |
| `palette.info.main` (accent) | 기본 | `#4F46E5` | 분석 중 인디케이터 등 최소 강조 |
| `typography.fontFamily` | `Pretendard Variable` | 유지 | 전역 |
| `typography.h1` | `Outfit 900` | `Outfit 700`, `clamp(48px, 6vw, 96px)`, ls `-2%` | Hero, 랜딩 헤드라인 |
| `typography.h2` | — | `Outfit 600`, `clamp(32px, 4vw, 56px)` | 섹션 타이틀 |
| `typography.body1` | 기본 | `16px`, line-height `1.7` | 본문 |
| `typography.button` | uppercase | `textTransform: 'none'`, weight 500 | 모든 버튼 |
| `shape.borderRadius` | `0` | `0` (유지) | 전역 기본 |
| `components.MuiButton.styleOverrides.root.borderRadius` | — | `999px` | 모든 Button |
| `components.MuiChip.styleOverrides.root.borderRadius` | — | `999px` | Chip, Tag |
| `components.MuiIconButton.styleOverrides.root.borderRadius` | — | `999px` | IconButton |
| `components.MuiOutlinedInput.styleOverrides.root.borderRadius` | — | `16px` | TextField, Input |
| `components.MuiDialog.styleOverrides.paper.borderRadius` | — | `24px` | 모든 Dialog |
| `shadows` | 기본 (검정) | 바이올렛 틴트 버전으로 교체 | 전역 |

---

## 핵심 설계 포인트 (요약)

- **색상 (이미지 퍼스트)**: Primary는 검정 기반 near-black `#14132B`로 UI를 뒤로 빼고, 배경은 `#FCFCFF` 수준의 **은은한 틴트**만. 이미지 색 인식 방해 최소화.
- **Accent는 최소한**: 바이올렛 `#4F46E5`는 "분석 중" 같은 꼭 필요한 곳에만.
- **타이포**: Outfit/Pretendard 유지, h1는 `clamp(48, 6vw, 96)`로 fluid 대형화.
- **공간**: 기본 spacing은 유지하되 패딩·섹션 간격을 한 단계 키움.
- **Radius**: 전역 `0` 유지, 그러나 **클리커블(Button/Chip/IconButton=pill, Input=16px, 모든 Card·Dialog=24px)**에 한해 최대 radius 적용 → 어포던스 대비 강화.
- **레퍼런스**: 이번 단계에서는 미매핑, 레이아웃/토큰 설계 우선.
