# DESIGN.md (alpha) — 발췌 사본

> 출처: https://github.com/google-labs-code/design.md (Google Labs, 2026-04 공개 알파 사양)
> 본 문서는 MUSE T3 **system 모드** 의 산출물 포맷이 따라야 할 **고정된 참조본**이다.
> upstream spec 갱신 발견 시 이 파일을 갱신하고 호환 영향 범위를 코드에 반영한다.
>
> **2026-04-29 변경**: 기존 `handoff` 모드 폐기 — system 모드가 ZIP export (DESIGN.md + DTCG + decision-trace + refs) 까지 흡수. 본문에 남은 `system` / `handoff` 듀얼 표기는 모두 현 시점 기준 `system` 으로 읽으면 됨 (handoff 컬럼은 이력 보존).

---

## 1. 파일 구조 (2-layer)

DESIGN.md 파일은 두 계층으로 구성된다.

```
[YAML front matter]   ← 머신 판독용 토큰 (정확한 값)
---                   ← 분리 펜스
[Markdown body]       ← 사람·LLM 판독용 근거 / 적용 가이드
```

핵심 원칙: **토큰 = "무엇" / prose = "왜·언제 적용"**.
이 분리가 LLM 이 토큰을 그냥 베끼지 않고 의도에 맞게 적용하게 하는 장치.

---

## 2. YAML front matter — 토큰 키마

### 필수 (required)

| 키 | 타입 | 비고 |
|---|---|---|
| `name` | string | 프로젝트명 / 시스템명 |

### 권장 / 선택

| 키 | 타입 | 비고 |
|---|---|---|
| `version` | string | 예: `"alpha"` |
| `description` | string | 한 문장 의도 |
| `colors.<id>` | hex string | `"#RRGGBB"` |
| `typography.<id>` | object | `{ fontFamily, fontSize, fontWeight?, lineHeight?, letterSpacing? }` |
| `spacing.<scale>` | dimension | `"8px"` 또는 number (px) |
| `rounded.<scale>` | dimension | `"4px"` 등 |
| `components.<name>` | object | `{ backgroundColor?, textColor?, typography?, rounded?, padding?, size?, height?, width? }` 의 일부 |

### Token reference 문법

components 의 값은 다른 토큰을 참조한다:

```
"{colors.primary}"          → colors.primary 의 값
"{typography.h1}"           → typography.h1 객체 전체
"{rounded.sm}"              → rounded.sm 의 dimension
```

규칙:
- path 는 점 표기법, 중괄호로 감싼 string
- path 의 첫 segment 는 token 그룹 (`colors`/`typography`/`spacing`/`rounded`)
- dangling reference (없는 path) 는 invalid

### Vendor extensions

spec 에 정의되지 않은 키는 `x-` 접두로 둔다 (DTCG vendor namespace 컨벤션 차용):

```yaml
x-gradient:
  hero-fade: "linear-gradient(180deg, #14132B 0%, #2D2A4A 100%)"
x-elevation:
  - id: "elev-1"
    shadow: "0 1px 2px rgba(0,0,0,0.08)"
```

표준 도구는 `x-*` 키를 무시한다. 내부 도구는 자유롭게 활용한다.

---

## 3. Markdown prose — canonical 섹션

다음 8 섹션을 사용한다. **있는 섹션만 쓰되, 쓸 거면 이 순서를 지킨다.**

1. `## Overview` — 브랜드 철학, 스타일 방향
2. `## Colors` — 팔레트 의도
3. `## Typography` — 폰트 선택 근거
4. `## Layout` — spacing / structure 가이드
5. `## Elevation & Depth` — shadow, depth 레이어 (없으면 섹션 자체 생략)
6. `## Shapes` — radius, 기하 원칙
7. `## Components` — UI 요소 사양 / 적용 패턴
8. `## Do's and Don'ts` — 권장 / 금지 패턴

---

## 4. 완전한 예시 (alpha 권장 골격)

```markdown
---
version: "alpha"
name: "Heritage"
description: "Premium minimalist design system"
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  tertiary: "#B8422E"
  neutral: "#F7F5F2"
typography:
  h1:
    fontFamily: "Public Sans"
    fontSize: "3rem"
    fontWeight: 700
  body-md:
    fontFamily: "Public Sans"
    fontSize: "1rem"
spacing:
  sm: "8px"
  md: "16px"
rounded:
  sm: "4px"
  md: "8px"
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.neutral}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
---

## Overview
Architectural minimalism meets journalistic gravitas.

## Colors
- Primary (#1A1C1E): Headlines and core text
- Secondary (#6C7278): Borders and metadata
- Tertiary (#B8422E): Call-to-action accent
- Neutral (#F7F5F2): Warm foundation

## Typography
Public Sans serves headlines and body for legibility.

## Components
button-primary uses tertiary accent on neutral backgrounds.

## Do's and Don'ts
**Do**
- 검은 잉크 톤을 본문에 사용
**Don't**
- tertiary 강조색을 본문 텍스트에 쓰지 말 것
```

---

## 5. MUSE 적용 매핑 (T3 → DESIGN.md)

### system 모드

| MUSE | DESIGN.md |
|---|---|
| `tokens.color` | `colors` (hex 전용 평탄화) |
| `tokens.typography` | `typography` (variant → key 매핑: h1/h2/body1/...) |
| `tokens.layout (kind: grid\|container)` | prose `## Layout` 섹션 본문 |
| `tokens.spacing` (★신규) | `spacing` |
| `tokens.rounded` (★신규) | `rounded` |
| `tokens.elevation` (★신규, optional) | `x-elevation` + prose `## Elevation & Depth` |
| `tokens.gradient` | `x-gradient` |
| `tokens.components` (★신규, REQUIRED) | `components` (token-ref 문법 강제) |
| `visualDirection.markdown` | prose 8 섹션 분배 |

### handoff 모드

system 출력 + `layerDetails` (8 키, 한글) 가 prose 섹션 본문을 대체 / 보강한다.

---

## 6. Strictness 정책 (MUSE 결정)

| 항목 | system | handoff |
|---|---|---|
| Token reference 문법 (`{path}`) | 1회 retry → fallback (components 빈 객체) | strict (실패 시 에러 표면화) |
| Token id 컨벤션 | semantic (자유) | kebab-case 강제 |
| `decisionRationale` | 권장 | 모든 토큰 필수 |
| Components 최소 개수 | 3 | 3 |
| Elevation | optional | optional |
