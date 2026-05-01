---
name: project-planning
description: Creates structured planning documents (project-summary, ux-flow, visual-direction) in docs/ for new feature or project initiatives. Owns the single source of truth for the data model (ux-flow § Data Model + § Data Model Dictionary).
when_to_use: When user explicitly invokes /project-planning. Do not auto-activate. Wait for direct user invocation.
user-invocable: true
disable-model-invocation: true
---

# Project Planning Skill

> 기획 문서 (project-summary → ux-flow → visual-direction) 를 순차 작성하는 워크플로우.
> **데이터 모델의 단일 진실 원천은 이 스킬이 소유**. ux-flow 의 "데이터 모델 활용" 이 `/supabase-integration` 의 유일한 입력.

## 활성화 조건

| 의도 | 트리거 예시 |
|------|-----------|
| 기획 시작 | "기획 문서 작성해줘", "프로젝트 계획", "새 기능 기획" |
| 개별 문서 | "project-summary 작성", "ux-flow 만들어줘", "visual-direction" |
| 이어서 작성 | "다음 단계 진행해줘", "ux-flow 이어서" |
| 데이터 모델 갱신 | "데이터 모델 추가해줘", "사전 갱신", "ux-flow 데이터 손봐" |

같은 호출 (`/project-planning`) 로 첫 작성 / 갱신 / 데이터 모델 변경 모두 처리. 사용자가 서브명령을 외울 필요 없음. 스킬이 기존 문서 유무를 확인해 자동 분기.

---

## 워크플로우

### 전체 흐름

```
Phase 1          Phase 2 (데이터 모델 단독 소유)   Phase 3
project-summary → ux-flow                       → visual-direction
     │                │                              │
  [승인 게이트]    [승인 게이트 · 3 단답 체크]       [승인 게이트]
```

### Phase 1: project-summary

1. 사용자에게 프로젝트 목적/범위 질문
2. `resources/doc-templates.md` Read → project-summary 템플릿 확인
3. `docs/{project-name}/01-project-summary.md` 작성
   - 프로젝트명, 목적, 핵심 기능 개조식
   - 대상 사용자, 기술적 제약사항
4. **승인 게이트**: 사용자에게 요약 제시 → 수정/승인

### Phase 2: ux-flow (데이터 모델 단독 소유)

**Phase 1 승인 후에만 진행**

1. `docs/{project-name}/01-project-summary.md` Read (승인된 문서)
2. `resources/doc-templates.md` Read → ux-flow 템플릿 확인
3. `component-work/resources/components.md` Read → 기존 컴포넌트 확인
4. `component-work/resources/taxonomy-index.md` Read → 카테고리 매핑
5. `docs/{project-name}/02-ux-flow.md` 작성. **문서 성격 = 프로젝트 초반 가이드** (현 상태 리포트가 아님). 디자이너가 "이 프로젝트에서 어떤 데이터를 어떻게 다루는지" 처음 이해하는 단계.
   - **본문**: 자연어 / 표. SQL · 컬럼 · 제약 · 백엔드 의존성 등장 금지.
   - **부록**: 컴포넌트 상세 표 → `appendix-screen-component-map.md`.
   - **본문 섹션 순서 (강제)**:
     1. 유저 시나리오 (3~5개. 4줄 양식: 사용자 / 목표 / 흐름 / 다루는 데이터)
     2. **데이터 모델** (카드 only). 시나리오에서 등장한 데이터를 정의 → UX-flow 가 그걸 단계별로 풀어쓸 수 있게 됨.
     3. **UX-flow** (시나리오를 데이터 관점에서 단계별로 쪼갠 서사. 각 단계의 페이지·사용자 행동·발생 데이터·결과)
     4. 페이지 리스트 (페이지 / 경로 / 한 줄 설명 / 다루는 데이터)
     5. **데이터 모델 활용** (`/supabase-integration` 의 유일한 입력. 데이터명 ↔ 테이블명 1:1 매핑)
     6. 컴포넌트 리스트 (신규만. 기존 디자인 시스템에 없는 것)
     7. 참조
   - **금지**: ~~UX 플로우 mermaid flowchart~~ (UX-flow 단계별 서사가 흡수). ~~정보 구조 (IA) 트리~~ (페이지 리스트가 흡수). ~~데이터 모델 관계도 (erDiagram)~~ (초반 가이드에 ER 부담). ~~화면 ↔ 데이터 매트릭스~~ (사전이 같은 정보 제공). ~~외부 의존성 핀~~ (초반에 백엔드 언급 시기상조). ~~Supabase / Anthropic API / Storage / Auth 같은 백엔드 용어~~ 본문 등장 금지.
