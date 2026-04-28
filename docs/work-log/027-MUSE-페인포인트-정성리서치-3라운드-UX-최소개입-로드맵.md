---
session: 027
date: 2026-04-28
title: MUSE — AI 디자인 도구 페인포인트 정성리서치 3라운드 + UX 최소개입 로드맵 확정
---

# 027. MUSE — AI 디자인 도구 페인포인트 정성리서치 3라운드 + UX 최소개입 로드맵 확정

> 코드 작업이 아닌 **리서치·전략 세션**. 산출물은 `docs/research/` 4개 문서 + ReferenceDetailDialog 미세 조정.

## 🎯 의도 (User Goal)

> (1) DESIGN.md / Claude Design / Stitch / tweakcn 등 AI 디자인 도구의 사용자 페인포인트를 양질의 데이터로 조사. (2) 정성 리서치 분석 기법으로 패턴 추출. (3) 분석 결과를 MUSE의 UX flow에 반영하는 방향성 확정. **퍼포먼스 파인튜닝보다 UX 자체에 사용자 의도가 들어가는 방향으로**.

## 🔑 주요 의사결정

- **리서치 도구로 Claude Code Skill + MCP 둘 다 설치**: Firecrawl skill (8개 sub-skill, 117k weekly installs) + Reddit MCP (`uvx mcp-reddit`). 단 Reddit은 user-agent 차단으로 실제 호출 보류, WebFetch + WebSearch로 우회.
- **3라운드 점진 수집**: 라운드 1 (영문 18 + 한국어 9 = 27건) → 라운드 2 (designmd.app 자체 한계 인정 + Toss tech + SeedFlip + MUI 가이드 추가) → 라운드 3 (UXPin 메타 비판 + KRDS 갭 + Figma Config 2025 발표). **로그인 필요 영역(디스콰이엇·Twitter·페북)은 의식적 보류**.
- **정성 분석 기법 적용**: Thematic Analysis (Braun & Clarke 6 phases) + Affinity Diagram + Severity × Frequency 매트릭스 + JTBD framework + Persona Pain Mapping. 단순 인용 나열 X.
- **4개 super-theme 도출**: T1 "왜 그랬는지 모름" / T2 "단일 입력의 단조로움" / T3 "통제권 상실" / T4 "AI는 craft 대체 못함". 김은수 IBM Research UX 엔지니어 "결과는 있지만 이유가 빠져 있는 구조" 인용이 T1을 결정타로 검증.
- **포지셔닝 충돌 해소**: 사용자 직관("DESIGN.md는 피상적, 더 구체적 산출물")과 Claude의 시장 우려("구체적이면 이긴다는 거짓") 사이에서 **"구체성 자체"가 아닌 "결정 가능성"이 본질**이라는 합의 도달.
- **새 화면 만드는 접근 거부**: Claude가 처음 제안한 "Stage A~F 새 화면" 접근은 사용자에게 학습 부담 → 거부. 대신 **6개 기존 입력 지점에 "왜?" 질문을 끼워 넣는 최소 개입** 방향 확정 (사용자 명시 요청).
- **TP1~TP6 + 시스템 프롬프트 업데이트로 통합**: TP2 모드 선택 → TP1 레퍼런스 chip → TP3 의도 시드 → TP4 layer chip → TP5 확인 박스 → TP6 토큰 출처 펼침. T1/T2/T3 system prompt에 mode/userIntent/useLayers 변수 + decisionRationale 출력 추가.
- **3~4주 작업 순서 확정**: 사용자가 만나는 순서 + 데이터 의존성 + 체감 변화 크기 기준. TP2부터 진입 (모든 후속 단계의 분기 기준).

## 💬 Claude의 핵심 반응

재현에 영향을 주는 부분만:

