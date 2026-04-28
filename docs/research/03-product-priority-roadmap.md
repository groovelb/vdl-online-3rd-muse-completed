# MUSE 제품 우선순위 재정렬 (정성 리서치 기반)

> 작성일: 2026-04-27
> 근거: `01-design-md-painpoints-raw.md` (52건 출처) + `02-painpoints-qualitative-analysis.md` (4 super-themes, 18 클러스터)
> 목적: MUSE 현재 코드베이스 + 페인포인트 검증 결과 → 무엇을 다음에 만들지 ROI 기반 결정
> 제약: 6개월 시장 속도 (Figma Config 2025 Q3 출시, getdesign.md 60+ 누적, Stitch DESIGN.md 오픈소스)

---

## 0. 의사결정 프레임

각 작업은 다음 4축으로 평가:

1. **Pain Severity (P)** — 페인포인트 강도 (가설 ★★★★★ ~ ★)
2. **Differentiation (D)** — 시장 차별성 (있음/약함/공백)
3. **Effort (E)** — MUSE 코드베이스 기반 구현 비용 (S/M/L/XL)
4. **Defensibility (F)** — 6개월 후 모방 어려움 (높음/중간/낮음)

**ROI = P × D × F / E**. 단순 산식이지만 정렬에 충분.

---

## 1. 작업 후보 매트릭스

| # | 작업 | P (페인) | D (차별) | E (비용) | F (방어) | 코드 현황 | ROI |
|---|---|---|---|---|---|---|---|
| **W1** | `sourceReferenceIds` 추적 UI 가시화 | ★★★★★ (T1) | 공백 | S | 높음 | ✅ 데이터 이미 존재 (`extracted` 필드) | **⭐ 9.5** |
| **W2** | DTCG W3C tokens.json export | ★★★★ (C5+C7) | 표준 진입 | M | 중간 | ⚠️ ThemeExportDialog 확장 | **⭐ 8.5** |
| **W3** | DESIGN.md format export | ★★★ (호환성) | 표준 진입 | S | 낮음 | ⚠️ T3 visualDirection.markdown 확장 | **⭐ 7** |
| **W4** | 레이어별 가중치 UI (ref-A 컬러만) | ★★★★ (E+T4) | 시장 갭 #3 | M | 높음 | ❌ 신규 | **⭐ 8** |
| **W5** | `decision-trace.md` export (출처 + 의도) | ★★★★★ (T1) | 공백 | M | 높음 | ⚠️ T3 데이터 활용 | **⭐ 9** |
| **W6** | 토큰 변경 시 영향 검증 (contrast/hierarchy) | ★★★ (C5+C18) | 부분 점유 | L | 중간 | ❌ 신규 | **⭐ 6** |
| **W7** | KRDS 호환 모드 (한국 시장) | ★★★ (D+C15) | 한국 진입 | L | 중간 | ❌ 신규 | **⭐ 5** |
| **W8** | MUI export 강화 (현재 ThemeExportDialog) | ★★★★ (C7) | 블루오션 | S | 중간 | ✅ 이미 있음, 보강 | **⭐ 8** |
| **W9** | 다중 레퍼런스 의도 텍스트 강화 | ★★★★ (E) | 부분 | S | 중간 | ✅ T2 활용 | **⭐ 7** |
| **W10** | T1.title 폐기 + 사용자 placeholder | ★★ | 없음 | S | 낮음 | ✅ 단순 변경 | **⭐ 4** |
| **W11** | 제3자 도구 호환 plugin (Cursor·Claude Code rule) | ★★★★ (C2) | 표준 진입 | M | 낮음 | ❌ 신규 | **⭐ 6** |
| **W12** | Figma import (협업 보강) | ★★★ (C8+C9) | 시장 따라잡기 | XL | 낮음 | ❌ 신규 | **⭐ 3** |
| **W13** | 무드보드 그리드 UI 재디자인 (큐레이션 강화) | ★★★ (E) | 부분 | M | 중간 | ⚠️ ArchivePage 보강 | **⭐ 5** |
| **W14** | T2 → 룰베이스 폴백 (소규모 아카이브) | ★★ | 없음 | S | 낮음 | ✅ ProjectCreateRoute 수정 | **⭐ 5** |
| **W15** | Schema-strict tool 출력 강조 (vibe 아님) | ★★★★★ (T1+T2) | 직격 차별 | S | 높음 | ✅ 이미 그렇게 동작 — UI/카피만 노출 | **⭐ 9** |

---

