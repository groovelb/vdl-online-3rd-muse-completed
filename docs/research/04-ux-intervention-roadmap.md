# MUSE UX 최소 개입 로드맵 — 사용자 의도를 UX에 심기

> 작성일: 2026-04-28
> **2026-04-28 수정 1**: TP1 폐기. 사유는 §TP1 섹션.
> **2026-04-28 수정 2**: TP5 폐기 (Step 3 하단 버튼이 흡수). Step 3 (활용 노트, RefinementNotesField) 신규 도입 — Progressive Narrowing의 핵심.
> 근거: `01-design-md-painpoints-raw.md` (52건 출처) + `02-painpoints-qualitative-analysis.md` (4 super-themes) + `03-product-priority-roadmap.md` (15개 작업 후보)
> 결정 방향: **퍼포먼스 파인튜닝보다 UX 자체에 의도가 들어가는 방향으로**
> 핵심 원칙: 큰 화면 신규 X. 기존 입력 지점에 "왜?" 질문을 끼워 넣음. UX 자체가 사용자 주도권을 일깨우고 결과 디테일을 끌어올림.

---

## 0. 의사결정 배경 (잊지 말기)

### 사용자가 명시적으로 말한 4가지 가치
1. **디자인 주도권을 사용자가 스스로 일깨움** — AI가 결정하는 게 아니라 사용자가 결정한다는 자세
2. **사용 목적성 구체화** — "막연히 도구 켰다" → "이 목적으로 이 모드를 켰다"
3. **최종 산출물 방향성 향상** — 모드+가중치마다 결과가 명백히 다름
4. **결과 디테일 향상** — 모든 결정에 출처 + 이유 + 대안

### 정성 분석에서 검증된 페인포인트와의 매핑
- T1 "왜 그랬는지 모름" → TP1·TP6이 직격
- T2 "단일 입력의 단조로움" → TP2·TP4가 직격
- T3 "통제권 상실" → TP2·TP3·TP5가 직격
- T4 "AI는 craft 대체 못함" → 전체 접근 자체가 craft 보존

### 거부한 대안
- "Stage A~F 새 화면" 접근 (이전 라운드에서 제안) — 사용자에게 "다시 배워라" 부담
- "TP 하나만 시연 후 검증" — 검증 먼저 접근, 사용자 의도와 다름
- "프롬프트 시뮬레이션만" — UX 통합이 아닌 알고리즘 개선

---

## 1. 핵심 원칙 (3줄)

1. **새 화면 만들지 않음.** 기존 6개 터치포인트에 "한 줄 질문"만 끼워 넣음.
2. **모든 질문은 스킵 가능.** 자동 모드는 그대로 작동. 단 답하면 결과가 명백히 좋아지는 incentive 구조.
3. **답변은 시스템 프롬프트에 그대로 흘러감.** UI에서 받은 "왜?" 한 줄이 T1/T2/T3 system prompt의 새 컨텍스트 변수가 되어 AI 출력 품질을 끌어올림.

---

## 2. 6개 터치포인트 상세

### ❌ TP1. 레퍼런스 업로드 chip — 폐기 (2026-04-28)

**폐기 사유**:
- T1은 이미지를 정보 원천으로 함. 이미지에 없는 정보를 사용자 chip이 만들어내지 못함 → 태깅 정확도 향상 효과 미미.
- aspect 분기는 양적 분포만 약간 바꿈 (palette 3-5 → 4-6). 정확도 X.
- 다운스트림 (T2 추천 / T3 합성) 영향은 TP4 (레이어 chip) 가 더 명시적·강제적으로 함 → **TP4와 중복**.
- 사용자가 chip 답해도 카드 화면에 변화 거의 없음 → "답한 게 의미 있나?" 신뢰 손상.
- 의도는 수집 시점이 아닌 **프로젝트 만들 때 (TP2 모드 + TP4 레이어)** 명확해짐. TP1은 시점 자체가 틀림.

