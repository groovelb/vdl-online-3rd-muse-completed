# MUSE

> AI가 정한 모든 디자인 결정의 출처와 이유를 추적할 수 있는 디자인 시스템 빌더
> — 사용자 의도가 UX 자체에 박혀 결정 주도권이 사용자에게 있는 구조
>
> **2026-04-29**: 모드 3 (`handoff` / 🎯 코드 직행) 폐기. system 모드와 실질 차이가 없어 system 모드가 기존 handoff 의 export 역할 (DESIGN.md + DTCG + decision-trace + refs ZIP) 까지 흡수. 활성 모드는 `concept` / `system` 2종.

## 배경 및 목적

### 시장 페인포인트 (정성 리서치 검증 — `docs/research/02-painpoints-qualitative-analysis.md`)

4개 super-theme이 52건 출처에서 검증됨:

- **T1. "왜 그랬는지 모름"** — DESIGN.md / Stitch / Claude Design 모두 결과만 줄 뿐 결정 근거를 안 준다
  - 김은수 IBM Research: *"DESIGN.md는 '버튼은 테라코타 색'이라고 기록하지만, 왜 테라코타를 골랐는지는 담지 않는다. 결과는 있지만 이유가 빠져 있는 구조."* (ZDNet Korea, 2026-04-26)
- **T2. "단일 입력의 단조로움"** — 60+ 브랜드 중 1개만 고르거나, 단일 이미지 입력. "Everything looks… the same" (Bitovi)
- **T3. "통제권 상실"** — 사용량·편집·통합 전반에서 사용자가 통제 못 함. 30분에 80% 토큰 소진(PCWorld via 다수 KR 매체)
- **T4. "AI는 craft를 대체 못함"** — *"디자이너의 미래는 AI가 더 뛰어난 결과물을 만들 수 있도록 원칙과 시스템을 설계하는 것"* (토스 디자인팀)

### MUSE 해결 접근

- **사용자 의도를 UX의 입력 지점마다 박는다**: 레퍼런스 업로드 시 "왜 좋아요?" / 프로젝트 시작 시 "어떤 모드?" / 추천 카드별 "어느 레이어를 가져올지" — 큰 화면 신규 X, 6개 입력 지점에 작은 질문 끼워 넣기
- **모든 결정에 출처 + 이유 + 대안 자동 노출**: T3 출력의 `decisionRationale` per token 으로 토큰 카드에 출처 레퍼런스 + 의도 매칭 이유 + 탈락 후보 표시
- **모드 기반 분기**: 컨셉 / 시스템 — T2 추천 정렬, T3 합성 톤, Export default 모두 모드별 분기 (이전의 `handoff` / 🎯 코드 직행 모드는 2026-04-29 폐기, system 모드가 export 까지 흡수)

### 기대 효과

- Cursor / Claude Code / Lovable 등에 바로 투입 가능한 토큰 + 결정 로그 동시 산출
- "AI가 만든 결과"가 아닌 "내가 결정한 결과"로 사용자가 인식 → 충성도 ↑, craft 보존
- 레퍼런스 아카이빙 + 프로젝트 단위 큐레이션 경험 통합

## 핵심 기능

> 페인포인트 직격 매핑 (T1~T4 super-theme 참조). 우선순위는 [04-ux-intervention-roadmap](../research/04-ux-intervention-roadmap.md) 의 작업 순서 기반.

| # | 기능 | 설명 | 직격 페인 | 우선순위 |
|---|------|------|---------|---------|
| 1 | 레퍼런스 아카이빙 | 드래그앤드롭/링크로 이미지 저장, 인피니트 그리드 뷰 | — | 필수 (구현 완료) |
| 2 | 레퍼런스 자동 태깅 (T1) | 업로드 시 5 레이어 태그 + dominantColors + extracted 토큰 추출 | — | 필수 (구현 완료) |
| ~~3~~ | ~~레퍼런스 의도 chip (TP1)~~ | **폐기 (2026-04-28)** — 검증 결과 효과 없음 | — | 폐기 |
| 4 | **프로젝트 모드 선택** (TP2 / Wizard Step 0) | 카드 2개 (concept/system) — 모든 후속 분기 기준. ~~handoff~~ 는 2026-04-29 폐기 | T2/T3 | 구현 완료 |
| 5 | **제목 + 한 줄 의도** (TP3 / Wizard Step 1) | IntentGuideField. placeholder + helperText 가이드 (가이드 박스는 Step 3로 이전) | T2 키워드 매칭 | 구현 완료 |
| 6 | 레퍼런스 자동 추천 (T2 / Wizard Step 2) | 의도 + 모드 기반 Top-N 추천 + referenceLayer per ref | — | 구현 완료 |
| 7 | **레퍼런스 layer chip** (TP4 / Wizard Step 2) | 추천 카드별 layer chip 토글 (자동/수동) | T3 useLayers strict | 구현 완료 |
| 8 | **활용 노트** (Step 3 NEW / Wizard Step 3) | RefinementNotesField — 레퍼런스 본 후 명시 지시. 모드별 minLength 차등 (concept=0/system=30). T3 HIGHEST PRIORITY 입력 | T3 합성 | **필수 신규** 구현 완료 |
| ~~9~~ | ~~분석 직전 확인 박스 (TP5)~~ | **폐기 (2026-04-28)** — Step 3 하단 [분석 시작 →] 버튼이 흡수 | — | 폐기 |
| 10 | 자동 토큰 분석 (T3 / Wizard Step 4) | 선택 ref + intent + mode + useLayers + **userNotes** → 4 레이어 토큰 + visualDirection.md + decisionRationale (per token) | — | 구현 완료 |
| 11 | **토큰 결정 추적** (TP6) | 4 layer (color/typo/layout/gradient) 토큰 카드 ❓ 펼침 → 출처 + 의도 매칭 + ✋ appliedUserNotes 인용 + 탈락 후보 | T1 결정 추적 | 구현 완료 |
| 12 | 토큰 내보내기 (MUI theme + ZIP) | MUI createTheme JSON + 이미지 + visual-direction.md | — | 구현 완료 |
| 13 | **DTCG / DESIGN.md / decision-trace.md 동시 출력** | W3C DTCG + Google Labs alpha spec 호환 + 결정 로그. system 모드에서 ZIP 번들로 출력 (DESIGN.md + DTCG + decision-trace.md + refs/) | T3 산출물 | 구현 완료 (2026-04-29 system 모드에 통합) |

