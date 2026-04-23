---
session: 012
date: 2026-04-22
title: MUSE — 태그 프리셋 JSON 통합 + 5레이어 구조 재설계 계획 (visualDirection MD 출력)
---

# 012. MUSE — 태그 프리셋 JSON 통합 + 5레이어 구조 재설계 계획 (visualDirection MD 출력)

## 🎯 의도 (User Goal)

> (1) 사용자가 `src/data/muse/tag/`에 새로 추가한 `muse_tags_preset.json`(5 레이어 구조) + `visual_direction_template.md` 프리셋을 기존 MUSE 시스템에 통합. (2) 기존 flat `TAG_VOCABULARY` 15개 폐기, 레이어별 어휘로 전환. (3) T3 출력을 **토큰 JSON(4 레이어) + visual_direction.md (1 레이어)** 이중 산출물로 재설계. 이번 세션은 **계획 수립만**, 구현은 별도 승인 후.

## 🔑 주요 의사결정 (계획 단계)

- **5 레이어 재정의: `keyVisual` → `visualDirection` 교체**: 기존 `AnalysisLayers`의 다섯 번째 레이어였던 `keyVisual`(이미지 보드)을 폐기하고 preset의 `visual_direction`(genre/style/subject 서술 태그 + MD 출력)으로 대체. 이유: preset 설계가 이쪽이 더 풍부한 맥락 전달에 적합하고, MD 산출물이 바이브 코딩 도구 주입에 토큰 JSON과 동등한 가치를 가짐.
- **Reference.tags 스키마를 flat → 중첩 객체로**: `tags: string[]` → `tags: { color[], typography[], layout[], gradient[], visualDirection: { genre[], style[], subject[] } }`. 각 레이어 0~3개 선택, visualDirection 서브카테고리는 0~2개. 이 변경이 없으면 아카이브 필터·T2 추천 품질이 레이어 인식 없이 단일 무드 라벨에 머묾.
- **T3를 단일 호출 + 두 tool 패턴으로 구현 권장**: `submit_tokens`(JSON) + `submit_visual_direction`(MD 문자열) 두 tool을 시스템 프롬프트에서 **둘 다 호출하도록 지시**. 대안(호출 2번 분리)은 단순하지만 비용 2배 + 컨텍스트 일관성 손실. 한 호출에서 두 tool이 같은 컨텍스트를 공유해야 MD 서술과 토큰 수치가 일관됨.
- **Preset JSON은 Claude 프롬프트에 통째로 삽입 (description까지)**: 각 태그의 description이 Claude가 뉘앙스를 이해하는 데 핵심. enum 제한만으로는 "Muted"와 "Faded"의 차이를 구별하지 못함. prompt caching으로 비용 상쇄.
- **Phase 1 → 2 → 3 짧은 루프 선권장**: 데이터 구조 + T1만 먼저 새 프리셋 기반으로 돌려보고 품질 확인 후, Phase 4(T3 이중 출력)와 Phase 5(UI)는 T1 검증 뒤 착수. T3는 가장 비싸고 복잡하므로 검증 없는 선구현 금지.
- **`KeyVisualBoard` 컴포넌트는 삭제 없이 남김**: 프로젝트 상세에서 사용처는 제거되지만 컴포넌트 자체는 `components/data-display/`에 유지. 이미지 보드 패턴은 다른 맥락(예: 사용자 모음 앨범)에서 재활용 가능.

## 💬 Claude의 핵심 반응