**제거된 항목**:
- `UserIntentChipRow` 컴포넌트 + 스토리
- ArchivePage dropzone 위 chip selector
- ArchivePage ArchiveCard 안의 사후 chip
- T1 system prompt의 USER INTENT 블록
- T1 tool schema의 `extractionRationale`
- `runAutoTag(userIntent)` 인자
- `useReferenceArchive.setUserIntent`
- `Reference.userIntent`, `UserIntent` typedef
- references fixture의 userIntent 샘플

**향후 가능성**: 아카이브 100장+ 단계에서 "개인 큐레이션 메타" 필요성이 사용자로부터 명시 요청되면 그때 재도입 검토.

---

### TP2. 프로젝트 생성 모드 선택 (ProjectCreateWizard 첫 화면)
**위치**: `ProjectCreateWizard.jsx` (Step 0 신설)

**Before**: 바로 form (name, intent, type)
**After**: 첫 화면에 카드 3개

```
무엇을 만드시나요?

🎨 컨셉 잡기      🏗️ 디자인 시스템 만들기      🎯 코드 직행
"감을 잡고 싶다"   "정확한 토큰 필요"            "MUI/Tailwind로 바로"
빠른 다양성 우선   일관성·근거 우선              완전성·표준 우선
```

**모드별 분기**:
| | 컨셉 | 시스템 | 코드직행 |
|---|---|---|---|
| T2 추천 정렬 | 다양성 (서로 다른 무드) | 일관성 (조화 가능한 셋) | 완전성 (extracted 풍부한 ref) |
| T3 합성 톤 | bold/distinctive | role 엄격, contrast 검증 | naming/structure 표준 |
| Step 2~3 form | 간소 (의도 한 줄) | 상세 (5차원) | 표준 (intent + tech stack) |
| Export default | DESIGN.md 우선 | 토큰 JSON + 결정로그 | DTCG + MUI theme |

**데이터 모델 변화**:
```
project.mode = 'concept' | 'system' | 'handoff'
```

**T2/T3 system prompt 업데이트**: mode 변수 받아 정렬·검증 강도 분기.

---

### TP3. 의도 입력 (Step 1)
**위치**: `ProjectCreateWizard.jsx` Step 1

**Before**: 자유 textarea (빈칸 공포)
**After**: textarea 옆에 "예시 보기" 토글 + 시드 칩

```
의도 (한 줄로):
[차분한 다크 무드의 데이터 대시보드_______________]

💡 예시: "Y2K 풍 화려한 포스터" / "차분한 밝은 SaaS 랜딩"
🏷️ 시드 단어:  [차분] [활기] [세련] [복고] [미니멀] [편안] [긴장]
```

**시스템 프롬프트 변화 없음** (의도 텍스트 품질만 올라감).

**페인 직격**: SeedFlip "I don't know what my app should look like" 빈칸 공포 회피.

---

### TP4. Step 2 추천 + 선택 (ReferencePicker)
**위치**: `ReferencePicker.jsx`

**Before**: 카드 클릭으로 add/remove
**After**: 각 카드에 작은 chip row

```
[ref-002 thumbnail]
"Magazine + Swiss 스타일 매칭"        ← T2 reasons
🎨 색  📝 타이포  📐 레이아웃              ← T2 referenceLayer (자동)
[수동 변경]
```

- **자동**: T2가 추천한 layer 그대로
- **수동**: 사용자가 chip 토글 (이 레퍼런스에서 색만 / 레이아웃만 가져갈게)

**데이터 모델 변화**:
```
selectedRefs[].useLayers = ['color', 'typography', 'layout', 'gradient', 'visualDirection']
```

**T3 system prompt 업데이트**:
- `useLayers`에 없는 레이어는 사용자 의도적 배제. 무시 강제.
- `decisionRationale.whichRefs` 출력 시 useLayers 기반 정렬.

**페인 직격**: 시장 갭 #3 "이 레퍼런스는 컬러만, 저건 레이아웃만". 사용자 craft 보존 + 결과 디테일 동시 향상.

---

### ❌ TP5. 분석 직전 확인 박스 — 폐기 (2026-04-28)

**폐기 사유**: Step 3 (활용 노트) 하단 [분석 시작 →] 버튼이 자연스럽게 confirm 역할 흡수. 별도 step 불필요. AnalysisConfirmBox 컴포넌트 + 스토리 + barrel export 모두 제거.

