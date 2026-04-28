---
session: 032
date: 2026-04-28
title: MUSE — 레퍼런스별 활용 노트 + AI Paste Block + 외부 플랫폼 중립 Export 통합
---

# 032. MUSE — 레퍼런스별 활용 노트 + AI Paste Block + 외부 플랫폼 중립 Export 통합

## 🎯 의도 (User Goal)

산출물을 외부 AI 에 던질 때 두 가지 문제 해결: (1) 토큰만 보내면 시각적 뉘앙스 못 살림, (2) 레퍼런스 이미지 통째 첨부하면 불필요한 부분까지 덮어씀. 본질 = "어느 이미지의 어느 부분을 차용할지" 미명시. 이를 데이터 모델·산출물·Export 3 계층에서 동시에 해결.

## 🔑 주요 의사결정

- **per-ref note 위치 = 단일 Dialog list 편집**: ProjectDetailPage 의 "사용된 레퍼런스" 옆 ✏️ 버튼 → 모든 ref 한 화면에서 편집. 기존 Dialog 패턴(Export·Delete) 일관 + 4 layer Split spacing 보존.
- **입력 형태 = 자유 텍스트 100자만** (chip 은 wizard 의 useLayers 그대로 read-only): negative 표현은 positive 의 차집합 ("ref-001: color/layout 차용" → typography·gradient·VD 무시)으로 단순화. T3 재호출 없음.
- **paste block 생성 = 결정론적 변환 함수**: LLM 재호출 없이 Export 시점에 클라이언트에서 markdown 생성. 노트 수정 즉시 반영.
- **플랫폼 중립**: 명명 (`ai-paste-block.md`, `buildAiPasteBlock`, "AI Paste Block") 으로 한 플랫폼 편향 제거. 본문 prose 도 Claude Design / Gemini / AI Studio 어디든 동일 작동.
- **Export dropdown 미루기**: 단일 ZIP/.md 안에 paste block 자동 동봉. 플랫폼별 ZIP 분기는 사용자 실측 후 추가 검토.
- **이미지 명명 prefix**: ZIP 내부 `references/01-ref-XXX.jpg` 식 첨부 순번 prefix → paste prose 의 "첨부 1번" 매칭 단서와 정확히 일치.
- **DB 마이그레이션 신규**: `projects.reference_notes` jsonb default `{}`. 마이그레이션 즉시 적용.

## 💬 Claude의 핵심 반응

- 외부 플랫폼 3종 (Claude Design / AI Studio / Gemini) 공식 docs 조사 → markdown image 앵커가 자동 매칭된다는 보증 어디에도 없음 → **3중 표기 (앵커 + 첨부 + prose 단서)** 필수 결론. `docs/research/06-platform-output-design-strategy.md` 작성.
- Claude Design 의 handoff bundle 은 proprietary (DTCG 비호환) → MUSE handoff 산출물을 Claude Design 입력으로 던지는 시나리오는 무의미. handoff 는 Claude Code 직접 입력용으로만 가치.
- T3 재호출 회피: detail 단계에서 입력하는 `referenceNotes` 는 paste block 변환에만 영향. wizard 시점 T3 호출엔 영향 없음 (의도된 흐름).
- 명명 중립화 self-check 누락 — 사용자 지적 후 즉시 `claude-design-paste.md` → `ai-paste-block.md` 일괄 변경.

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `supabase/migrations/20260428140000_projects_reference_notes.sql` | 추가 | `projects.reference_notes` jsonb 컬럼 추가, 원격 적용 완료 |
| `src/lib/museDb.js` | 수정 | `mapProjectFromDb` / `mapProjectToDb` referenceNotes 처리 |
| `src/store/museStore.jsx` | 수정 | `addProject` full 에 referenceNotes, `updateProject` dbPatch 처리 |
| `src/data/muse/schemas.js` | 수정 | Project typedef + DecisionRationale.appliedReferenceNote 추가 |
| `src/data/muse/aiTasks.js` | 수정 | system prompt 에 "Per-Reference Notes" / "Reference Anchoring" 섹션 추가 (3 task 공통) |
| `src/utils/museAiTasks.js` | 수정 | `buildReferenceNotesBlock` 헬퍼 + 3 task content 에 `${refNotesBlock}` 주입 |
| `src/utils/handoffConverters.js` | 수정 | `buildAiPasteBlock` 신규 (mode 별 분기) + `buildOrderedRefs` 헬퍼 (첨부 순번 prefix) |
| `src/utils/museExport.js` | 수정 | concept .md 본문에 paste 임베드 + system/handoff ZIP 에 `ai-paste-block.md` 동봉 + 이미지 `01-ref-XXX` prefix 명명 |
| `src/components/overlay-feedback/ReferenceNotesDialog.jsx` | 추가 | per-ref 자유 텍스트 100자 일괄 편집 Dialog (썸네일 + useLayers chip read-only + textarea) |
| `src/components/overlay-feedback/index.js` | 수정 | barrel export 추가 |
| `src/components/templates/ProjectDetailPage.jsx` | 수정 | "사용된 레퍼런스" 헤더 옆 활용 노트 편집 버튼 + 노트 인디케이터 점 + Dialog wiring |
| `src/pages/ProjectDetailRoute.jsx` | 수정 | `onUpdateReferenceNotes` prop wiring (updateProject 호출) |
| `docs/research/06-platform-output-design-strategy.md` | 추가 | 외부 플랫폼 3종 조사 + MUSE 산출물 적합성 매트릭스 + 설계 전략 |

