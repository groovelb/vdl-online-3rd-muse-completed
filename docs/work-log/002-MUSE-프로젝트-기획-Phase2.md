---
session: 002
date: 2026-04-22
title: MUSE 프로젝트 기획 Phase 2 (ux-flow) 작성 및 컴포넌트 역할별 재분류
---

# 002. MUSE 프로젝트 기획 Phase 2 (ux-flow) 작성 및 컴포넌트 역할별 재분류

## 🎯 의도 (User Goal)

> Phase 1 승인 후 `/project-planning`의 Phase 2(ux-flow)를 진행해 `docs/muse/02-ux-flow.md` 작성. 이후 컴포넌트 리스트를 역할(화면/기능 단위) 기준으로 재분류 요청.

## 🔑 주요 의사결정

- **시나리오를 4개로 한정**: 아카이빙 / 프로젝트 생성 / 토큰 편집 / Export — MUSE 핵심 플로우를 벗어나지 않게 하기 위함.
- **토큰 편집은 on/off + emphasis(0–2) 2축**: 삭제가 아닌 비활성화 기반이어야 언제든 복원 가능, 강조도 분리해 의도 반영.
- **기존 컴포넌트 최대 재활용 (재활용 17 / 수정 2 / 신규 10)**: `design-system.md` 원칙에 따라 기존 것부터 점검 후, 레이어별 프리뷰(컬러/타이포/레이아웃/그라디언트/키비주얼)만 신규로 확정.
- **인피니트 그리드는 MUI `Masonry` 수정으로 해결**: 신규 컴포넌트 대신 기존 것에 인피니트 스크롤 훅만 연결.
- **프로젝트 상세 = `SplitScreen` + `CategoryTab` 조합**: 좌측 편집, 우측 프리뷰. 기존 레이아웃 컴포넌트로 커버.
- **컴포넌트 리스트 재분류 기준 = 화면/기능 역할**: 카테고리(텍소노미) 대신 사용자가 인지하는 "어디에 쓰이는가" 축으로 7개 그룹(A~G) 구성. 그룹별 합계 표도 추가해 재활용/수정/신규 비율을 한눈에 파악 가능하게 함.

## 💬 Claude의 핵심 반응

- Phase 2 초안 제시 후 **승인 전 확인 포인트 5개** 제시(emphasis 필요성 / 3-step 위자드 적정성 / 키비주얼의 export 포함 여부 / 레이어 탭 UX / 신규 컴포넌트 10개 규모).
- 재분류 시 단순 re-grouping이 아니라 **그룹별 합계 표**를 추가해 스코프를 수치로 가시화 — MVP 스코프 조정 논의의 근거 자료 역할.
- 레이어별 프리뷰 5종(`ColorSwatchList` 등)은 모두 카테고리 `data-display`로 통일 배치 제안.

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `docs/muse/02-ux-flow.md` | 추가 | 시나리오/Mermaid/IA/데이터모델/컴포넌트 리스트 포함한 Phase 2 문서 |
| `docs/muse/02-ux-flow.md` | 수정 | 컴포넌트 리스트를 7개 역할 그룹(A~G)으로 재분류 + 그룹별 합계 표 추가 |

## 🧩 컴포넌트 작업

아직 코드 작업 없음 — ux-flow 문서에 컴포넌트 계획만 명시.

- **재활용 예정(17)**: AppShell, GNB, PageContainer, SectionContainer, FileDropzone, SearchBar, FilterBar, TagInput, MoodboardCard, CardContainer, CategoryTab, SplitScreen, Dialog, Switch, TextField, Select, Button
- **수정 예정(2)**: `Masonry` (인피니트 스크롤 훅 연결), `ImageCard` (태그 배지 + 선택 체크박스)
- **신규 예정(10)**: `ProjectCreateWizard`, `ReferencePicker`, `AnalysisProgress`, `TokenListItem`, `ColorSwatchList`, `TypographyPreview`, `LayoutTokenPreview`, `GradientPreview`, `KeyVisualBoard`, `ThemeExportDialog`

## ✅ 최종 결과

Phase 2 ux-flow 문서 완성, 컴포넌트 리스트는 역할별 7개 그룹(A 앱골격 / B 아카이브 / C 프로젝트 / D 분석피드백 / E 토큰편집셸 / F 레이어프리뷰 / G Export)으로 재분류 완료. Phase 2 승인 대기 상태.

## 🔁 재현 가이드 (교육생용)

1. Phase 1 승인 후 `/project-planning` 재호출 + "2단계 진행" 등 인자 전달.
2. Claude가 `docs/muse/01-project-summary.md` + `doc-templates.md` + `component-work/resources/components.md` + `taxonomy-index.md`를 Read해 컨텍스트 확보.
3. `docs/muse/02-ux-flow.md` 작성 (시나리오 4개 / Mermaid flowchart / IA 트리 / 데이터 모델 5개 / 컴포넌트 리스트).
4. 컴포넌트 리스트는 **반드시 `components.md`의 기존 항목을 먼저 스캔 → 재활용/수정 후보 확정 → 남은 부분만 신규로 지정**.
5. 사용자가 "컴포넌트 리스트를 역할에 맞게 분류" 요청하면 `Edit`으로 해당 섹션만 교체: 단일 표 → 7개 역할 그룹(A~G) + 그룹별 합계 표.

> 💡 핵심 포인트: **재활용을 먼저 전수 점검한 뒤 신규를 추가**하면 신규 수가 자연스럽게 줄어든다. 재분류 요청 시 그룹별 합계까지 함께 넣어야 스코프 판단 근거가 확보된다.
