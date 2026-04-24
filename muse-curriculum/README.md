# MUSE 실습 교육자료 패키지

바이브 코딩으로 **MUSE 프로젝트(레퍼런스 기반 디자인 토큰 추출 도구)를 처음부터 끝까지 재현**하는 교육용 자료 묶음. 다른 프로젝트 환경으로 통째 복사해서 사용할 수 있게 구성되어 있다.

- 완성본: https://vdl-online-3rd-muse-completed.vercel.app/
- 완성본 스토리북: https://vdl-online-3rd-muse-completed-i7x9.vercel.app/?path=/story/overview-for-designers--doc

---

## 0. 왜 이 자료가 필요했나 (기획 배경)

MUSE 프로젝트의 원본 작업 로그는 24개짜리 **시간 순 기록**이다. 그대로 교육에 쓰면 세 가지 문제가 있다:

1. **재설계 이력이 중간에 끼어든다** — 예: 태그 구조는 `flat → 중첩`으로 한 번 갈아엎혔다. 로그를 순서대로 배우면 잘못된 중간 상태를 먼저 학습하게 된다.
2. **버그픽스가 별도 로그로 분리돼 있다** — race, concurrency 제한, 썸네일 매핑 같은 것은 원래 기능 설명에 합쳐야 맥락이 맞는데 뒤로 밀려 있다.
3. **디자인 QA가 마지막에 몰려 있다** — `elevation=0`, hover 최소, placeholder 전환 같은 전역 규칙은 토큰 세팅 시점에 같이 정해졌어야 하는데, 컴포넌트 다 만든 뒤에 잡혔다.

그래서 이 자료는 **시간 순 로그를 버리고**, "애초에 같이 했으면 좋았을 작업을 함께 묶어" **학습 순서로 재배치**했다. 구성:

- **5 Stage**(기획+디자인시스템 → 컴포넌트 → 데이터 → 로컬 AI → Supabase)로 재그루핑
- **각 Stage 시작 시 프리뷰** — 이번에 만질 문서·데이터·컴포넌트·AI 태스크·DB 테이블을 먼저 보여줌
- **최종 모습만 가르친다** — 재설계 이력은 Stage 끝의 배경 이력 박스에서만 언급

**용도**: 동일 MUSE 실습을 처음부터 재현하는 **프레젠테이션 교재**. 이 README + curriculum/00-OVERVIEW.md 가 슬라이드 구성의 시드로 쓰인다.

---

## 1. 시작하기

1. **[curriculum/00-OVERVIEW.md](./curriculum/00-OVERVIEW.md)** 를 먼저 읽는다 — 5 Stage 지도.
2. Stage 1부터 순서대로 진행 (역순 불가).
3. 각 Stage 시작 시 ①요약 → ②프리뷰 → ③Spec 을 먼저 훑고 실습에 들어간다.

## 2. 패키지 구성

```
muse-curriculum/
├── README.md               ← 이 문서 (패키지 진입)
├── curriculum/             ← 메인 교재 (5 Stage 재구성)
│   ├── 00-OVERVIEW.md
│   ├── 01-planning-and-design-system.md
│   ├── 02-ux-flow-and-components.md
│   ├── 03-data-assembly.md
│   ├── 04-local-ai-simulation.md
│   └── 05-supabase-integration.md
└── planning/               ← 기획 기준 문서 최종본
    ├── 01-project-summary.md
    ├── 02-ux-flow.md
    ├── 03-visual-direction.md
    ├── 04-db-schema.md
    ├── backend-integration-plan.md
    └── backend-integration-tutorial.md
```

### curriculum/ — 메인 교재
5 Stage로 구성된 실습 커리큘럼. 각 Stage = 프레젠테이션 1섹션 단위. 원본 프로젝트의 실제 진행 시간순이 아니라, **학습 순서로 재배치**되어 있다 (재설계 이력과 버그픽스를 원래 기능에 흡수).

### planning/ — 기획 기준 문서
Stage 1의 Phase 1~3 기획과 Stage 5의 DB 설계가 최종 완성된 모습. 학습자가 기획을 직접 작성하다 막힐 때 비교용 참고 답안으로 사용.

