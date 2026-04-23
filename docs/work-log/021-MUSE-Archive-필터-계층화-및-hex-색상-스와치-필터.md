---
session: 021
date: 2026-04-23
title: MUSE — Archive 필터 계층화 + hex 색상 스와치 필터 + 카드 dominantColors 노출
---

# 021. MUSE — Archive 필터 계층화 + hex 색상 스와치 필터 + 카드 dominantColors 노출

## 🎯 의도 (User Goal)

> T1 은 이미 색상 카테고리 태그와 dominantColors(hex) 를 추출해 DB 에 저장하고 있는데, 카드/필터 UI 가 이걸 제대로 노출하지 않아 "색상 태깅 안 하는 것처럼" 보였음. UI 를 레퍼런스 메타데이터 구조와 동일한 수준(레이어별 계층)으로 재구성하고, 색상 필터는 태그명이 아닌 **실제 hex swatch** 로 동작하도록 개편.

## 🔑 주요 의사결정

- **데이터는 그대로, UI 만 재배치**: T1 스키마/DB 컬럼 무변경. `tags.color`(Muted/Deep) 와 `dominantColors`([hex]) 모두 저장되고 있었음. 노출 방식만 문제였음
- **ImageCard 에 `dominantColors` prop 추가 (non-breaking)**: 미전달 시 기존 동작 유지. 전달 시 제목 아래 14px 원형 swatch 상위 5개 렌더
- **필터를 3단 슈퍼섹션 계층으로**: `색상` / `디자인 레이어` / `비주얼 디렉션`. 각 슈퍼섹션 내부에 sub row (타이포/레이아웃/그라디언트 · 장르/스타일/주제). 좌측 border-left 2px 로 들여쓰기 시각화
- **색상 필터 = hex swatch 기반, 태그명 아님**: `tags.color` (Muted/Deep 같은 enum 분류) 는 필터 UI 에서 제거. 대신 모든 레퍼런스의 `dominantColors` 를 빈도순으로 집계해 상위 40개 swatch 노출. 클릭 시 `activeColors` 에 토글, 필터는 OR (어느 하나라도 매칭)
- **색상 필터 vs 태그 필터 조합은 AND**: 섹션 내 swatch 간 OR, 태그 체크박스 간 AND, 두 필터 간 AND. 직관적 "좁혀가기" 모델
- **`tags.color` 데이터는 유지**: 필터에서 안 보여도 T3 의 PRIMARY signal (color token 합성) 에 계속 사용됨. 검색창 텍스트 매칭에서도 잡힘. 삭제하지 않음
- **FilterSuperSection / FilterSubRow 는 파일 내부 컴포넌트**: 재사용성 낮고 ArchivePage 전용이라 별도 파일 분리 안 함. 추후 재사용 수요 나오면 components/ 로 승격
- **색상 swatch 인터랙션**: hover 시 scale 1.1 + 활성 시 primary.main 아웃라인. border 는 divider 로 밝은 색 hex 도 경계 보이게

## 💬 Claude의 핵심 반응

