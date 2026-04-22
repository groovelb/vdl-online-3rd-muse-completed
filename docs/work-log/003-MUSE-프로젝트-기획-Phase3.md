---
session: 003
date: 2026-04-22
title: MUSE 프로젝트 기획 Phase 3 (visual-direction) 작성 및 승인
---

# 003. MUSE 프로젝트 기획 Phase 3 (visual-direction) 작성 및 승인

## 🎯 의도 (User Goal)

> Phase 2 승인 후 MUSE의 비주얼 디렉션 제시 요청. 미니멀·fluid·넓은 간격·최대 radius·흰검 제거·블루/바이올렛 틴트를 기본 원칙으로 받고, 이후 "Primary는 검정(이미지 퍼스트)", "배경 틴트 은은하게", "Card 전체 둥글게 통일"로 조정 후 승인.

## 🔑 주요 의사결정

- **Primary = near-black `#14132B` (이미지 퍼스트)**: 첫 초안은 바이올렛 `#4F46E5`였으나, MUSE가 레퍼런스 이미지/토큰을 보여주는 도구라 UI 강조색이 튀면 이미지 색 인식을 방해함 → 검정 기반 뉴트럴로 전환. 단, 순수 `#000000`은 피하고 살짝 바이올렛 틴트가 섞인 near-black.
- **배경 틴트는 은은하게**: `#FAFAFF`/`#F5F5FF` 초안 → `#FCFCFF`/`#F8F8FC`로 낮춤. 완벽한 흰색은 회피하되 이미지 색 왜곡 최소화.
- **바이올렛 `#4F46E5`는 Accent로 격하**: Primary에서 밀려난 뒤 "분석 중" 같은 필수 강조 포인트에만 소량 사용.
- **Border Radius 철학 = 어포던스 대비**: 전역 `shape.borderRadius: 0` 유지, 클리커블만 둥글게. Button/Chip/IconButton = `999px`(pill), Input = `16px`, **모든 Card + Dialog = `24px` 통일** (초안의 클리커블/비클리커블 구분은 사용자 피드백으로 제거).
- **Fluid 레이아웃**: 페이지 좌우 `clamp(24px, 4vw, 64px)`, h1 `clamp(48px, 6vw, 96px)` — 고정 maxWidth보다 유체 폭 우선.
- **Elevation 틴트화**: 기존 low-opacity + blur 철학은 유지하되 `rgba(0,0,0,...)` → `rgba(20, 19, 43, ...)`로 톤 일관화.
- **레퍼런스 이미지는 추후 매핑**: 레이아웃/토큰 설계 먼저, 사용자가 레퍼런스를 제공하면 `03-visual-direction.md`의 레퍼런스 표에 mapping 예정.

## 💬 Claude의 핵심 반응

- 초안 제시 후 **승인 전 확인 포인트 5개**(Primary 색상 방향/배경 틴트 강도/Card 통일 여부/레퍼런스 제공 여부/h1 weight)를 명시적으로 질문하여 정밀 조정 유도.
- 사용자의 "검정 사용" 지시에 대해 `#000000` 직접 사용 대신 **near-black `#14132B` + 동일축 hover `#2D2B5A`** 제안 — "검정으로 보이되 톤은 프로젝트 전체 틴트축을 유지"하는 절충안.
- 컬러 변경뿐 아니라 **shadow/divider도 같은 틴트축으로 일관 처리**해야 Primary 변화가 진짜 톤으로 작동한다는 점 강조.
- 변경 필요 토큰 요약 표를 `theme.js` 수정의 직접 입력 포맷(경로 · 현재값 · 변경값 · 적용 대상)으로 정리.

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `docs/muse/03-visual-direction.md` | 추가 | 톤앤매너/컬러/타이포/공간/Radius/Elevation/레퍼런스/변경 토큰 요약 포함한 Phase 3 문서 |
| `docs/muse/03-visual-direction.md` | 수정 | Primary를 바이올렛 → near-black 전환, 배경 틴트 약화, Card 통일, 레퍼런스 섹션을 "추후 매핑"으로 명시 |

## ✅ 최종 결과

MUSE 기획 문서 3종(`01-project-summary` / `02-ux-flow` / `03-visual-direction`) 완성 및 승인. 이후 실제 구현은 `/component-work` 스킬로 신규 컴포넌트(ProjectCreateWizard, ColorSwatchList, TokenListItem 등) 제작부터 시작 가능한 상태.

## 🔁 재현 가이드 (교육생용)

1. Phase 2 승인 상태에서 Claude에게 비주얼 디렉션 요청 시 **핵심 원칙 6개를 한 번에 전달**: 미니멀 / fluid / 넉넉한 간격 / 최대 radius(클리커블) / 흰검 제거 / 블루-바이올렛 틴트.
2. Claude가 `docs/muse/01-project-summary.md` + `component-work/resources/mui-theme.md` + `doc-templates.md`(visual-direction)를 Read해 현재 테마 토큰 확보.
3. `docs/muse/03-visual-direction.md` 작성 — 현재 토큰값과 변경값을 **나란히 표로** 기록. 특히 `theme.js`의 `shape.borderRadius: 0`, `primary.main: #0000FF`, Pretendard/Outfit 조합을 정확히 인용.
4. 승인 전에 **판단이 갈릴 포인트 4~5개를 번호 매겨 질문** → 사용자가 번호로 짧게 답하면 그대로 `Edit`으로 섹션별 교체.
5. "Primary에 검정 사용" 요청이 와도 `#000000` 직접 사용은 피하고 **기존 틴트축을 유지한 near-black(`#14132B`)**로 번역. hover도 같은 축 한 단계 밝게(`#2D2B5A`).
6. "Card 전체 둥글게 통일" 같은 규칙 통일 요청은 클리커블/비클리커블 분기 줄 제거 → 단일 값으로 단순화.
7. 마지막 섹션(변경 필요 토큰 요약)은 반드시 **경로 · 현재값 · 변경값 · 적용 대상** 4열 표로 — 구현 단계에서 theme.js 수정 입력이 되도록.

> 💡 핵심 포인트: 비주얼 디렉션은 "취향"이 아니라 **프로젝트 성격에서 파생되는 기능적 결정**이다. MUSE는 "이미지/토큰이 주인공"이므로 Primary가 뉴트럴이어야 하고, 레퍼런스 이미지 색을 왜곡하지 않으려면 배경 틴트도 은은해야 한다. 사용자의 피드백(검정/은은)을 받았을 때 색상 하나만 바꾸지 말고 **shadow·divider·grey 스케일까지 같은 축으로 일관 재정렬**해야 톤이 진짜로 바뀐다.