## 2. 우선순위 그룹 (P0~P3)

### 🔴 P0 — 즉시 (1~2주, MVP 직격)

#### W1. `sourceReferenceIds` 추적 UI (ROI 9.5)
**왜**: 김은수 ZDNet 인용 ("결과는 있지만 이유가 빠져 있는 구조") 직격. 시장 전체에 없는 자리.
**현재**: `aiTasks.js:565` 에 `sourceReferenceIds` 필드 정의됨, T3 시스템 프롬프트도 이걸 채우라 지시. 단 ProjectDetailPage UI에서 가시화 안 함.
**구현**:
```jsx
// ColorSwatchList 토큰 카드 hover 시 표시
primary: #14132B
└── 출처: ref-002, ref-005 (썸네일 inline)
└── 의도 매칭: "차분한 다크 무드" → 짙은 색 우선
```
**기간**: 3~5일 (1 컴포넌트 + 데이터 흐름 확인)

#### W5. `decision-trace.md` export (ROI 9)
**왜**: ZIP export에 토큰만이 아닌 **결정 로그**를 함께 포함. DESIGN.md 시장에 없는 산출물.
**현재**: T3 출력 (`tokens` + `visualDirection.markdown`) 에 출처 정보 분산되어 있음.
**구현**:
```markdown
# Design Decision Trace
## Why this primary color?
Source: ref-002 (dominantColors[0]) + ref-005 (palette[1])
Intent match: "차분한 다크 무드" → 채도 낮고 명도 낮은 색 선호
Alternative considered: ref-013 #4F46E5 (rejected: 채도 너무 높음)
```
**기간**: 5~7일

#### W15. Schema-strict 차별 카피 노출 (ROI 9)
**왜**: 코드는 이미 schema-strict tool 사용 중. 단 UI/문서/마케팅에서 강조 안 함.
**현재**: `aiTasks.js` 의 `tool_choice: forced`, `quality criteria` 자동 검증 — Royarindam "prompt-conditioner not contract" 비판을 직접 회피하는 구조.
**구현**: 랜딩 카피 + AI Tasks 스토리북에 "Schema-strict: AI가 vibe 짐작 안 함" 섹션 추가.
**기간**: 2일

### 🟠 P1 — 다음 (2~4주, 시장 진입권)

#### W2. DTCG W3C tokens.json export (ROI 8.5)
**왜**: SeedFlip 유료 도구가 이미 점유. designmd.app 자체가 "MUI/Chakra Parity 없음" 인정 → DTCG는 표준 진입권.
**현재**: ThemeExportDialog 가 MUI theme JSON 만 출력. DTCG는 별도 schema 변환 필요.
**구현**: Export dialog에 "DTCG tokens.json" 옵션 추가. 변환 로직: `tokens.color[].{role, hex, group}` → DTCG `$type: color` schema.
**기간**: 7~10일

#### W4. 레이어별 가중치 UI (ROI 8)
**왜**: 시장 갭 #3 ("이 레퍼런스는 컬러만, 저건 레이아웃만"). MUSE 자체 메시지("선택적 판단")와 시스템이 일치해야 함.
**현재**: ProjectCreateWizard Step 2~3 에서 모든 selectedRefs를 동일 가중치로 던짐. T3 input에 레이어별 mask 없음.
**구현**: Step 2.5 신설 — 선택된 레퍼런스 카드별 5 레이어 체크박스. T3 prompt에 `useLayers: ['color', 'layout']` 같은 mask 추가.
**기간**: 10~14일

#### W8. MUI export 강화 (ROI 8)
**왜**: design-tokens.dev MUI 가이드 — "Manual TypeScript augmentation", "Shadow tokens 25-array sector mapping" 모두 자동화 안 됨. MUSE가 점유 가능한 블루오션.
**현재**: ThemeExportDialog가 기본 `createTheme` 출력. 단 typography augmentation, shadow 25-array, alpha-channel mainChannel 자동 처리 안 함.
**구현**:
- TypeScript augmentation 자동 생성 (`declare module '@mui/material/styles'`)
- Shadow array 25 entries 자동 패딩
- alpha-channel mainChannel 자동 처리
**기간**: 7~10일

### 🟡 P2 — 그 다음 (1~2개월, 경쟁 차별)

