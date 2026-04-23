---
session: 023
date: 2026-04-23
title: MUSE — T1/T3 아키텍처 전환 (업로드 시 T3 레벨 값 추출 + 프로젝트 시 이미지 없이 compose, Haiku 통일, 비용 ~2.5x 절감)
---

# 023. MUSE — T1/T3 아키텍처 전환 (업로드 시 T3 레벨 값 추출 + 프로젝트 시 이미지 없이 compose)

## 🎯 의도 (User Goal)

> 레퍼런스 등록 시 T3 레벨 preset (palette/typography/layout/gradient 구체값) 까지 전부 추출. 프로젝트 생성 시엔 이미지 재분석 없이 **의도 기반 조합 분석** 만 수행. Sonnet + 이미지 N장 → Haiku + 텍스트 only 로 전환해 **레퍼런스 1장 총분담 19원 → 7~8원** (~2.5배 절감).

## 🔑 주요 의사결정

- **역할 재정의**: T1 = 관찰(per-image values), T3 = 의도 기반 조합(role/emphasis 배정). "T1 은 분류만, T3 는 합성" 이 아니라 "T1 은 관찰, T3 는 결정"
- **role/emphasis 는 프로젝트 단계에만**: 단일 이미지에서 "이게 primary" 는 논리적으로 말 안 됨 (비교 대상 없음). 반대로 hex/fontFamily 추정은 단일 이미지로 가능 → T1 으로 이전
- **T3 입력 = pre-extracted JSON + intent + type, 이미지 없음**: 이미지 재분석은 중복 작업. 이미 T1 이 관찰한 값을 조합 reasoning 에 집중
- **모델 Sonnet → Haiku 다운그레이드**: 이미지 없이 텍스트 compose 만 하면 Haiku 로 충분. Sonnet 대비 출력 토큰 비용 3배 절감
- **기존 레퍼런스 전체 삭제 (truncate)**: 테스트 단계라 데이터 소량. 마이그레이션에 `extracted jsonb default '{}'` 추가 + `truncate reference_items cascade` 포함. 백필 스크립트 생략, 깔끔한 재업로드 전제
- **Haiku 로 확장 T1 시도 (옵션 A 추천 수용)**: 품질 미흡하면 Sonnet 으로 업그레이드. 확장 schema (palette/typography/layout/gradient nested object) 를 Haiku 가 처리 가능한지 실측으로 판정
- **Fixture (27장 Storybook 쇼케이스) 에 mock extracted 추가**: 프로덕션 상황과 동일하게. 결정적 생성 로직 (`FONT_FAMILY_POOL`, `PROJECT_GROUPS`, `i % ...`) 으로 27장 전부 채움
- **Tool schema 확장이 가장 큰 리스크 포인트**: Haiku 의 nested object + enum + required 조합 제약 준수 안정성. 첫 호출에서 품질 확인 후 조정
- **sourceReferenceIds 는 T3 에만**: 프로젝트 컨텍스트에서만 의미 있음 (어느 ref 에서 온 값인지 추적). T1 출력에는 없음

## 💬 Claude의 핵심 반응

- **"이미지 없이 aggregation" 이라는 표현이 오해 유발**: 사용자가 원한 건 단순 집계가 아니라 **의도 기반 조합 분석**. 용어 수정: aggregation → composition
- **이전 구현 (T1 primary + 512px T3) 은 반쪽짜리였음**: T3 가 여전히 이미지 재분석. 비용 ~17% 절감 수준이었음. 완전 전환 시 6배 절감
- **사용자가 직접 플로우 명료화 해주자 수용**: "처음부터 T3 레벨로 분석하되 토큰 아끼는 방식" = 업로드 시점 T3 추출, 프로젝트 시 text-only compose. 재질문 말고 즉시 실행
- **더블체크 먼저 진행**: 바로 코딩 말고 "심각한 오류" 후보 7개 (fontFamily 추정 한계, Haiku tool schema 크기, fixture 호환, 기존 데이터 처리 등) 나열 후 사용자 결정 3개 받은 뒤 착수