- **페이스 제어 학습**: 사용자가 여러 번 "왜케 서둘르냐", "산으로 가는거같냐" 지적 → 코드 진입 전 정성 분석 + 포지셔닝 + UX 방향성 순서로 정리하는 게 옳다. 분석 → 메시지 → UX → 코드 순서를 지킬 것.
- **사용자 직관을 시장 데이터로 검증**: 사용자가 처음 말한 "DESIGN.md는 피상적, 결정 책임 안 짐"이 김은수 ZDNet 인용 ("결과는 있지만 이유가 빠져 있는 구조")으로 데이터 검증됨 → 이게 카피·기능 우선순위의 결정타.
- **새 화면 vs 최소 개입의 차이**: "사용자가 도구를 처음 켜면 막연한 의도 상태. 작은 질문이 답을 만들기 위해 머리를 굴리게 함. 그 답이 입력되어 결과를 정밀하게 만들고, 동시에 사용자에게 '내가 결정했다' 느낌을 줌." Stripe Atlas / Notion 템플릿 / Linear 프로젝트 시작 패턴.
- **버벌 브랜딩 시도는 보류**: 어려운 메타 용어("decision-traceable", "schema-strict") 빼고 쉬운 카피 시도 → 사용자가 "왜케 산으로 가냐, UX 변화부터 정리" → 브랜딩은 UX 확정 후 다시.
- **데이터 누적 후 분석**: 매 라운드 후 raw 인용을 파일에 즉시 저장 (휘발 방지). 분석은 raw가 충분히 쌓인 후 일괄.
- **검증 가능한 지표 명시**: "30일 재방문률 ↑" 같은 추상보다 "의도 입력 평균 길이 <20자 → >40자", "Step 2 layer 수동 변경률 0% → >30%" 같은 측정 가능 지표 우선.

## 📂 변경된 파일

### 📚 신규 리서치 문서 (4개, `docs/research/`)

| 파일 | 역할 |
|------|------|
| `docs/research/01-design-md-painpoints-raw.md` | 1차 인용 + 17개 가설(A~O) 검증. 52건 출처 (영문 28 + 한국어 13 + 보조 11) |
| `docs/research/02-painpoints-qualitative-analysis.md` | 정성 분석 (Thematic Analysis 6 phases + 18 클러스터 + 4 super-themes + Severity×Frequency + JTBD + Persona Pain Mapping) |
| `docs/research/03-product-priority-roadmap.md` | 15개 작업 후보 ROI 정렬 + 12주 4-Sprint 로드맵 (대안, 폐기됨) |
| `docs/research/04-ux-intervention-roadmap.md` | **확정 방향**. TP1~TP6 + 시스템 프롬프트 업데이트 + 3~4주 작업 순서 |

### 🛠️ 도구 설치 (라운드 1 작업의 일부)

| 파일 | 종류 | 요약 |
|------|------|------|
| `~/.claude/skills/firecrawl-{agent,cli,crawl,download,interact,map,scrape,search}/` | 추가 | Firecrawl skill 8개 sub-skill 설치 (`git clone https://github.com/firecrawl/cli` 후 sub-skills 승격) |
| `~/.claude.json` | 수정 | Reddit MCP 등록 (`claude mcp add reddit -- uvx mcp-reddit`) — user-agent 차단으로 실호출 보류 |