- **사용자 표현 "키 비쥬얼 분석만 md"의 모호성 명시**: 기존 `keyVisual`(이미지 보드)과 preset의 `visual_direction` 간 개념 충돌 가능성을 지적하고, 해석(`visual_direction` 레이어를 MD로) 확인 질문을 열린 질문 #1로 제시. 해석이 틀렸으면 전체 Phase 4~6가 흔들리므로.
- **Reference.tags 재설계가 단순한 값 교체가 아니라 아키텍처 변경임을 명시**: 기존 더미 27건 마이그레이션 + 아카이브 필터 UI + T1 tool schema + Storybook 데이터 카탈로그까지 파급. Phase 단위로 분리해 한 번에 깨지지 않게 진행 추천.
- **단일 호출 vs 분리 호출의 tradeoff를 비용과 컨텍스트 일관성 축으로 정리**: 두 tool 호출 패턴을 기본안으로 제시하되 열린 질문 #2로 승인 유도. Claude API의 multi-tool-use 지원 여부는 구현 단계에서 재검증 필요 (Anthropic 문서상 지원되나 실제 호출 품질은 모델·버전 의존).
- **Phase별 난이도·비용 가중치 명시**: Phase 1 소/2 중/3 중/4 대/5 중/6 중 으로 표기해 사용자가 Phase 선택 시 투자 감을 잡도록.

## 📂 변경된 파일

코드·문서 수정 없음. 사용자 측에서 preset 파일 2건을 새로 추가한 상태.

| 파일 | 종류 | 주체 | 요약 |
|------|------|------|------|
| `src/data/muse/tag/muse_tags_preset.json` | 추가 (사용자) | 유저 | 5레이어 × 수십 태그 + description. 4 레이어는 `output_target: "token"`, visual_direction은 `"markdown"` |
| `src/data/muse/tag/visual_direction_template.md` | 추가 (사용자) | 유저 | `{{PROJECT_NAME}}` 등 placeholder 기반 Markdown 템플릿 — T3 MD 산출물 형식 |

## ✅ 최종 결과

- Preset 구조 해석 및 기존 시스템과의 차이 도출 완료.
- 6개 Phase로 구성된 재설계 계획 제시 (Phase 1 인프라 → 6 데이터 재생성).
- 열린 질문 4건 식별 (키비주얼 해석 / T3 호출 구조 / 기존 `KeyVisualBoard` 처리 / 시작 Phase).
- 구현은 사용자 승인 대기.

## 🔁 재현 가이드 (교육생용)

1. 새 프리셋 파일 2개(`muse_tags_preset.json`, `visual_direction_template.md`)를 먼저 읽고 **output_target 필드** 확인 — 이게 "JSON으로 낼지 MD로 낼지" 결정하는 한 단어.
2. 기존 `aiTasks.js`의 `TAG_VOCABULARY` 위치와 `AnalysisLayers` 구조를 확인 — 어디가 바뀌어야 하는지 인벤토리 작성.
3. 변경 범위를 **데이터 모델 → AI 호출 → UI → 기존 더미 마이그레이션** 4 축으로 쪼개 Phase 번호 부여. 각 Phase가 "혼자 돌아갈 수 있는" 단위인지 검토.
4. 큰 변경일수록 **검증 먼저** — Phase 1+2+3(데이터 + T1)이 한 바퀴 돌아야 Phase 4(T3 이원 출력) 투자 근거가 생김.
5. 계획서에 **열린 질문을 명시적으로 번호 매겨** 제시. 사용자가 질문별로 짧게 답하면 그대로 Phase 내 의사결정으로 편입.
6. 기존 자산(예: `KeyVisualBoard`)은 "사용처 제거"와 "삭제"를 분리. 재활용 가능성이 있으면 컴포넌트는 남김.

> 💡 핵심 포인트:
> - **Preset을 도입할 때 가장 먼저 볼 것 = `output_target` 필드**. 산출물 형식이 태스크 설계 전부를 좌우한다.
> - **레이어 이름 충돌은 아키텍처 변경**: "keyVisual"처럼 같은 단어가 기존 시스템과 새 프리셋에서 서로 다른 의미로 쓰이면, 단순 값 교체가 아니라 **의미 재정의 + 모든 참조 추적** 필요.
> - **Tool use 다중 호출 패턴**: 한 요청에 두 산출물이 필요하면 tools 배열에 두 개 넣고 시스템 프롬프트에서 "둘 다 호출하라"고 명시. 한 번의 컨텍스트 안에서 나와야 일관성 유지.
> - **큰 변경 전엔 열린 질문 목록 작성**: 답하지 않고 구현 시작하면 중도 방향 전환 비용이 큼. 질문 = 구현 쇼핑 리스트.
