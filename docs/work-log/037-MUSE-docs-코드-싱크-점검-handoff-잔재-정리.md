---
session: 037
date: 2026-05-01
title: docs ↔ 코드 싱크 점검 및 handoff 모드 잔재 정리
---

# 037. docs ↔ 코드 싱크 점검 및 handoff 모드 잔재 정리

## 🎯 의도 (User Goal)

> `docs/` 와 Storybook UX/data 모델 문서가 실제 코드와 싱크하는지 일괄 점검하고, 발견된 드리프트를 정리.

## 🔑 주요 의사결정

- **`max_tokens` 는 코드를 ground truth 로**: CLAUDE.md 가 `16384` 라 주장했지만 `museAiTasks.js:326` 의 `MAX_TOKENS = 8192` 가 실제값. 코드 값이 운영 진실이므로 문서를 코드에 맞춰 정정.
- **`handoff` 모드 폐기는 데이터/타입까지**: 함수 (runAnalyzeHandoff 등) 는 이미 삭제됐지만 typedef / 시드 / JSDoc / 스토리 데이터에 잔존. 함수만 지운 것이 아니라 mode 합법성 자체를 제거 (`'concept'|'system'` 만 유효).
- **em-dash 일괄 치환은 `docs/muse/` + `docs/spec/` 까지만**: CLAUDE.md AI Slop 룰은 전체 적용이지만 `docs/research/`, `docs/work-log/`, `docs/claude-knowledge/` 는 외부 인용/raw note 가 섞여 자동 치환 시 인용 손실 위험. `src/components/`, `src/stories/` 의 em-dash 도 보존 (코드 안 의미 있는 케이스 구분 필요).
- **`handoffConverters.js` → `tokenConverters.js` rename**: 폐기 용어가 system 모드의 정상 export 모듈명에 남아있는 것이 가독성/문서 신뢰도에 마찰. `git mv` 로 history 보존.
- **agent 보고 검증**: explore agent 가 max_tokens 를 `1024 (system)` 로 잘못 보고 → 직접 grep 으로 8192 확인 후 정정.

## 💬 Claude의 핵심 반응

- subagent (Explore) 보고서의 라인넘버/수치는 항상 1차 grep 으로 재검증 (특히 비슷한 숫자가 반복되는 라인 라벨링은 신뢰도 낮음).
- "함수 삭제" 와 "타입/데이터/문서까지 정리" 는 별개 단계. 폐기 선언 후엔 typedef · 시드 · JSDoc · 스토리 variant · cross-skill description 까지 grep 해 일괄 정리해야 모드 합법성이 진짜로 닫힘.
- 자동 일괄 치환 (em-dash 등) 의 안전 범위는 "사용자가 직접 작성한 활성 문서" 까지. 외부 quote/work-log 는 별도 확인 받아야 안전.

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `CLAUDE.md` | 수정 | `max_tokens 16384` → `8192` (코드 실값 동기화) |
| `src/data/muse/schemas.js` | 수정 | `ProjectMode` typedef 에서 `'handoff'` 제거 |
| `src/data/muse/projects.js` | 수정 | 시드 프로젝트 `mode: 'handoff'` → `'system'` |
| `src/data/ruleRelationships.js` | 수정 | cli-test 스킬 description 의 `(concept / system / handoff)` 정리 |
| `src/components/card/ModeSelectCard.jsx` | 수정 | JSDoc mode prop 타입 정리 |
| `src/components/card/ModeSelectCard.stories.jsx` | 수정 | `HandoffSelected` story 제거, grid 3→2 col |
| `src/components/card/ReferenceLayerChipRow.jsx` | 수정 | JSDoc + example mode 정리 |
| `src/components/templates/ReferencePicker.jsx` | 수정 | JSDoc mode prop 정리 |
| `src/components/input/RefinementNotesField.stories.jsx` | 수정 | `Filled_Handoff` → `Filled_System_Long` |
| `src/components/data-display/index.js` | 수정 | DESIGN.md preview 코멘트 정리 |
| `src/utils/handoffConverters.js` → `src/utils/tokenConverters.js` | rename + 수정 | `git mv`. 모듈 헤더 docstring 8 산출물로 갱신 |
| `src/utils/museExport.js` | 수정 | import 경로 갱신 + ZIP export 코멘트 정리 |
| `src/components/overlay-feedback/ThemeExportDialog.jsx` | 수정 | import 경로 갱신 |
| `src/components/data-display/DesignMdPreview.jsx` | 수정 | import 경로 갱신 |
| `src/stories/muse/Projects.stories.jsx` | 수정 | mode 타입 표 정리 |
| `src/stories/muse/AITasks.stories.jsx` | 수정 | T3 IO 표 4곳 (mode / userNotes / layerDetails / Export 노트) |
| `src/stories/overview/UXIntent.stories.jsx` | 수정 | minLength 표기 정리 |
| `docs/muse/*.md` (6 파일) | 수정 | em-dash 119건 → `.` 로 일괄 치환 |
| `docs/spec/design-md-alpha.md` | 수정 | em-dash 12건 → `.` 로 일괄 치환 |