## 대상 사용자 (페르소나 4명 — `02-painpoints-qualitative-analysis.md` §6 매핑)

- **P1. 비디자이너 PM/창업자**: "디자이너 없이 프로토타입 만들고 싶다" — TP2 "🎨 컨셉 잡기" 모드 진입
- **P2. 시니어 디자이너**: "AI는 내 craft를 못 대체한다, 그래도 가속은 필요하다" — TP4 layer chip으로 의도적 큐레이션
- **P3. 디자인 시스템 엔지니어**: "토큰을 코드로 가져오는 데 30%가 사라진다" — TP2 "🏗️ 시스템" 모드 + DTCG / DESIGN.md / decision-trace ZIP export
- **P4. AI 코딩 도구 헤비유저**: "DESIGN.md 줘도 AI가 무시한다" — schema-strict tool 출력 + 결정 로그 인용으로 신뢰 확보

## 기술적 범위

- **포함**
  - 웹 기반 인터페이스 (미니멀 UI)
  - 이미지 업로드·링크 저장, 인피니트 그리드
  - AI 기반 토큰 분석 (컬러/타이포/레이아웃/그라디언트/키비주얼)
  - 레이어별 토큰 편집 UI
  - MUI theme 형식 export
- **제외**
  - 실제 코드 생성 (토큰 export까지만, 컴포넌트 코드는 외부 바이브 코딩 도구가 담당)
  - 협업/공유 기능 (초기 범위 아님)
  - 모바일 네이티브 앱
  - MUI 외 다른 테마 포맷 (Tailwind, Chakra 등은 추후 고려)
- **제약사항**
  - AI 분석은 외부 모델 API 의존 → 비용/지연 고려 필요
  - 타이포 분석은 이미지에서 추정 기반 (정확한 폰트명 매칭은 best-effort)
  - 이미지 저장소 용량 전략 필요 (초기: 로컬/브라우저 저장 범위에서 시작 가능)

## 성공 기준 (검증 가능 지표)

기존 정량:
- 프로젝트 하나 생성 → 토큰 export까지 3분 이내
- export된 MUI theme을 프로젝트에 바로 적용해 시각적 일관성 체감 가능

UX 의도성 지표 (`04-ux-intervention-roadmap.md` §7):

| 지표 | Before 가설 | After 목표 |
|------|-----------|----------|
| 의도 입력 평균 길이 | <20자 | >40자 (TP3 시드/예시 효과) |
| Step 2 layer 수동 변경률 | 0% | >30% (TP4 사용자 결정 행동) |
| 토큰 카드 hover/click률 | 미측정 | >60% (TP6 사용자가 근거 확인) |
| T3 결과 export 비율 | 미측정 | ↑ 10pp (만족도 ↑) |
| 30일 재방문률 | 미측정 | ↑ (충성도 ↑) |

페르소나별 자발적 도달:
- P1 PM이 "🎨 컨셉 잡기" 모드 → 5분 안에 만족스러운 결과 도달
- P2 디자이너가 TP4 layer chip 토글 → "내가 결정했다" 인식
- P3 엔지니어가 DTCG export → 외부 빌드 파이프라인에 무수정 import
- P4 AI 코딩 헤비유저가 decision-trace.md → Cursor에 그대로 던졌을 때 결정 무시 X

---

## 참조 문서

- [docs/research/01-design-md-painpoints-raw.md](../research/01-design-md-painpoints-raw.md) — 시장 페인포인트 raw 인용 (52건)
- [docs/research/02-painpoints-qualitative-analysis.md](../research/02-painpoints-qualitative-analysis.md) — 정성 분석 (4 super-themes, 18 클러스터)
- [docs/research/04-ux-intervention-roadmap.md](../research/04-ux-intervention-roadmap.md) — TP1~TP6 + 시스템 프롬프트 업데이트 (구현 명세)
