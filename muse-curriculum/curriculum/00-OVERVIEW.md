# MUSE 실습 커리큘럼 — 전체 지도

바이브 코딩으로 **MUSE 프로젝트를 처음부터 끝까지 재현**하는 교육용 커리큘럼이다. 한 번 만들어본 프로젝트의 실제 진행 이력을 **학습 순서로 재배치**해서, 같은 시행착오를 반복하지 않도록 설계했다.

---

## 1. 이 커리큘럼의 설계 원칙

실제 프로젝트는 시간 순으로 진행되기 때문에, 중간에 재설계·버그픽스·디자인 QA 같은 "되돌리는 작업"이 끼어든다. 그대로 배우면 잘못된 중간 상태를 학습하게 된다.

이 커리큘럼은 그런 되돌림을 **사전에 제거**해서:

- **재설계 이력을 숨긴다** — 태그 구조, T1/T3 역할 같은 최종 형태만 가르친다.
- **버그픽스를 원래 기능에 합친다** — race 방지, concurrency 제한, 재시도 정책 같은 것은 처음 구현 시점에 기본으로 포함.
- **디자인 QA 규칙을 토큰 세팅 시점에 앞당긴다** — elevation=0, hover 최소, placeholder 전수 같은 전역 규칙.

즉 **"애초에 같이 했으면 좋았을 작업을 함께 묶어"** 재배열한 것이다.

---

## 2. 5 Stage 지도

```
Stage 1. 기획 점검 + 디자인 시스템 세팅
    ↓
Stage 2. UX flow 이해 + 컴포넌트 만들기
    ↓
Stage 3. 더미 데이터로 조립하기
    ↓
Stage 4. 로컬에서 AI 시뮬레이션하기
    ↓
Stage 5. Supabase 연동하기
```

각 Stage는 **이전 Stage의 결과물 위에서만 진행 가능**. 순서 바꾸면 무너진다.

| Stage | 주제 | 결과물 | 예상 분량 |
|---|---|---|---|
| 1 | [기획 + 디자인 시스템](./01-planning-and-design-system.md) | 기획 3문서 + 토큰 파일 + 전역 규칙 | 중 |
| 2 | [UX flow + 컴포넌트](./02-ux-flow-and-components.md) | 컴포넌트 12종 + 템플릿 4종 | 대 |
| 3 | [데이터 조립](./03-data-assembly.md) | schemas.js + 실데이터 27건 + Storybook 카탈로그 | 중 |
| 4 | [로컬 AI](./04-local-ai-simulation.md) | T1/T2/T3 + 상태관리 + 라우팅 + Export | 대 |
| 5 | [Supabase 연동](./05-supabase-integration.md) | DB 6테이블 + Auth + Storage + 실운영 | 중 |

---

## 3. 각 Stage 공통 구조 (6 블록)

모든 Stage 문서는 다음 6 블록으로 되어 있다:

1. **이번 Stage에서 만드는 것** — 30초 요약
2. **프리뷰 — 이번에 만질 것** — 문서/데이터/컴포넌트/AI/DB 항목 표
3. **설계 기준 (Spec)** — Stage에서 지킬 규칙
4. **실습 순서** — Step 1, 2, 3 … 으로 순차 진행
5. **체크리스트** — 완료 기준
6. **이 Stage의 배경 이력** — "원래 프로젝트에서는 이렇게 흘러갔다" 짧은 단락 (강사 설명용)

---

## 4. 재배치 원칙 (3가지)

### A. 시간 → 주제 (Timeline → Topic)
"나중에 한 작업이라도 같은 성격"은 해당 Stage로 당겼다.
- 022 (디자인 QA) → Stage 1로 당김
- 013 (태그 재설계) → Stage 3 (처음부터 최종 스키마)
- 023 (T1/T3 재정의) → Stage 3·4로 분산 (처음부터 최종 역할)
- 024 (concurrency / race fix) → Stage 4·5로 분산

### B. 프리뷰 우선 (Preview-First)
Stage 진입 시 **"이번에 만질 것"** 을 먼저 본다. 강사는 슬라이드로, 학습자는 목차처럼.

### C. 최종 모습만 가르친다 (Final-State Teaching)
태그는 처음부터 **중첩**. T1은 처음부터 **extracted 추출**. T3는 처음부터 **text-only**. "한 번 잘못 만들고 고침" 이력은 각 Stage 끝 부록에서만 언급.

---

## 5. 기획 기준 문서 (같이 배포됨)

각 Stage의 Step 1~3에서 학습자가 만들 기획 문서는 **이 패키지의 `planning/`** 폴더에 최종본 예시가 들어 있다.

| 문서 | 어느 Stage에서 사용 |
|---|---|
| [planning/01-project-summary.md](../planning/01-project-summary.md) | Stage 1 Step 1 |
| [planning/02-ux-flow.md](../planning/02-ux-flow.md) | Stage 1 Step 2 · Stage 2 전반 |
| [planning/03-visual-direction.md](../planning/03-visual-direction.md) | Stage 1 Step 3 |
| [planning/04-db-schema.md](../planning/04-db-schema.md) | Stage 5 |
| [planning/backend-integration-plan.md](../planning/backend-integration-plan.md) | Stage 5 |
| [planning/backend-integration-tutorial.md](../planning/backend-integration-tutorial.md) | Stage 5 |

**사용법**: 학습자가 직접 작성해보고, 막힐 때 `planning/`의 최종본과 비교.

---

## 6. 전제 조건 — 프로젝트 공용 워크플로우

이 커리큘럼은 **starter-kit 프로젝트의 공용 Skill·룰이 이미 설치된 환경**을 전제한다. 구체적으로:

| 항목 | 위치 | 역할 |
|---|---|---|
| `CLAUDE.md` (프로젝트 루트) | 프로젝트에 이미 존재 | Skill 호출 규칙 정의 |
| `.claude/rules/` | 프로젝트에 이미 존재 | code-convention, design-system, directory-structure, mui-grid-usage |
| `.claude/skills/project-planning/` | 프로젝트에 이미 존재 | Stage 1 기획 문서 워크플로우 |
| `.claude/skills/component-work/` | 프로젝트에 이미 존재 | Stage 2 컴포넌트·스토리 워크플로우 |
| `.claude/skills/supabase-integration/` | 프로젝트에 이미 존재 | Stage 5 DB·인증·RLS 워크플로우 |
| `.claude/skills/convert-external/` | 프로젝트에 이미 존재 | 외부 컴포넌트 이식 시 |

**이 패키지에는 이들 파일을 포함하지 않는다.** 이미 대상 프로젝트에 동일한 형태로 존재하기 때문. 만약 대상 프로젝트에 없다면 starter-kit에서 복사해 먼저 설치해야 한다.

커리큘럼 본문에서 `/project-planning`, `/component-work`, `/supabase-integration` 같은 Skill 호출이 언급되면 위 `.claude/skills/` 의 해당 Skill을 가리킨다.

---

## 7. 학습 흐름 (권장)

**강사 관점**:
1. 이 OVERVIEW로 전체 지도 공유
2. Stage 1 실습 → 끝 부록의 "원래는 이랬다" 이야기
3. Stage 2~5 순서대로

**자습 관점**:
1. OVERVIEW 먼저 읽기
2. 각 Stage 앞에서 ①②③ (요약+프리뷰+Spec) 훑기
3. Step 따라 실습
4. 체크리스트로 완료 확인

---

**다음 문서**: [Stage 1. 기획 + 디자인 시스템 세팅](./01-planning-and-design-system.md)