6. **승인 게이트**: 3 단답 체크
   - "데이터 모델 카드 N종 OK?"
   - "데이터 모델 활용 OK?"
   - "UX-flow 단계별 서사 OK?"

7. **Storybook 미러 자동 생성** (승인 후 자동):
   - `02-ux-flow.md` → `src/stories/overview/{project}-planning/02-ux-flow.mdx`
   - `appendix-screen-component-map.md` 가 분리됐다면 → `src/stories/overview/{project}-planning/appendix-screen-component-map.mdx`
   - 양식: 1줄 import + `<Meta title="Overview/{Project} Planning/..." />` + `<Markdown>{raw}</Markdown>`
   - 이미 .mdx 가 있으면 sidebar 경로만 갱신, 아니면 신규 생성

#### UX-flow 섹션 규약 (NEW, 강제)

시나리오를 **데이터 관점에서 단계별로 쪼개** 자연어로 서술. 데이터 모델 카드의 "만드는 곳" 이 왜 그 페이지인지의 근거가 됨.

양식:
```
### 시나리오 N 단계별

1. **{단계 이름}** ({페이지명})
   - 사용자 행동: {한 줄}
   - 발생하는 데이터: `{데이터명}` W (생성) / R (읽기) / D (수정)
   - 결과: {다음 단계로 가는 트리거}

2. ...
```

#### 데이터 모델 섹션 규약 (CRITICAL, 강제)

ux-flow 의 "## 데이터 모델" 섹션은 **카드만**으로 구성. 사전은 별도 섹션 (§ 데이터 모델 활용) 으로 분리. 관계도/매트릭스/외부 의존성 핀 폐기.

**데이터 모델 카드**. 데이터 하나당 1 카드. **4 항목 양식 강제**:
- 1줄 설명
- **보이는 페이지**: {페이지명 1~3개}
- **만드는 사람**: 사용자 / AI / 시스템 (한 단어)
- **만드는 곳**: {페이지명 1개}
- 금지: SQL/필드 나열, 수명, 비고, "엔티티" / "M:N" / "FK" / "TTL" 같은 개발 용어, 백엔드 용어.

#### 데이터 모델 활용 섹션 규약 (CRITICAL, 강제)

**페이지 리스트 바로 아래** 위치. **`/supabase-integration` 의 유일한 입력**. 컬럼: 데이터명 (PascalCase) / 한국어 / 코드 식별자 / 예상 테이블명 / 생성 책임 페이지. 표 위에 한 줄 주석으로 계약 명시.

**예상 테이블명 충돌 검증** (강제):
- `resources/sql-reserved-words.md` Read.
- 사전 작성·갱신 시 "예상 테이블명" 컬럼이 PG 예약어 또는 흔한 충돌 단어 (`references` / `user` / `order` / `group` 등) 와 일치하는지 자동 grep.
- 충돌 발견 즉시 사용자에게 대안 제안 (`references` → `reference_items`, `order` → `orders` 등). 사용자가 거부하지 않는 한 자동 적용.
- Supabase 예약 스키마 (`auth.*`, `storage.*`, `realtime.*`) 는 `auth.users` 만 허용 (Supabase 내장 표기). 그 외는 차단.

#### 컴포넌트 리스트 규약 (NEW, 강제)

본문에 **신규 컴포넌트만** 표시. 재활용/수정은 본문 등장 금지 (디자이너 의사결정 무관).

| 컴포넌트 | 카테고리 | 한 줄 용도 |
|---|---|---|
| ... | ... | ... |

상세 양식은 `resources/doc-templates.md`.

### Phase 3: visual-direction

**Phase 2 승인 후에만 진행** (Phase 1 만으로도 작성 가능, 사용자 요청 시)