---

### Step 3 (NEW). 활용 노트 — RefinementNotesField
**위치**: `ProjectCreateWizard.jsx` Step 3 (NEW)

**목적**: 레퍼런스 본 후 사용자가 명시 지시 입력. T3 합성 시 HIGHEST PRIORITY (L4 > L3 > L2 > L1).

**구성**:
- 상단: 선택된 ref 썸네일 row (시각 참조)
- textarea: maxLength 300, helperText 글자수 + 모드별 안내
- 가이드 박스: "어느 ref의 무엇 / 강조 / 변형" 3가지 + 좋은예/나쁜예
- [분석 시작 →] 버튼이 곧 confirm (TP5 흡수)

**모드별 minLength 차등**:
- `concept` = 0자 (스킵 가능, P1 비디자이너 진입 마찰 ↓)
- `system` = 30자
- `handoff` = 50자 + ref-id 포함 권장

**T3 system prompt 추가**:
```
=== User Notes (Step 3, HIGHEST PRIORITY) ===
Priority order: userNotes (L4) > useLayers (L3) > intent (L2) > mode (L1).
When userNotes conflicts with initial intent, L4 WINS.
Emit decisionRationale.appliedUserNotes ONLY for tokens directly driven by L4.
```

**기존 TP5 (폐기) 자리**: ~~분석 직전 확인 박스~~

---

### ~~TP5. Step 3 분석 직전 (확인 박스)~~ (폐기됨, 위 §TP5 폐기 참조)
**위치**: ~~`ProjectCreateWizard.jsx` Step 3 진입~~

**Before**: "분석 시작" 버튼만
**After**: 버튼 위에 confirmation 박스

```
이렇게 합성합니다:

📌 모드: 디자인 시스템 만들기
📌 의도: "차분한 다크 무드의 데이터 대시보드"
📌 우선 레이어: color (3장), typography (2장), layout (1장)
📌 예상 비용: ~$0.012

[수정하기]      [분석 시작 →]
```

**시스템 프롬프트 변화 없음**.

**페인 직격**: 비용 투명 + "내가 보낸 의도" 마지막 검증.

---

### TP6. 결과 보기 — 토큰 카드 (ProjectDetailPage)
**위치**: `ProjectDetailPage.jsx` + `ColorSwatchList.jsx` + 다른 토큰 프리뷰들

**Before**: 토큰 카드에 hex/값만 표시
**After**: 카드에 상시 출처 인디케이터 + 클릭 시 펼침

```
┌──────────────┐
│ ████ primary │
│ #14132B      │
│ ❓ from 2 refs│  ← 클릭하면 펼침
└──────────────┘
   ↓ 클릭
┌──────────────────────────────────────┐
│ primary: #14132B                      │
│ ───────────────────────────           │
│ 출처: ref-002 [썸] + ref-005 [썸]    │
│ 의도 매칭: "차분한 다크" → 짙은 색 우선 │
│ 다른 후보: ref-013 #4F46E5            │
│   (탈락: 채도 너무 높음)              │
└──────────────────────────────────────┘
```

**데이터는 이미 코드에 존재**: `aiTasks.js:565`의 `sourceReferenceIds` 필드 + T3 시스템 프롬프트의 rationale 명세. UI 가시화만 필요.

**TP1~TP5 system prompt 업데이트로 데이터 더 풍부**해진 후 진가 발휘.

**페인 직격**: 김은수 ZDNet "결과는 있지만 이유가 빠져있는 구조" 직격 해소.

---

## 3. 시스템 프롬프트 통합 변경 명세

3개 system prompt에 추가될 핵심 변수:

### T1 (runAutoTag) — 변경 없음 (TP1 폐기로 원복)

기존 동작 유지. system prompt 변화 없음. 호출 시그니처 변화 없음.
TP1 폐기 결정으로 USER INTENT 블록 + extractionRationale 출력 모두 제거됨.

### T2 (runRecommend)
```
Input 추가: projectMode
Output 추가: referenceLayer per recommendedId

Mode-aware ranking:
- "concept": prioritize diversity (서로 다른 visualDirection.style)
- "system": prioritize coherence (overlapping color/typography)
- "handoff": prioritize completeness (richest extracted data)

For each recommendedId, emit `referenceLayer` (1~2 layers this ref is most useful for).
```