## 🧩 컴포넌트 작업

- **신규**: `ReferenceNotesDialog` (category: `overlay-feedback`) — Dialog list 편집 패턴
- **수정**: `ProjectDetailPage` — 활용 노트 편집 진입점 + 노트 있는 ref 시각 인디케이터
- **재사용**: `Dialog`, `TextField`, `Chip`, MUI 표준

## 🧪 데이터 흐름

```
ProjectDetailPage [✏️ 활용 노트 편집]
  → ReferenceNotesDialog (각 ref 100자 textarea)
  → onSave → updateProject(id, { referenceNotes })
  → store dispatch + supabase update (jsonb)

Export 클릭
  → exportProjectAsZip (mode 분기)
    → buildAiPasteBlock (project, analysis, references)
      → buildOrderedRefs (첨부 순번 + 파일명 prefix)
      → mode 별 본문 (concept = prompt / system·handoff = 토큰 자연어)
      → 차용 정책 prose ("첨부 1번 (ref-XXX · 01-ref-XXX.jpg): 차용 [layers] — note")
    → ZIP 안에 ai-paste-block.md 동봉
    → references/01-ref-XXX.{ext} 첨부 prefix 매칭
```

## ✅ 최종 결과

빌드 통과 (1.10MB / 339KB gzip). per-ref 노트 입력 → 즉시 store + DB 반영, Export 시 paste block 에 결정론적 반영. 명명 중립 (ai-paste-block.md / buildAiPasteBlock) — 어느 외부 플랫폼이든 동일 prose 사용 가능.

## 🔁 재현 가이드 (교육생용)

1. **DB 마이그레이션 작성** (`supabase/migrations/{timestamp}_projects_reference_notes.sql`): `alter table projects add column reference_notes jsonb not null default '{}'::jsonb;` → `pnpm supabase db push`.
2. **매퍼 갱신** (`src/lib/museDb.js`): `mapProjectFromDb` 에 `referenceNotes: row.reference_notes || {}`, `mapProjectToDb` 에 `reference_notes: project.referenceNotes || {}`.
3. **store 갱신** (`src/store/museStore.jsx`): addProject full 객체에 referenceNotes, updateProject dbPatch 처리.
4. **신규 Dialog 컴포넌트** (`src/components/overlay-feedback/ReferenceNotesDialog.jsx`): props = open / onClose / usedReferences / initialNotes / useLayersByRef / onSave. 각 ref 카드 = 썸네일 96px + chip read-only + textarea (100자).
5. **ProjectDetailPage 진입점**: "사용된 레퍼런스 ({N})" 헤더 옆 `<Button startIcon={ <EditNoteIcon /> }>` + 노트 있는 ref 썸네일에 `position: absolute` 점 인디케이터. Dialog 마운트 + onSave → onUpdateReferenceNotes prop 호출.
6. **ProjectDetailRoute wiring**: useProjectsSlice 에서 updateProject 추가, `onUpdateReferenceNotes={ async (next) => updateProject(project.id, { referenceNotes: next }) }`.
7. **변환 함수 추가** (`src/utils/handoffConverters.js`): `buildOrderedRefs` (첨부 순번 + 파일명 prefix) + `buildAiPasteBlock` (mode 분기, 토큰 자연어 풀이, 차용 정책 prose).
8. **Export 통합** (`src/utils/museExport.js`): exportConceptPrompt .md 본문에 paste section 임베드 / exportProjectAsZip + exportHandoffBundle 에 `zip.file('ai-paste-block.md', buildAiPasteBlock(...))` + references 명명 `${prefix}-${ref.id}${ext}` 변경.
9. **T3 system prompt 강화** (`src/data/muse/aiTasks.js`): "Per-Reference Notes" + "Reference Anchoring" 섹션 추가. `src/utils/museAiTasks.js` 에 `buildReferenceNotesBlock` 헬퍼 + 3 task content 에 `${refNotesBlock}` 주입.
10. **빌드 검증** (`pnpm build`).

> 💡 핵심 포인트: **차집합 단순화** — negative 별도 필드 없이 "positive layer 외 무시" 로 표현. UI 단순 + LLM 인식 명확. **명명 중립** — 한 플랫폼 (Claude Design / Gemini 등) 으로 박지 말고 `ai-paste-block` 처럼 범용 표현 사용. **결정론적 변환** — paste block 은 LLM 재호출 없이 클라이언트 함수가 토큰 + 노트 + ref 첨부 순번을 결합 → 사용자 노트 수정 즉시 갱신.