## 📂 변경된 파일

### DB

| 파일 | 종류 | 요약 |
|------|------|------|
| `supabase/migrations/20260423115623_reference_extracted_and_compose.sql` | 추가 | `reference_items.extracted jsonb default '{}'` 컬럼 + `truncate reference_items cascade` |

### AI 태스크 정의

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/data/muse/aiTasks.js` | 수정 | **T1 `TASK_AUTO_TAG`**: tool schema 에 `extracted {palette[3..6], typography[1..4], layout[0..3], gradient[0..2]}` 추가. systemPrompt 재작성 — classification + extraction 2 역할, role/emphasis 금지 명시. **T3 `TASK_ANALYZE_TOKENS`**: 이미지 입력 제거, 모델 `sonnet-4-6 → haiku-4-5`, systemPrompt 재작성 — "no images, compose from pre-extracted pool", userMessageTemplate 이미지 언급 제거 |

### 실행 래퍼

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/utils/museAiTasks.js` | 수정 | `runAutoTag` 출력에 `extracted` 포함 (tool schema 변경으로 자동). `runAnalyzeTokens` 이미지 처리 로직 전체 제거 → `extractedPool` 텍스트 payload 만 |

### Store / Mapper

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/lib/museDb.js` | 수정 | `mapReferenceFromDb/ToDb` 에 `extracted` 필드 처리 |
| `src/store/museStore.jsx` | 수정 | `addReference` / `updateReference` 가 `extracted` 필드 패스스루. UI flag (`_pending`, `_tagError`) 와 혼재 가능하게 spread 유지 |

### UI

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/components/templates/ArchivePage.jsx` | 수정 | 업로드 플로우: T1 결과의 `result.extracted` 를 `updateReference` patch 에 포함 |
| `src/stories/muse/AIPlayground.stories.jsx` | 수정 | T3 Playground 이미지 처리 제거, `extractedPool` 텍스트 payload 방식으로 동기화. 설명 "이미지 없음 (T1 extracted 기반) · Haiku" |
| `src/data/muse/references.js` | 수정 | 27장 fixture 에 mock `extracted` 결정적 생성 (FONT_FAMILY_POOL, PROJECT_GROUPS, 짝수 index 에만 gradient) |
| `src/data/muse/schemas.js` | 수정 | `ExtractedPaletteItem / ExtractedTypographyItem / ExtractedLayoutItem / ExtractedGradientItem / ExtractedValues` JSDoc typedef 추가, `Reference` 에 `extracted` 필드 |

## ✅ 최종 결과

- 업로드 시 콘솔/DB 확인: `reference_items.extracted` 에 palette/typography/layout/gradient 값 저장됨
- 프로젝트 생성 분석: Anthropic 요청 페이로드 이미지 0, 텍스트 JSON 만 (Network 탭 확인)
- 모델 통일 — T1/T2/T3 전부 Haiku 4.5 (Sonnet 호출 없음)
- 비용: 업로드 ~$0.0035 (2x), 프로젝트 N=4 ~$0.008 (6x ↓), 레퍼런스 총분담 19원 → ~7-8원
- archive 필터링 품질 향상 여지: 추후 수치 기반 추천 (유사 폰트, 유사 레이아웃) 가능
- `pnpm build` 성공

## 🔁 재현 가이드

1. **DB 마이그레이션 먼저**:
   ```bash
   supabase migration new reference_extracted_and_compose
   ```
   파일에 `alter table reference_items add column if not exists extracted jsonb not null default '{}'::jsonb;` + `truncate table reference_items cascade;`
   → `supabase db push`