총 24 파일, 167+/176- (rename 1).

## 🧩 컴포넌트 작업

- **수정 (정리 only, 동작 변경 없음)**: `ModeSelectCard`, `ReferenceLayerChipRow`, `ReferencePicker`, `RefinementNotesField` (스토리 데이터), `ThemeExportDialog`, `DesignMdPreview`. 모두 JSDoc / story variant / import 경로 정리.
- **삭제**: `ModeSelectCard.stories.jsx` 의 `HandoffSelected` story.
- **rename**: `handoffConverters.js` → `tokenConverters.js` (export 10개, 약 773줄. system 모드 ZIP bundle 의 핵심 모듈).

## ✅ 최종 결과

8 단계 정리 + rename 완료. 검증: `grep -r "handoff"` 로 잔재 0 (handoffConverters 참조 모두 tokenConverters 로 갱신됨), eslint 에서 신규 위반 0 (기존 `inferExt unused` 만 잔존, 이번 작업 무관).

## 🔁 재현 가이드 (교육생용)

1. **싱크 점검 호출**: "@docs/ 및 스토리북의 ux, data 모델에 저장된 문서 내용들이 전체 코드와 싱크하는지 점검해봐 ultrathink" 식으로 요청.
2. **Explore agent 위임**: docs 핵심 파일 (`docs/muse/*.md`, `docs/spec/*.md`) + 미러 .mdx + 핵심 스토리 (`src/stories/muse/*.stories.jsx`) 를 한 번에 cross-check 하도록 prompt 작성. CLAUDE.md "Current Status" 의 주장 항목을 A~I 로 나눠 verdict (✅/⚠️/❌) + file:line 근거 요구.
3. **agent 결과 검증**: 라인넘버/수치 (특히 `max_tokens` 같은 작은 숫자) 는 직접 `grep -n "max_tokens" src/utils/museAiTasks.js` 로 재확인. agent 가 틀릴 수 있음.
4. **드리프트 정리**: 영향도 순으로 진행. (a) CLAUDE.md 수치 동기화 → (b) `handoff` 시드 데이터 (`projects.js`) → (c) typedef (`schemas.js`) → (d) 컴포넌트 JSDoc 5곳 → (e) 모듈/주석 3곳 → (f) 스토리 데이터 + MDX → (g) `ruleRelationships.js`.
5. **em-dash 일괄 치환** (`docs/muse/`, `docs/spec/`):
   ```bash
   python3 -c "
   p = 'path.md'
   s = open(p).read().replace(' — ', '. ').replace('— ', '. ').replace(' —', '.').replace('—', '.')
   open(p, 'w').write(s)
   "
   ```
6. **rename**: `git mv src/utils/handoffConverters.js src/utils/tokenConverters.js` → import 사이트 3곳 갱신 (`museExport.js`, `ThemeExportDialog.jsx`, `DesignMdPreview.jsx`) → 모듈 헤더 docstring 갱신.
7. **검증**: `grep -rn "handoff" src/` 가 빈 결과면 OK. `pnpm exec eslint <changed files>` 신규 위반 0 확인.

> 💡 핵심 포인트: "함수 삭제 = 폐기 완료" 가 아니다. typedef / 시드 데이터 / JSDoc / 스토리 variant / cross-skill description 까지 닫아야 모드 합법성이 진짜로 제거된다. agent 보고는 항상 1차 grep 으로 검증.
