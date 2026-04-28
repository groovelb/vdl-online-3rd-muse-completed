---
name: cli-test
description: T3 (concept / system / handoff) 의 production 동일 LLM 호출을 CLI 로 실행. wizard UI 거치지 않고 빠른 prompt 룰 검증. 사용자가 "/cli-test", "production 동일 호출", "실제 LLM 호출 테스트", "cli 로 테스트" 등으로 호출.
---

# cli-test Skill

> T3 production-identical CLI test runner.
> wizard UI 없이도 supabase 의 실제 reference 데이터 + 운영 system prompt + Anthropic API 직접 호출로 결과 측정.

---

## 활성화 조건

| 트리거 |
|---|
| `/cli-test concept` |
| `/cli-test system` (follow-up — 미구현 시 안내) |
| `/cli-test handoff` (follow-up — 미구현 시 안내) |
| "production 동일 호출 / 실제 LLM 호출 테스트 / cli 로 테스트해" |
| "프롬프트 룰 측정 / 외부 AI 결과 비교 위해 빠른 호출" |

⚠️ 자동 호출 금지. 사용자가 명시적으로 호출할 때만 동작.

---

## 절대 규칙 (Claude 행동 강제 — 거짓 보고 차단)

이 스킬의 존재 이유 = **Claude 가 LLM 출력을 시뮬레이션·추측·수동 작성하지 못하게 하는 시스템 차원의 강제**.

다음 4 룰은 violation 시 사용자가 즉시 식별 가능:

1. **시뮬레이션 절대 금지**: 사용자가 "이 input 으로 호출해" 라고 하면 반드시 `node scripts/cli-test/{mode}.mjs` 실행. Claude 가 "이렇게 나올 것 같다" 식 추측 답변 금지.
2. **결과 출처 헤더 강제**: 모든 출력 .md 첫 부분에 `> ✅ REAL LLM call via scripts/cli-test/{mode}.mjs` 헤더 박힘 (`_lib.mjs realCallHeader`). 사용자가 헤더 안 보이면 시뮬레이션 의심 신호.
3. **`_raw-response.json` 항상 동봉**: Anthropic API 원본 응답 그대로 저장. 사용자가 검증 가능. Claude 가 prompt 텍스트 손으로 적은 거면 이 파일 없음.
4. **"못 한다" 보고 전 반드시 시도**: 환경 자원 (`.env.local`, `supabase CLI`) 확인 → 시도 → 실패하면 정확한 에러 메시지로 보고. 시도 없이 "못 한다" / "사용자가 직접 해야" 식 미루기 답변 금지.

---

## 워크플로우 (Claude 가 따라야 할 순서)

### Step 1. 사용자 input 정제

사용자가 채팅창에 UI 복붙 또는 자연어로 input 주면 Claude 가 정제:

```json
{
  "projectName": "retro mood dashboard",
  "intent": "functional dashboard with retro mood and paper texture",
  "refs": [
    {
      "id": "248c3094-8bca-47b7-9d2f-c65dd51081bf",
      "note": "use retro style paper grained background with fixed position\n- paper texture",
      "useLayers": []
    },
    {
      "id": "88fd6205-e3d4-4cd2-9748-65941efcfaf5",
      "note": "bold & contrast typography Hierarchy",
      "useLayers": []
    },
    {
      "id": "6c113186-bbca-4010-9250-38e1a087f1ce",
      "note": "Editorial Dashboard Layout\n- blend grid and gradient background",
      "useLayers": []
    }
  ]
}
```

규칙:
- `id` = supabase reference_items.id (UUID)
- `note` = 사용자 노트 verbatim. 빈 노트면 `""`
- `useLayers` = TP4 layer chip 배열. 자동(전체)이면 `[]`
- `projectName` 빈 값이면 임의로 만들지 말고 사용자에게 1번만 확인

### Step 2. input.json 임시 저장

`scripts/cli-test/_input-{timestamp}.json` 또는 `src/result/test/_input.json` 에 저장.
input snapshot 은 결과와 같은 폴더에 저장돼 추적 가능 (`_input.json`).

### Step 3. 스크립트 실행

```bash
node scripts/cli-test/{mode}.mjs --input <path/to/input.json>
# 또는 --out <path/to/output/dir> 추가
```

**기본 출력 위치**: `src/result/test/`

### Step 4. 결과 보고

스크립트 stdout 의 핵심 정보 + 결과 파일 경로 + LLM 출력 prose 본문 (전체 또는 첨부 매칭 부분만).