- **"색상 태깅 안 하는 것 같다" 진단 = UI 이슈로 귀결**: T1 시스템 프롬프트와 tool schema 가 `tags.color: string[0..3]` 과 `dominantColors: string[3..5]` 를 required 로 강제하고 있어, Anthropic 측에서 valid output 생성 보장됨. 즉 생성은 되는데 화면에 안 띄운 상태
- **ImageCard 는 공유 컴포넌트라 `dominantColors` prop 은 optional default [] 로**: 기존 호출처(MoodboardCard 썸네일 등) 영향 0
- **text 태그 색상 vs hex 색상 양쪽 다 유지 제안**: T3 합성에서 카테고리 태그는 추상적 방향 지시용 (Sonnet 의 LLM 토큰이 "muted" 해석 가능), hex 는 구체 값. 둘이 보완 관계라 삭제 없이 필터 UI 에서만 hex 로 단일화

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/components/card/ImageCard.jsx` | 수정 | `dominantColors = []` prop 추가, 제목 아래 원형 swatch row (14px × 최대 5개) 렌더. `hasContent` 판정에 포함. JSDoc 갱신 |
| `src/components/templates/ArchivePage.jsx` | 수정 | `activeColors` state, `paletteSwatches` useMemo (빈도 집계), `toggleColor` / `resetAllFilters` / `totalActiveFilters`. 필터 UI 3단 계층 재구성 (`FilterSuperSection` / `FilterSubRow` 내부 컴포넌트). 색상 섹션을 hex swatch 로 전환, 태그 색상 섹션 제거. `filtered` 에 `activeColors` 조건 AND 추가, Masonry `hasMore` / `emptyContent` 도 activeColors 반영 |

## 🧩 컴포넌트 작업

- **수정**: `ImageCard` — `dominantColors` prop 추가 (non-breaking, optional)
- **내부 컴포넌트 신규**: `FilterSuperSection`, `FilterSubRow` — ArchivePage.jsx 내 정의 (재사용 수요 없음)

## ✅ 최종 결과

- Archive 그리드: 각 카드 제목 아래 **hex 원형 swatch 3-5개** 상시 노출 → 팔레트 즉시 식별
- 필터 영역:
  - 최상단 `색상` 섹션 — 모든 레퍼런스의 dominantColors 빈도순 상위 40개를 **26px 클릭 가능 swatch** 로 노출
  - `디자인 레이어` 섹션 — typography / layout / gradient chip
  - `비주얼 디렉션` 섹션 — genre / style / subject chip
- 필터 조합: swatch OR + 태그 AND + 두 필터 간 AND
- 활성 필터 개수 통합 표시 (`필터 초기화 (3)`)

## 🔁 재현 가이드

1. **증상 파악**: 카드 UI 에 색상 태그가 간헐적으로 보이고 hex swatch 는 전혀 없음 → T1 출력 스키마 확인 → 데이터는 이미 다 있음을 검증 → UI 이슈로 귀결
2. **ImageCard 에 swatch row 추가**:
   - `dominantColors = []` prop (optional)
   - `title` 아래 `Box` 에 가로 배치, 14×14px 원형 (`borderRadius: '50%'`), `bgcolor: hex`, divider border, 상위 5개 slice
   - `hasContent` 판정에 `dominantColors.length > 0` 포함 → content padding 유지
3. **ArchivePage 에 `paletteSwatches` useMemo**: 모든 ref 의 dominantColors 를 `Map<hex, count>` 로 집계, 빈도 내림차순 정렬. `toLowerCase()` 로 대소문자 정규화
4. **`activeColors` state 추가** + `toggleColor(hex)` 핸들러
5. **`filtered` 필터 조건 확장**: `activeColors.some(c => ref.dominantColors.includes(c))` — OR 매칭
6. **필터 UI 3단 계층 재구성**:
   - `FilterSuperSection(label, children)` — overline label + `borderLeft: '2px solid divider'` 로 감싼 children
   - `FilterSubRow(label, children)` — 56px caption label + chip row
   - 색상 섹션은 FilterSubRow 안 쓰고 swatch grid 직접 렌더
7. **슈퍼섹션 순서** = 색상 → 디자인 레이어 → 비주얼 디렉션. 각 슈퍼섹션은 내부 태그가 하나라도 있을 때만 렌더
8. **`totalActiveFilters` = activeTags.length + activeColors.length`**, 초기화 버튼은 `resetAllFilters()` 한 번에
9. **Masonry `hasMore` / `emptyContent` 분기 조건에 `activeColors.length` 추가** — 색상만 필터했을 때도 동작 일관성
10. `ImageCard` 호출처에 `dominantColors={item.dominantColors || []}` 전달

> 💡 핵심 포인트:
> - **"AI 태깅 안 되는 것 같다"** 같은 체감 이슈는 실제로 UI 가 데이터를 surface 안 한 경우가 다수. DB 로우부터 확인하고 시작
> - **hex swatch 필터는 시각 기반 필터링의 표준 패턴** — 추상 단어("Muted") 보다 즉시 이해됨. 단, 같은 "muted" 계열이라도 hex 가 미세하게 다르면 OR 매칭 누락 가능. 유사색 클러스터링은 향후 개선 여지
> - **슈퍼섹션/서브행 계층은 border-left 한 줄로 충분**: 인덴트 + 색 가중치로 시각 계층 형성. 배경색 음영은 과도
> - **필터 조합 의미(OR/AND)** 는 문서화 없이도 직관적 → swatch 는 "어느 하나라도" 느낌, chip 은 "모두" 느낌. UI 배치만으로도 전달됨
> - **태그 데이터는 필터에서 빼도 저장은 유지**: T3 합성과 텍스트 검색에 여전히 필요. UI 노출 여부와 DB 보존은 별개 결정