### 🎨 ReferenceDetailDialog 미세 조정 (이번 세션 초반)

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/components/overlay-feedback/ReferenceDetailDialog.jsx` | 수정 | 우측 메타 사이드 width `minmax(320,420)` → `minmax(480,600)` 확장. 이미지를 grid에서 빼서 absolute 레이어로 이동 (viewport 정중앙 정렬). 이미지 maxWidth `min(100%, 1200px)` → `33vw`로 변경 |

## 🧩 컴포넌트 작업

- **수정**: `ReferenceDetailDialog` (우측 메타 width 확대 + 이미지 viewport-center 절대 위치)

## ✅ 최종 결과

- **시장 데이터로 검증된 4개 super-theme**: T1 결정 추적 부재 / T2 단일 입력 단조로움 / T3 통제권 상실 / T4 craft 대체 불가
- **UX 최소 개입 로드맵 확정**: 새 화면 신규 X, 6개 기존 입력 지점에 "왜?" 질문 + 시스템 프롬프트 업데이트로 사용자 의도가 UX 자체에 박힘
- **3~4주 작업 순서 확정**: TP2 → TP1 → TP3 → TP4 → TP5 → TP6
- 검증: `docs/research/01~04` 문서 4개 작성 완료. 52개 인용 + 정성 분석 + 작업 순서까지 한 흐름으로 추적 가능.

## 🔁 재현 가이드 (교육생용)

### 1. 리서치 인프라 설치
```bash
# Firecrawl skill (sub-skill 8개)
cd ~/.claude/skills && git clone https://github.com/firecrawl/cli.git firecrawl
mv ~/.claude/skills/firecrawl/skills/* ~/.claude/skills/
rm -rf ~/.claude/skills/firecrawl

# Reddit MCP (실호출은 user-agent 차단)
claude mcp add reddit -- uvx mcp-reddit
```

### 2. 점진적 데이터 수집 (3라운드)
- **라운드 1**: WebSearch + WebFetch로 비교 글·블로그·GitHub README. 영문 18 + 한국어 9건.
- **라운드 2**: designmd.app 자체 페이지 + Toss tech + SeedFlip + MUI 가이드. 자기 인정 한계 발화 우선.
- **라운드 3**: UXPin 메타 비판 + 한국 velog (KRDS 갭) + Figma Config 2025 발표.

→ 각 라운드 후 raw 인용을 `docs/research/01-...md`에 즉시 저장. 휘발 방지.

### 3. 정성 분석 프레임워크 적용
- **Open Coding**: 발화 → 코드 (1:1)
- **Axial Coding**: 코드 그룹핑 → 클러스터
- **Selective Coding**: 클러스터 → super-theme (4개)
- **Severity × Frequency**: P0~P3 우선순위
- **JTBD**: 사용자가 도구를 "고용"하는 작업
- **Persona Pain Mapping**: 페르소나별 페인 강도

→ `docs/research/02-...md`에 위 6개 기법을 섹션으로 분리 적용.

### 4. 포지셔닝 vs UX 방향 분리 의사결정
- 포지셔닝 카피는 어렵게 쓰지 말 것. 메타 용어 (decision-traceable, schema-strict) 거부.
- UX 변화는 새 화면 만들지 말 것. 기존 입력 지점에 "왜?" 질문 추가.
- 두 결정이 충돌할 때 사용자 명시 요청 우선.

### 5. UX 최소 개입 명세 (TP1~TP6)
- TP1 레퍼런스 업로드 chip — `useReferenceArchive.js` + `ImageCard.jsx`
- TP2 프로젝트 모드 선택 카드 — `ProjectCreateWizard.jsx` Step 0
- TP3 의도 시드 단어 + 예시 — `ProjectCreateWizard.jsx` Step 1
- TP4 카드 layer chip — `ReferencePicker.jsx`
- TP5 분석 직전 확인 박스 — `ProjectCreateWizard.jsx` Step 3 진입
- TP6 토큰 카드 출처 펼침 — `ProjectDetailPage.jsx` + `ColorSwatchList.jsx`

### 6. 시스템 프롬프트 업데이트 (T1/T2/T3)
- T1: `userIntent.aspect` 변수 + `extractionRationale` 출력
- T2: `projectMode` 변수 + `referenceLayer` 출력
- T3: `projectMode` + `selectedRefs[].useLayers` 변수 + `decisionRationale` 출력 (whichRefs/whyChosen/alternatives)

→ AI 호출 cost 변화 거의 없음 (cache hit).

### 7. 작업 시작
TP2 (모드 선택 카드) 부터 진입. 모든 후속 단계의 분기 기준이 됨.

> 💡 핵심 포인트:
> 1. **분석 → 메시지 → UX → 코드 순서 지킬 것** — 사용자가 4번 "왜케 서둘르냐" 지적했음. 서두르지 말 것.
> 2. **사용자 직관을 시장 데이터로 검증** — 김은수 ZDNet "결과는 있지만 이유가 빠져있는 구조"가 결정타 인용. 사용자 본인이 처음 말한 문제의식과 정확히 일치.
> 3. **새 화면 X, 기존 입력 지점에 질문 추가** — Stripe Atlas / Notion 템플릿 / Linear 패턴. 사용자가 답을 만들기 위해 머리를 굴리게 함.
> 4. **로그인 필요 영역은 의식적 보류** — 디스콰이엇·Twitter·페북은 user-agent / login 차단. 시간 낭비 회피.
> 5. **휘발 방지 — raw 데이터 즉시 저장** — 라운드별로 fetch 결과를 `docs/research/01-...md`에 즉시 누적. 분석은 그 다음.