---

## 3. 전제 조건 — 프로젝트 공용 워크플로우

이 패키지는 **starter-kit 기반 프로젝트의 공용 Skill·룰이 이미 설치된 환경**을 전제한다. 패키지에는 포함하지 않으며, 대상 프로젝트에 다음이 있어야 한다:

| 항목 | 경로 | 역할 |
|---|---|---|
| 프로젝트 루트 지침 | `CLAUDE.md` | Skill 호출 규칙 |
| 코드·디자인 룰 | `.claude/rules/` | code-convention, design-system, directory-structure, mui-grid-usage |
| 기획 Skill | `.claude/skills/project-planning/` | Stage 1 기획 문서 워크플로우 |
| 컴포넌트 Skill | `.claude/skills/component-work/` | Stage 2 컴포넌트·스토리 워크플로우 |
| 백엔드 Skill | `.claude/skills/supabase-integration/` | Stage 5 DB·인증·RLS 워크플로우 |
| 외부 코드 변환 Skill | `.claude/skills/convert-external/` | 외부 컴포넌트 이식 시 |
| 작업 로그 Skill | `.claude/skills/work-log/` | (선택) 진행 로그 기록 |

커리큘럼 본문에서 **`/project-planning`**, **`/component-work`**, **`/supabase-integration`** 같은 호출이 언급되면 위 Skill을 가리킨다.

대상 프로젝트에 이들이 없다면 starter-kit에서 먼저 복사해 설치하라. 이 패키지는 워크플로우 자체를 재정의하지 않는다.

---

## 4. 사용 시나리오

### 강사용
1. 이 README로 청중에게 전체 지도 공유
2. `curriculum/00-OVERVIEW.md`의 5 Stage 구조 설명
3. Stage별 ②프리뷰로 "이번에 뭘 만질지" 미리 보여주기
4. 실습 후 Stage 끝의 **⑥ 이 Stage의 배경 이력** 으로 "실제로는 이런 시행착오가 있었다" 설명

### 자습용
1. `curriculum/00-OVERVIEW.md` 먼저 읽기
2. 각 Stage ① → ② → ③ 훑고 실습 진입
3. Step 순서대로 따라가며 체크리스트 완료
4. 기획 문서 작성하다 막히면 `planning/` 최종본과 비교

---

## 5. 다른 프로젝트에 설치하는 법

1. 이 `muse-curriculum/` 폴더 통째 복사.
2. 대상 프로젝트 루트 또는 `docs/` 하위 어디든 배치 (권장: `docs/muse-curriculum/`).
3. §3 전제 조건의 Skill·룰이 대상 프로젝트에 있는지 확인.
4. 없으면 starter-kit에서 `.claude/` + `CLAUDE.md` 먼저 설치.
5. `curriculum/00-OVERVIEW.md` 링크 공유.

패키지 내부 링크는 전부 **상대 경로**라서 어디에 두든 동작한다.

---

## 6. 이 자료가 포함하지 않는 것

- **원본 작업 로그 (001~024)** — 시간순 진행 기록. 실습 교재로는 재구성된 curriculum이 더 적합해서 제외.
- **사후 분석 문서** (ANALYSIS / PHASE-CARDS / REPRODUCE-FAQ) — 분석자 관점이라 실습 진행용에는 과함.
- **프로젝트 공용 Skill·룰** — 이미 대상 프로젝트에 있다고 가정 (§3).

원본 이력이나 사후 분석이 필요하면 starter-kit 리포지토리의 `docs/work-log/` 참조.

---

## 7. 핵심 설계 메시지 (Stage별 한 줄)

| Stage | 메시지 |
|---|---|
| 1 | **테마는 한 번에 끝낸다.** 전역 UI 규칙까지 토큰 세팅 시점에 같이 결정. |
| 2 | **primitive부터, 공통 컴포넌트 API 확장 대신 호출측 어댑터.** |
| 3 | **데이터 스키마는 처음에 확정한다.** 돌이킬 수 없다. |
| 4 | **실 백엔드 전에 로컬에서 AI 플로우를 완결한다.** |
| 5 | **공개 API는 불변, 내부만 교체.** |