❌ **금지**: 출력 prose 를 가공·요약해서 "이렇게 나왔다" 식 보고. 그대로 quote 하거나 파일 경로 안내.

### Step 5. 외부 AI 검증 안내

사용자가 결과 본문을 외부 플랫폼 (Claude Design / Gemini 등) 에 paste 후 결과 비교하는 단계는 사용자 작업. Claude 가 시뮬레이션해서 "결과는 이럴 것" 식 답 금지.

---

## 지원 mode

| Mode | 스크립트 | 상태 |
|---|---|---|
| concept | `scripts/cli-test/concept.mjs` | ✅ 구현 완료 |
| system | `scripts/cli-test/system.mjs` | ⚠️ 미구현 (follow-up) |
| handoff | `scripts/cli-test/handoff.mjs` | ⚠️ 미구현 (follow-up) |

system / handoff 호출 시 Claude 가 "미구현" 명시 + 추가 요청 시 작성 안내.

---

## Production 동일 보장 메커니즘

1. **`_lib.mjs.loadEnv()`** — `.env.local` 의 ANTHROPIC_API_KEY + VITE_SUPABASE_URL 읽음
2. **`_lib.mjs.getServiceRoleKey()`** — `pnpm supabase projects api-keys` 실행 → service_role key 자동 추출 (사용자 추가 작업 0)
3. **`_lib.mjs.fetchReferenceRows()`** — service_role key 로 RLS 우회 → reference_items 의 실제 `tags` / `dominant_colors` / `extracted` fetch
4. **`_lib.mjs.extractSystemPromptByExportName()`** — `src/data/muse/aiTasks.js` 의 해당 task 의 systemPrompt 를 fs 로 동적 추출 (production 운영 코드와 동일)
5. **user message 빌드** — `museAiTasks.runAnalyze*` 와 동일 형식 (extractedPool JSON + refNotesBlock + intent + ids)
6. **tool schema** — aiTasks.js 의 toolSchemas[0] 와 동일 (`submit_concept_prompt` / minLength / maxLength / description)
7. **Anthropic API 직접 호출** — `claude-haiku-4-5` / `tool_choice: { type: 'tool' }` / `max_tokens` production 과 동일

→ wizard 통한 호출과 차이 0. 단 wizard 의 supabase Edge Function 우회 (직접 Anthropic API). 변환 차이 없음.

---

## 한계 명시

- Edge Function 안 데이터 변환·검증·로깅이 추가되면 cli-test 가 그것을 우회. 단 현재 운영 Edge Function (`anthropic-messages`) 은 단순 proxy 라 차이 없음.
- service_role key 사용 → RLS 우회. 이는 "사용자 권한과 무관하게 모든 reference_items 접근". production 의 사용자별 RLS 통과 결과와 동일하지만 권한 시뮬레이션 X (필요 시 별도 보강).

---

## 결과 파일 명세

`src/result/test/` (기본):
- `ai-paste-block.md` — 외부 AI paste 용
- `concept-prompt.md` — 전체 가이드 + 매칭 표 + LLM 출력 본문
- `_raw-response.json` — Anthropic API 원본 응답 (검증용)
- `_input.json` — 이 호출에 사용된 input snapshot (재현용)

---

## 호출 예시 (Claude 가 사용자 input 받았을 때)

```bash
# 1. input.json 작성 (Claude 가 사용자 채팅 정제 후)
cat > /tmp/concept-input.json <<EOF
{
  "projectName": "retro mood dashboard",
  "intent": "functional dashboard with retro mood and paper texture",
  "refs": [
    { "id": "...", "note": "...", "useLayers": [] },
    ...
  ]
}
EOF

# 2. 스크립트 실행
node scripts/cli-test/concept.mjs --input /tmp/concept-input.json

# 3. 결과 src/result/test/ 에 저장됨. 결과 헤더에 "REAL LLM call" 박혀있으면 production 동일.
```

---

## 작성 원칙

### DO
- **production-identical 만 인정** — 모든 결과는 실제 Anthropic API 호출 결과
- **결과 헤더에 출처 명시** (`realCallHeader`)
- **`_raw-response.json` 항상 동봉**
- **"못 한다" 전에 시도** — 환경 자원 확인 후 시도, 정확한 에러로만 보고

### DON'T
- 시뮬레이션 / 추측 / 수동 작성 금지
- 사용자에게 "직접 해주세요" 미루기 금지 (스크립트로 자동화 가능한 경우)
- 결과 본문을 가공 / 요약 / 평가하지 말고 그대로 quote