2. **`aiTasks.js` T1 확장**:
   - `TASK_AUTO_TAG.toolSchema.input_schema.properties.extracted` 추가 (palette/typography/layout/gradient nested)
   - `systemPrompt` 재작성: classification + extraction 두 역할, "role/emphasis 는 project 단계" 명시, 각 extracted.* 필드 제약 나열
   - `required: ['tags', 'dominantColors', 'title', 'extracted']`

3. **`aiTasks.js` T3 재작성**:
   - `model: 'claude-sonnet-4-6' → 'claude-haiku-4-5'`
   - `input.kind: 'image+text' → 'text'`, shape 에서 imageBase64 제거
   - systemPrompt: "TEXT ONLY, no images, compose from pre-extracted pool, intent-driven role/emphasis"
   - userMessageTemplate 에서 "images below" 문구 삭제

4. **`museAiTasks.js` runAnalyzeTokens 수술**:
   - `imageBlocks` 루프 전체 삭제
   - `content = [{type:'text', text: JSON.stringify(extractedPool, null, 2) + userMessage}]` 2 블록만

5. **매퍼 + store**:
   - `museDb.js` mapReferenceFromDb/ToDb 에 `extracted` 추가
   - `museStore.jsx` `addReference` 의 reference 객체에 `extracted: fields.extracted || {}`, `updateReference` 의 dbPatch 에 `if ('extracted' in patch) dbPatch.extracted = patch.extracted`

6. **ArchivePage 업로드**:
   - `storeSlice.addReference` 호출 시 `extracted: {}` 초기값
   - T1 성공 후 `updateReference(ref.id, { ..., extracted: result.extracted || {} })`

7. **fixture 확장**: `references.js` 에 `FONT_FAMILY_POOL` 배열 + `PROJECT_GROUPS` 상수. 27장 각각에 palette (dominantColors 재활용 + label/group), typography (display+body 2개), layout (12 columns + 가변 gap), gradient (짝수 index 만) 결정적 생성

8. **Storybook Playground 동기화**: `AIPlayground.stories.jsx` T3 섹션도 동일하게 이미지 처리 제거

9. **검증**:
   - 업로드 1장 → DB row 의 `extracted` jsonb 확인
   - 프로젝트 생성 → DevTools Network → `/api/anthropic/messages` 페이로드 확인, `image` 블록 없어야 함
   - 동일 refs 로 intent 만 바꿔 2 프로젝트 생성 → role/emphasis/VD 차이 확인

> 💡 핵심 포인트:
> - **"T3 레벨" 이란 hex/CSS 같은 구체 수치를 뜻함**: 분류 태그만 있으면 T3 (지금 T1) 레벨이 아님. fontFamily / fontWeight / fontSize / columns / gap / gradient CSS 까지 포함해야 T3 레벨
> - **role/emphasis 는 비교 문맥 없이는 불가능**: 단일 이미지엔 primary/secondary 개념이 없음. 이건 프로젝트 단계로 미뤄야 개념적으로도 맞음
> - **T3 를 텍스트-only 로 돌리면 Haiku 로 다운**: Sonnet 을 쓰던 이유는 이미지 정밀 분석. 이미지가 없으면 텍스트 composition 은 Haiku 도 충분
> - **tool schema 의 nested object + enum + required**: Haiku 처리 능력이 병목. 확장할 땐 required 최소화 + enum 수 관리 필요
> - **fixture 와 production 스키마 일치**: Storybook 쇼케이스가 실제 쓰이는 상태와 동일해야 회귀 감지됨. 27장 전부 mock extracted 생성
> - **기존 데이터 초기화 (truncate) 는 migration 에 포함**: 테스트 단계에서만 가능. production 전환 때는 백필 스크립트 또는 점진적 폴백 필요
> - **비용 절감은 "어디서 뭘 하나" 재설계가 > 프롬프트 튜닝**: 17% 절감 (512px+T1 primary) vs 6x 절감 (이미지 제거). 아키텍처 수준 선택이 레버리지 큼