1. `docs/{project-name}/01-project-summary.md` Read
2. `resources/doc-templates.md` Read → visual-direction 템플릿 확인
3. `component-work/resources/mui-theme.md` Read → 현재 토큰 확인
4. `docs/{project-name}/03-visual-direction.md` 작성:
   - 디자인 토큰 커스텀 방향 (색상, 타이포, 간격)
   - 현재 테마 대비 변경 필요 사항
   - 레퍼런스 이미지/사이트 목록 (사용자 제공)
   - 톤앤매너 키워드
5. **승인 게이트**: 사용자에게 제시 → 수정/승인

### 개별 문서 직접 작성

사용자가 특정 Phase 만 요청할 수 있음:
- "ux-flow 만 작성해줘" → 기존 project-summary 확인 후 Phase 2 진행
- 기존 project-summary 가 없으면 → Phase 1 부터 시작하도록 안내

### 데이터 모델 갱신 (재호출 시 자동 분기)

이미 `02-ux-flow.md` 가 있고 사용자가 "데이터 추가/이름 변경/사전 갱신" 류 요청을 하면:
1. 기존 ux-flow 의 2 컴포넌트 (카드 / 사전) + UX-flow 단계별 서사 읽기
2. 영향 받는 부분만 수정 (전체 재작성 금지)
3. 정합성 자동 검증 (사전 ↔ 카드 ↔ UX-flow 단계별 서사의 데이터명 글자 단위 일치)
4. 변경 요약 + 3 단답 체크로 승인
5. 사용자에게 안내: "이 변경은 `/supabase-integration` 을 다시 호출해야 data-bridge / appendix 가 동기화됩니다."

---

## Resources

| 파일 | 용도 | 언제 Read |
|------|------|----------|
| `doc-templates.md` | 3 개 문서 유형 템플릿 + ux-flow 데이터 모델 섹션 양식 | 각 Phase 시작 시 |
| `sql-reserved-words.md` | PG 예약어 + 흔한 충돌 단어 + 권장 대안 | Phase 2 사전 작성/갱신 시 |

### 참조하는 외부 리소스 (복제하지 않음)

| 파일 | 위치 | 언제 Read |
|------|------|----------|
| `components.md` | `component-work/resources/` | Phase 2 (재활용성 확인) |
| `taxonomy-index.md` | `component-work/resources/` | Phase 2 (카테고리 매핑) |
| `mui-theme.md` | `component-work/resources/` | Phase 3 (현재 토큰 확인) |

---

## 핵심 원칙

- **데이터 모델은 ux-flow 단독 소유**. `/supabase-integration` 은 이 문서를 읽기만. 직접 수정 금지. 구현 제약은 보고만 가능, 사용자가 다시 `/project-planning` 을 호출해 ux-flow 를 갱신해야 함.
- **본문은 쉬운 설명, 디테일은 부록**. 분량은 필요한 만큼. 본문에 SQL/컬럼/제약 표가 보이면 안 됨. 컴포넌트 상세 표는 `appendix-screen-component-map.md` 로 분리.
- **어려운 용어 금지**. "엔티티" / "M:N" / "FK" / "TTL" 같은 개발 용어 본문 등장 금지. 한국어로 풀어쓰기.
- **flowchart 다이어그램 금지** (UX 플로우 mermaid). 시나리오 흐름 1줄 + 화면-데이터 매트릭스로 흐름 표현. mermaid 는 관계도 (`erDiagram`) 만 허용.
- **시나리오 = 데이터 관점의 서사**. 각 시나리오 양식에 "다루는 데이터" 줄 강제. 어떤 데이터가 W (생성/수정), 어떤 게 R (읽기) 인지 명시.
- **승인 게이트는 3 단답 체크**. 모호한 "맞나요?" 금지. 디자이너가 ✅/❌ 로 답할 수 있는 3개 질문만.
- **승인 없이 다음 Phase 진행 금지**. 각 Phase 는 독립적 승인 단위.
- **개조식 우선**. 기획 문서는 산문보다 구조화된 목록/표.
- **기존 컴포넌트 재활용 우선**. ux-flow 의 컴포넌트 리스트에서 반드시 기존 것 먼저 확인.
- **레퍼런스 이미지는 사용자 제공**. Claude 가 임의로 URL 생성하지 않음.