### T3 (runAnalyzeTokens)
```
Input 추가: projectMode, selectedRefs[].useLayers
Output 추가: decisionRationale per token (whichRefs, whichLayers, whyChosen, alternativesConsidered)

Mode-aware composition:
- "concept": bias toward distinctive choices, allow 2 candidate primary colors
- "system": enforce role uniqueness, AAA contrast, hierarchy strict
- "handoff": optimize naming for MUI/DTCG, structure for direct import

For each ref in selectedRefs, only consume layers in `useLayers`. Other layers ignored even if extracted is present. This is user's explicit curation.

For each output token, emit `decisionRationale`:
- whichReferences: ref ids contributing
- whichLayers: from input userIntent + referenceLayer
- whyChosen: 1-line in user's intent language
- alternativesConsidered: rejected candidates with reason
```

→ AI 호출 비용은 거의 동일 (system prompt token +200~300, cache hit이라 0에 가까움).

---

## 4. 작업 순서 (확정)

### 정렬 기준
1. 사용자가 먼저 만나는 순서 (자연스러운 학습 흐름)
2. 데이터 의존성 (앞 단계 출력이 뒤 단계 입력)
3. 체감 변화 크기

### 순서

| 순서 | 작업 | 왜 이 순서 | 기간 |
|---|---|---|---|
| **1** | **TP2. 모드 선택 카드** | 모든 후속 단계의 정렬 기준이 됨. mode 변수 없으면 다른 TP의 분기 무의미 | 2~3일 |
| **2** | **TP3. 의도 시드 + 예시** | TP2 직후 화면. 빈칸 공포 즉시 해소 | 1일 |
| **3** | **TP4. 카드 layer chip** | TP2 데이터 흐름이 살아있어야 의미. 가장 핵심 차별점 | 4~6일 |
| **4** | **TP5. 분석 직전 확인 박스** | TP2~TP4 결과 종합 표시. 작업 자체는 단순 | 1일 |
| **5** | **TP6. 토큰 카드 출처 펼침** | 결과 화면. 앞 단계 system prompt 업데이트로 데이터 풍부해진 후 가시화 | 3~5일 |
| **병행** | **T2/T3 system prompt + tool schema 업데이트** | TP2·TP4 작업과 함께. 각각의 새 변수 받게 수정 (T1은 변경 없음) | 2~3일 분산 |
| ~~TP1. 레퍼런스 업로드 chip~~ | ~~사용자가 가장 먼저 만나는 입력 지점~~ | **폐기** (2026-04-28). 사유는 §TP1 섹션 참조 | — |

**총 14~24일 (3~4주)**

---

## 5. 마일스톤

### Week 1 끝
- ✅ TP2 모드 선택 작동
- ✅ TP1 레퍼런스 chip 작동
- ✅ T1 system prompt 업데이트 적용
- 🎯 사용자가 모드 고르고 레퍼런스 업로드할 때 "왜 좋아요?" 답하는 흐름 완성

### Week 2 끝
- ✅ TP3 의도 시드 작동
- ✅ TP4 카드 layer chip 작동
- ✅ T2 system prompt 업데이트 적용
- 🎯 위자드 안에서 사용자 결정이 명백히 보임

### Week 3 끝
- ✅ TP5 확인 박스 작동
- ✅ TP6 토큰 출처 펼침 작동
- ✅ T3 system prompt 업데이트 적용
- 🎯 결과 화면에 출처 + 이유 노출

### Week 4
- 🔧 QA + 미세 조정 + 사용자 시연

---

## 6. 기대 변화 (4축 측정)

### 축 1: 디자인 주도권 일깨움
- TP1 chip → 사용자가 자기 취향 의식
- TP2 모드 → "내가 지금 뭘 하려는지" 명시
- TP4 layer chip → "이 레퍼런스의 어디까지 가져올지" 결정
- **결과**: 사용자가 "AI가 만든 결과"가 아니라 "내가 결정한 결과"로 인식