#### W3. DESIGN.md format export (ROI 7)
**왜**: getdesign.md 표준 호환 = AI 코딩 도구가 그대로 받음. 단 표준이 alpha 단계라 락인 우려.
**구현**: T3 `visualDirection.markdown` 을 designmd.app 9-section 포맷으로 변환:
1. Visual Theme & Atmosphere
2. Color Palette & Roles
3. Typography Rules
4. Component Stylings
5. Layout Principles
6. Depth & Elevation
7. Do's and Don'ts
8. Responsive Behavior
9. Agent Prompt Guide
**기간**: 5~7일

#### W9. 다중 레퍼런스 의도 텍스트 강화 (ROI 7)
**왜**: T2 의 `intent` 가 자유 텍스트 한 줄. 의도가 abstract하면 추천 품질 떨어짐 (이랜서 "abstract requests easily veer off course"). MUSE의 의도-합성 차별점이 의도 입력 품질에 종속.
**현재**: ProjectCreateWizard Step 1 form 단일 textarea.
**구현**: Step 1을 5개 차원으로 확장 — 무드 / 톤 / 사용자 / 맥락 / 제약. 각각 짧은 텍스트. T2 system prompt에 5개 차원 명시.
**기간**: 3~5일

### 🟢 P3 — 후순위 / 조건부 (3개월+)

#### W11. 제3자 도구 호환 plugin (ROI 6)
**왜**: Cursor `.cursorrules` / Claude Code `CLAUDE.md` rule 파일 자동 생성. 도입 friction 줄임.
**구현**: ZIP export에 `.cursorrules`, `CLAUDE.md` 포함 (MUSE 합성한 토큰 import 명시).
**기간**: 3~5일 (P2/P3 단순 작업)

#### W6. 토큰 검증 (contrast/hierarchy) (ROI 6)
**왜**: WCAG 자동 검증. tweakcn discussions에서 사용자가 직접 요청. Bitovi "accessibility 기본도 못 맞춤" 회피.
**기간**: 14~21일 (도구 통합)

#### W14. T2 룰베이스 폴백 (ROI 5)
**왜**: 아카이브 100장 미만에서 T2 가치 의문. 룰베이스 ("최근 N장 + 색상 유사") 로 비용 0.
**기간**: 3~5일

#### W7. KRDS 호환 모드 (ROI 5)
**왜**: 한국 시장 진입. velog/@hanui "처음부터 만드는 게 나을 수도" 직격. 단 시장 크기가 작고 조직 영업 필요.
**기간**: 14~21일 + KRDS 사양 학습

### ⚪ P4 — 폐기 / 보류

#### W10. T1.title 폐기 (ROI 4)
**왜**: 가치 낮고 사용자가 placeholder로 직접 입력 가능. 단 비용 절감 미미.
→ **보류**. 다른 작업과 묶어서 처리.

#### W12. Figma import (ROI 3)
**왜**: Figma Config 2025 Q3 발표가 이 영역 점유 예정. MUSE가 Figma 따라잡기 불리.
→ **포기**. "Figma는 협업, MUSE는 합성" 메시지로 전환.

#### W13. 무드보드 그리드 UI 재디자인 (ROI 5)
**왜**: 현재 ArchivePage 충분. 디자인 폴리싱은 P0~P1 끝난 후.
→ **보류**.

---

## 3. 추천 12주 로드맵 (3개월 압축)

### Sprint 1 (Week 1~2): 즉시 차별 메시지 가시화
- ✅ W1 sourceReferenceIds UI
- ✅ W15 Schema-strict 카피 + 스토리북 섹션
- ✅ W5 decision-trace.md export

→ **MVP 카피 완성 가능**: "AI가 디자인했지만 왜 그랬는지 모르는 시대를 끝낸다" 직격 증명.

### Sprint 2 (Week 3~5): 표준 진입 + 의도 입력 강화
- ✅ W2 DTCG export
- ✅ W9 5-dimension intent input

→ **시장 호환성 확보**: 외부 도구가 MUSE 출력을 import 가능. T2 추천 품질 ↑.

### Sprint 3 (Week 6~8): MUSE 시그니처 차별점 구현
- ✅ W4 레이어별 가중치 UI
- ✅ W8 MUI export 강화

→ **시장 단독 점유**: "ref-A에서 컬러만" + "MUI 자동 매핑" 둘 다 시장에 없음.

### Sprint 4 (Week 9~12): 호환성 마무리
- ✅ W3 DESIGN.md export
- ✅ W11 Cursor/Claude Code rule 파일
- ⚠️ W6 토큰 검증 (선택)

→ **6개월 시장 속도 대응**: Figma Config 2025 출시 전에 호환 표준 모두 점유.