### 축 2: 사용 목적성 구체화
- TP2 모드 (컨셉/시스템/코드직행)
- TP3 시드 단어
- TP5 확인 박스
- **결과**: "막연히 도구 켰다"가 아닌 "이 목적으로 이 모드"

### 축 3: 산출물 방향성 향상
- T2 모드별 정렬
- TP4 layer 가중치
- T3 모드별 합성 톤
- **결과**: 모드+가중치마다 결과가 명백히 다름

### 축 4: 디테일 향상
- T1 aspect별 추출 정밀도 ↑
- T3 decisionRationale per token
- TP6 결과 카드 출처 펼침
- **결과**: 모든 결정에 출처 + 이유 + alternatives 자동 노출

---

## 7. 검증 가능한 지표

3주 후 측정:

| 지표 | Before 가설 | After 목표 |
|---|---|---|
| 의도 입력 평균 길이 | <20자 | >40자 (시드/예시 효과) |
| Step 2 layer 수동 변경률 | 0% | >30% (사용자 결정 행동) |
| 토큰 카드 hover/click률 | 미측정 | >60% (사용자가 근거 확인) |
| T3 결과 export 비율 | 미측정 | ↑ 10pp (만족도 ↑) |
| 30일 재방문률 | 미측정 | ↑ (충성도 ↑) |

---

## 8. 위험 + 완화

| 위험 | 완화 |
|---|---|
| 질문 피로 (질문 너무 많음) | 모든 질문은 default OK. 자동 모드만 클릭해도 기존 동작 동일 |
| 비디자이너 PM 페르소나(P1) 진입 막힘 | TP2 "🎨 컨셉 잡기" 모드가 P1 진입 경로. 후속 질문 default OK 유도 |
| 시스템 프롬프트 업데이트로 기존 출력 깨짐 | 새 변수는 모두 optional. 없으면 기존 동작 |
| TP6 출처 펼침에 데이터 부족 | TP1~TP5 system prompt 업데이트가 데이터를 풍부하게 만듦 |

---

## 9. 거부한 작업 (의도적 비대응)

이 로드맵에 **포함되지 않는 작업**:

- ❌ Figma 협업 / 실시간 멀티유저 (Figma 절대 강점)
- ❌ 사진리얼 이미지 생성 (Midjourney 영역)
- ❌ Backend / DB 기능 (Lovable 영역)
- ❌ 60+ 브랜드 라이브러리 (getdesign.md 영역)
- ❌ Figma import (Figma Config 2025 Q3 발표로 따라잡기 불리)

→ 이게 MUSE의 의도적 비차별 영역. 카피에서 정직하게 인정.

---

## 10. 다음 단계

### 첫 번째 작업
**TP2. 모드 선택 카드** — `ProjectCreateWizard.jsx` 첫 화면에 3-카드 추가 + `project.mode` 데이터 모델 + T2/T3 system prompt에 mode 변수 받기

### 진행 방식
- 매 TP 완료 후 storybook에서 동작 확인
- 매 주 끝에 사용자 시연 (가능 시)
- 매 TP 완료 후 commit (history 추적)

### 시작 시점
사용자 확정 후 즉시.

---

## 부록 — 이 접근의 진짜 가치

> **사용자가 도구를 처음 켜면 "막연한 의도" 상태.**
> **도구가 작은 질문을 던지면 사용자는 답을 만들기 위해 자기 머리를 굴림.**
> **그 답이 도구에 입력되어 결과를 정밀하게 만들고, 동시에 사용자에게 "내가 결정했다"는 느낌을 줌.**

같은 시스템이지만:
- "AI가 알아서 다 함" 도구 = 결과 마음에 안 들면 도구 탓
- "AI가 묻고 사용자가 답함" 도구 = 결과 마음에 안 들면 자기 답을 다시 봄 → 도구 안에서 반복

**충성도의 차이는 craft 보존의 차이**. T4 super-theme이 정확히 이걸 가리킴.

이 로드맵의 진짜 효과는 결과 품질 향상이 아니라 **사용자의 "도구에 대한 충성도"**와 **"디자인 결정 책임감"**의 형성. 3~4주 안에 MUSE의 UX 정체성이 바뀜.