### Stretch (Week 13+): 한국 시장 + 고급 검증
- W7 KRDS 호환 모드
- W6 contrast/hierarchy 검증
- 사용자 인터뷰 결과 반영

---

## 4. 의도적으로 안 하는 것 (포지셔닝 정직성)

### 안 함: 협업 / 실시간 멀티플레이어 (C8)
**이유**: Figma의 절대 강점. 이걸 따라잡으려면 다른 모든 차별점이 약해짐.
**대신**: "Figma는 협업, MUSE는 합성. 함께 쓰세요." 메시지.

### 안 함: 사진리얼 이미지 생성 (karozieminski 인용)
**이유**: Midjourney·Adobe Firefly 영역. MUSE는 토큰 합성에 집중.

### 안 함: Backend / DB 기능 (Lovable 영역)
**이유**: v0/Lovable 영역. 디자인 시스템 빌더로 정체성 유지.

### 안 함: 60+ 브랜드 라이브러리 (getdesign.md 영역)
**이유**: 그게 그들의 차별점. MUSE는 사용자 무드보드 기반이라 정반대.

---

## 5. 마일스톤 검증 지표

각 sprint 끝에 다음 검증:

### Sprint 1 후
- [ ] 랜딩 페이지 헤드라인 4가지 후보 A/B 테스트 가능 상태
- [ ] 스토리북 AI Tasks 페이지에 "Schema-strict + Decision Trace" 섹션 노출
- [ ] decision-trace.md sample 출력 5건 (다양한 의도)

### Sprint 2 후
- [ ] DTCG tokens.json 으로 외부 도구 (예: Style Dictionary) import 성공
- [ ] 5-dimension intent → T2 추천 품질 측정 (A/B: 자유 텍스트 vs 5차원)

### Sprint 3 후
- [ ] 레이어별 가중치 UI로 동일 레퍼런스 셋에서 다른 토큰 출력 확인
- [ ] MUI typescript 자동 augmentation으로 외부 프로젝트 import 무오류

### Sprint 4 후
- [ ] Cursor/Claude Code 에 ZIP 던졌을 때 토큰 사용 여부 검증 (5건 샘플)
- [ ] DESIGN.md 형식 출력이 getdesign.md 라이브러리 항목과 호환

---

## 6. 리스크 + 완화

| 리스크 | 가능성 | 영향 | 완화 |
|---|---|---|---|
| Figma Config 2025 Q3 출시로 차별점 약화 | 높음 | 큼 | Sprint 1~3을 8주 안에 끝내기 (속도 우선) |
| getdesign.md가 다중 레퍼런스 추가 | 중간 | 큼 | W4 레이어별 가중치를 먼저 출시해 점유 |
| W2 DTCG 변환에서 enum/role 손실 | 낮음 | 중 | DTCG `$extensions` 필드 활용 |
| 사용자 인터뷰 페르소나 P3 (디자인 시스템 엔지니어) 검증 부족 | 높음 | 중 | Sprint 2 후 인터뷰 5명 확보 |
| 비용 가시화로 사용자가 도구 사용 자체 망설임 | 중간 | 중 | "본인 키 = 본인 통제" 메시지로 회피 |

---

## 7. 단일 결정 권고

**6개월 안에 카테고리 안에서 살아남으려면**:

> **Sprint 1 (W1+W5+W15)을 2주 안에 끝내고 → 랜딩 페이지 v1 + 사용자 5명 인터뷰**

이 1단계가 가장 ROI 높고 모든 후속 작업의 검증 기반.
"결정 추적" 가시화 → "MUSE는 vibe 짐작이 아니라 contract 출력" 메시지가 김은수 ZDNet 인용 + UXPin 메타 비판과 직결.

W2 (DTCG) 와 W4 (가중치) 는 Sprint 1 결과로 "이 방향이 맞다" 검증되면 즉시 진입.

---

## 8. 다음 단계 옵션

1. **Sprint 1 코드 진입** — W1 sourceReferenceIds UI 부터 (ProjectDetailPage.jsx + ColorSwatchList 수정)
2. **랜딩 페이지 카피 v1** — 02-painpoints-qualitative-analysis.md 의 헤드라인 6 후보 + 사회적 증거 박스 3을 실제 페이지로
3. **사용자 인터뷰 5명 모집** — 페르소나 4명 cover (P1 PM/창업자, P2 시니어 디자이너, P3 디자인 시스템 엔지니어, P4 AI 코딩 헤비유저)

3개 다 병렬 가능. 어디부터 갈까요?
